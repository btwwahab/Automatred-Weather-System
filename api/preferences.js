module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // In a real app, you'd use a database. For now, we'll use localStorage on frontend
  try {
    if (req.method === 'GET') {
      // Return default preferences structure
      const defaultPreferences = {
        temperatureUnit: 'celsius',
        theme: 'dark',
        notifications: true,
        autoLocation: true,
        favorites: [],
        weatherHistory: []
      };
      return res.status(200).json(defaultPreferences);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const preferences = req.body;
      // In a real app, save to database
      return res.status(200).json({ success: true, preferences });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Preferences API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};