// api/proxy/[...path].js
import axios from "axios";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const path = "/" + (req.query.path ? req.query.path.join("/") : "");
    const { path: _p, ...rest } = req.query;
    const qs = new URLSearchParams(rest).toString();

    const EC2_BACKEND = process.env.EC2_BACKEND_URL || "http://3.109.2.225:3001";
    const backendUrl = `${EC2_BACKEND}${path}${qs ? `?${qs}` : ""}`;

    const response = await axios({
      method: req.method,
      url: backendUrl,
      data: req.body,
      headers: { "Content-Type": "application/json" },
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) return res.status(error.response.status).json(error.response.data);
    return res.status(500).json({ error: "Proxy failed", message: error.message });
  }
}
