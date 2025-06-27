module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city, lat, lon, type = 'current' } = req.query;
  
  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: 'City or coordinates required' });
  }

  try {
  // Add support for reverse geocoding
  if (type === 'geocode' && lat && lon) {
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const response = await fetch(geocodeUrl);
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  }

  let url;
  const apiKey = process.env.WEATHER_API_KEY;

    switch (type) {
      case 'forecast':
        url = city 
          ? `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
          : `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        break;
      case 'alerts':
        url = city 
          ? `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
          : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        break;
      default:
        url = city 
          ? `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
          : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Weather data not found');
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Weather API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};