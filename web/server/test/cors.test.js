import request from "supertest";
import app from "../src/app.js";

test("CORS should allow localhost:5173", async () => {
  const res = await request(app)
    .get("/health")
    .set("Origin", "http://localhost:5173");

  expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
});
