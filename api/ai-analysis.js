module.exports = async (req, res) => {
  // Set CORS headers
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { weatherData } = req.body;

    if (!weatherData) {
      return res.status(400).json({ error: 'Weather data is required' });
    }

const weatherPrompt = `You are ARIA (Atmospheric Research Intelligence Assistant), an advanced AI weather analyst. Analyze this atmospheric data with the precision of a next-generation weather intelligence system:

ATMOSPHERIC SCAN RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 LOCATION: ${weatherData.name}
🌡️ TEMPERATURE: ${Math.round(weatherData.main.temp)}°C
🫥 PERCEIVED TEMP: ${Math.round(weatherData.main.feels_like)}°C
🌤️ CONDITIONS: ${weatherData.weather[0].description}
💧 HUMIDITY LEVEL: ${weatherData.main.humidity}%
💨 WIND VELOCITY: ${Math.round(weatherData.wind.speed * 3.6)} KM/H
👁️ VISIBILITY: ${Math.round(weatherData.visibility / 1000)} KM
🌎 COORDINATES: ${weatherData.coord.lat}°, ${weatherData.coord.lon}°
🏔️ ATMOSPHERIC PRESSURE: ${weatherData.main.pressure} hPa
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your response should have two distinct parts separated by "===RECOMMENDATIONS===":

PART 1: Provide a sophisticated atmospheric analysis in exactly 2-3 sentences that sounds like it's from an advanced AI weather system. Focus on current atmospheric conditions and their implications.

PART 2: List exactly 3 personalized recommendations based on these weather conditions. Each recommendation must start with a single emoji (such as 🧥, 🏃‍♂️, ☂️, etc.) followed by a space and then provide specific actionable advice for clothing, activities, or health precautions based on the weather.

Format each recommendation on a separate line. For example:
🧥 Recommendation text here
🌂 Another recommendation here
🏖️ Third recommendation here

Format your response like an AI system report with technical precision but human readability. Use scientific terminology appropriately.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: weatherPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Check if the response has the expected structure
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error('Invalid response structure from AI service');
    }
    
    return res.status(200).json({ analysis: result.choices[0].message.content });
  } catch (error) {
    console.error('AI Analysis API Error:', error);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message || 'Something went wrong'
    });
  }
};