// api/proxy.js
import axios from 'axios';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { query } = req;
    const path = req.url.split('/api/proxy')[1] || '';
    const queryString = new URLSearchParams(query).toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    
    const EC2_BACKEND = process.env.EC2_BACKEND_URL || 'http://3.109.2.225:3001';
    const backendUrl = `${EC2_BACKEND}${fullPath}`;
    
    console.log('🔄 Proxying:', req.method, backendUrl);

    const response = await axios({
      method: req.method,
      url: backendUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Success:', response.status);
    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Proxy failed',
        message: error.message,
      });
    }
  }
}