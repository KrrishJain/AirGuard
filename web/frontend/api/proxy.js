// api/proxy.js

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extract the path after /api/proxy
    // Example: /api/proxy/api/aqi-history → /api/aqi-history
    const path = req.url.replace('/api/proxy', '');
    
    // Your EC2 backend URL
    const backendUrl = `http://3.109.2.225:3001${path}`;
    
    console.log('🔄 Proxying request to:', backendUrl);
    console.log('📝 Method:', req.method);
    console.log('📦 Body:', req.body);

    // Forward the request to your EC2 backend
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? JSON.stringify(req.body) 
        : undefined,
    });

    // Get the response from EC2
    const data = await response.json();
    
    console.log('✅ Response from backend:', response.status);
    
    // Send it back to the browser
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy failed', 
      message: error.message 
    });
  }
}
```

---

## 3. What Does This File Do?

Think of it as a **middleman** that runs on Vercel
```
