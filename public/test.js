// Enhanced Neural Weather Intelligence System
class WeatherIntelligence {
    constructor() {
        this.currentWeatherData = null;
        this.preferences = this.loadPreferences();
        this.favorites = this.loadFavorites();
        this.weatherHistory = this.loadWeatherHistory();
        this.watchId = null;
        this.initializeApp();
    }

    // Initialize the application
    async initializeApp() {
        this.initializeElements();
        this.createNeuralNetwork();
        this.setupEventListeners();
        await this.checkGeolocation();
        this.updateDisplay();
    }

    // Initialize DOM elements
    initializeElements() {
        this.elements = {
            cityInput: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            weatherContent: document.getElementById('weatherContent'),
            aiContent: document.getElementById('aiContent'),
            temperatureDisplay: document.getElementById('temperature'),
            cityName: document.getElementById('cityName'),
            weatherDescription: document.getElementById('weatherDescription'),
            weatherIcon: document.getElementById('weatherIcon'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            visibility: document.getElementById('visibility'),
            feelsLike: document.getElementById('feelsLike')
        };

        // Add new elements to DOM
        this.addNewUIElements();
    }

    // Add new UI elements for enhanced features
    addNewUIElements() {
        const container = document.querySelector('.container');
        
        // Add forecast panel
        const forecastPanel = document.createElement('div');
        forecastPanel.className = 'forecast-panel';
        forecastPanel.id = 'forecastPanel';
        forecastPanel.innerHTML = `
            <div class="panel-header">
                <div class="panel-icon">📅</div>
                <div class="panel-title">7-DAY NEURAL FORECAST</div>
            </div>
            <div class="forecast-content" id="forecastContent">
                🔮 Initialize atmospheric scan to activate forecast protocol...
            </div>
        `;

        // Add favorites panel
        const favoritesPanel = document.createElement('div');
        favoritesPanel.className = 'favorites-panel';
        favoritesPanel.id = 'favoritesPanel';
        favoritesPanel.innerHTML = `
            <div class="panel-header">
                <div class="panel-icon">⭐</div>
                <div class="panel-title">FAVORITE LOCATIONS</div>
                <button class="add-favorite-btn" id="addFavoriteBtn">+ ADD</button>
            </div>
            <div class="favorites-content" id="favoritesContent">
                <div class="empty-favorites">📍 No favorite locations saved</div>
            </div>
        `;

        // Add preferences modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop hidden';
        modalBackdrop.id = 'modalBackdrop';

        // Add preferences panel
        const preferencesPanel = document.createElement('div');
        preferencesPanel.className = 'preferences-modal hidden';
        preferencesPanel.id = 'preferencesPanel';
        preferencesPanel.innerHTML = `
            <div class="preferences-container">
                <div class="panel-header">
                    <div class="panel-icon">⚙️</div>
                    <div class="panel-title">NEURAL PREFERENCES</div>
                    <button class="close-preferences-btn" id="closePreferencesBtn">✕</button>
                </div>
                <div class="preferences-content">
                    <div class="preference-group">
                        <label>Temperature Unit:</label>
                        <select id="temperatureUnit">
                            <option value="celsius">Celsius (°C)</option>
                            <option value="fahrenheit">Fahrenheit (°F)</option>
                            <option value="kelvin">Kelvin (K)</option>
                        </select>
                    </div>
                    <div class="preference-group">
                        <label>Theme:</label>
                        <select id="themeSelect">
                            <option value="dark">Neural Dark</option>
                            <option value="light">Light Mode</option>
                            <option value="auto">Auto-Adaptive</option>
                        </select>
                    </div>
                    <div class="preference-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="autoLocation"> 
                            <span>Auto-detect location</span>
                        </label>
                    </div>
                    <div class="preference-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="notifications"> 
                            <span>Weather notifications</span>
                        </label>
                    </div>
                </div>
            </div>
        `;

        // Add controls bar (removed voice and compare buttons)
        const controlsBar = document.createElement('div');
        controlsBar.className = 'controls-bar';
        controlsBar.innerHTML = `
            <button class="control-btn" id="locationBtn" title="Current Location">📍</button>
            <button class="control-btn" id="favoritesBtn" title="Favorites">⭐</button>
            <button class="control-btn" id="preferencesBtn" title="Preferences">⚙️</button>
        `;

        // Insert new elements
        const aiPanel = document.getElementById('aiPanel');
        if (aiPanel) {
            container.insertBefore(forecastPanel, aiPanel);
            container.insertBefore(favoritesPanel, aiPanel);
        } else {
            container.appendChild(forecastPanel);
            container.appendChild(favoritesPanel);
        }
        
        // Add modal backdrop and preferences to body
        document.body.appendChild(modalBackdrop);
        document.body.appendChild(preferencesPanel);
        
        const searchInterface = document.querySelector('.search-interface');
        if (searchInterface) {
            searchInterface.appendChild(controlsBar);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Original search functionality
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // New control buttons (removed voice and compare)
        document.getElementById('locationBtn')?.addEventListener('click', () => this.getCurrentLocation());
        document.getElementById('favoritesBtn')?.addEventListener('click', () => this.toggleFavorites());
        document.getElementById('preferencesBtn')?.addEventListener('click', () => this.openPreferences());
        document.getElementById('addFavoriteBtn')?.addEventListener('click', () => this.addCurrentLocationToFavorites());
        document.getElementById('closePreferencesBtn')?.addEventListener('click', () => this.closePreferences());

        // Modal backdrop click to close
        document.getElementById('modalBackdrop')?.addEventListener('click', () => this.closePreferences());

        // Preferences changes (removed voice commands)
        document.getElementById('temperatureUnit')?.addEventListener('change', (e) => this.updatePreference('temperatureUnit', e.target.value));
        document.getElementById('themeSelect')?.addEventListener('change', (e) => this.updatePreference('theme', e.target.value));
        document.getElementById('autoLocation')?.addEventListener('change', (e) => this.updatePreference('autoLocation', e.target.checked));
        document.getElementById('notifications')?.addEventListener('change', (e) => this.updatePreference('notifications', e.target.checked));
    }

    // Handle search with enhanced features
    async handleSearch() {
        const city = this.elements.cityInput.value.trim();
        if (!city) {
            this.showError('🔍 SCAN ERROR: Please enter a valid location identifier');
            return;
        }

        await this.fetchWeatherData(city);
        this.saveToHistory(city);
    }

    // Enhanced weather data fetching
    async fetchWeatherData(city, coordinates = null) {
        try {
            this.showWeatherLoading();
            
            // Fetch current weather
            const currentUrl = coordinates 
                ? `/api/weather?lat=${coordinates.lat}&lon=${coordinates.lon}`
                : `/api/weather?city=${encodeURIComponent(city)}`;
            
            const currentResponse = await fetch(currentUrl);
            if (!currentResponse.ok) throw new Error('Location not found');
            
            const currentData = await currentResponse.json();
            this.currentWeatherData = currentData;
            
            // Fetch forecast
            const forecastUrl = coordinates 
                ? `/api/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&type=forecast`
                : `/api/weather?city=${encodeURIComponent(city)}&type=forecast`;
            
            const forecastResponse = await fetch(forecastUrl);
            const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
            
// Display data
this.displayWeather(currentData);
if (forecastData) this.displayForecast(forecastData);

// Get AI insights (which now includes recommendations)
setTimeout(() => {
    this.getAIInsights();
}, 1000);

        } catch (error) {
            this.showError('❌ SCAN FAILED: ' + error.message);
            console.error('Weather fetch error:', error);
        }
    }

    // Display 7-day forecast
    displayForecast(forecastData) {
        const forecastContent = document.getElementById('forecastContent');
        const dailyForecasts = this.processForecastData(forecastData);
        
        forecastContent.innerHTML = `
            <div class="forecast-grid">
                ${dailyForecasts.map(day => `
                    <div class="forecast-day">
                        <div class="forecast-date">${day.date}</div>
                        <div class="forecast-icon">${this.getWeatherIcon(day.icon)}</div>
                        <div class="forecast-temp">
                            <span class="forecast-high">${Math.round(day.maxTemp)}°</span>
                            <span class="forecast-low">${Math.round(day.minTemp)}°</span>
                        </div>
                        <div class="forecast-desc">${day.description}</div>
                        <div class="forecast-details">
                            <div>💧 ${day.humidity}%</div>
                            <div>💨 ${Math.round(day.windSpeed)} km/h</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Process forecast data into daily summaries
    processForecastData(forecastData) {
        const dailyData = {};
        
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            
            if (!dailyData[dayKey]) {
                dailyData[dayKey] = {
                    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    temps: [],
                    humidity: [],
                    windSpeed: [],
                    descriptions: [],
                    icons: []
                };
            }
            
            dailyData[dayKey].temps.push(item.main.temp);
            dailyData[dayKey].humidity.push(item.main.humidity);
            dailyData[dayKey].windSpeed.push(item.wind.speed * 3.6);
            dailyData[dayKey].descriptions.push(item.weather[0].description);
            dailyData[dayKey].icons.push(item.weather[0].icon);
        });

        return Object.values(dailyData).slice(0, 7).map(day => ({
            date: day.date,
            maxTemp: Math.max(...day.temps),
            minTemp: Math.min(...day.temps),
            humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
            windSpeed: day.windSpeed.reduce((a, b) => a + b) / day.windSpeed.length,
            description: day.descriptions[0],
            icon: day.icons[0]
        }));
    }

    // Generate personalized recommendations
    generateRecommendations() {
        if (!this.currentWeatherData) return;

        const { main: { temp, humidity }, weather: [{ description }], wind: { speed } } = this.currentWeatherData;
        const recommendations = [];

        // Activity suggestions based on weather
        if (temp > 25 && humidity < 60) {
            recommendations.push('🏃‍♂️ Perfect conditions for outdoor sports and activities');
        } else if (temp < 10) {
            recommendations.push('🧥 Layer up! Indoor activities recommended');
        } else if (description.includes('rain')) {
            recommendations.push('☔ Great day for indoor activities, museums, or cozy cafes');
        }

        // Clothing suggestions
        if (temp > 30) {
            recommendations.push('👕 Light, breathable clothing recommended');
        } else if (temp < 5) {
            recommendations.push('🧥 Heavy winter clothing essential');
        }

        // Health recommendations
        if (humidity > 80) {
            recommendations.push('💧 High humidity - stay hydrated and seek air conditioning');
        }

        this.displayRecommendations(recommendations);
    }

    // Display recommendations
    displayRecommendations(recommendations) {
        const existingRec = document.getElementById('recommendationsPanel');
        if (existingRec) existingRec.remove();

        const recPanel = document.createElement('div');
        recPanel.id = 'recommendationsPanel';
        recPanel.className = 'recommendations-panel';
        recPanel.innerHTML = `
            <div class="panel-header">
                <div class="panel-icon">💡</div>
                <div class="panel-title">NEURAL RECOMMENDATIONS</div>
            </div>
            <div class="recommendations-content">
                ${recommendations.map(rec => `<div class="recommendation-item">${rec}</div>`).join('')}
            </div>
        `;

        document.querySelector('.container').appendChild(recPanel);
    }

    // Geolocation handling
    async checkGeolocation() {
        if (!this.preferences.autoLocation || !navigator.geolocation) return;

        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            await this.fetchWeatherData(null, { lat: latitude, lon: longitude });
        } catch (error) {
            console.log('Geolocation not available or denied');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            });
        });
    }

    // Favorites management
    loadFavorites() {
        return JSON.parse(localStorage.getItem('weatherFavorites') || '[]');
    }

    saveFavorites() {
        localStorage.setItem('weatherFavorites', JSON.stringify(this.favorites));
    }

    addCurrentLocationToFavorites() {
        if (!this.currentWeatherData) {
            alert('Please search for a location first');
            return;
        }

        const location = {
            name: this.currentWeatherData.name,
            country: this.currentWeatherData.sys.country,
            coord: this.currentWeatherData.coord,
            addedAt: new Date().toISOString()
        };

        if (!this.favorites.find(fav => fav.name === location.name)) {
            this.favorites.push(location);
            this.saveFavorites();
            this.updateFavoritesDisplay();
        }
    }

    updateFavoritesDisplay() {
        const favoritesContent = document.getElementById('favoritesContent');
        
        if (this.favorites.length === 0) {
            favoritesContent.innerHTML = '<div class="empty-favorites">📍 No favorite locations saved</div>';
            return;
        }

        favoritesContent.innerHTML = this.favorites.map((fav, index) => `
            <div class="favorite-item" data-index="${index}">
                <div class="favorite-name">${fav.name}, ${fav.country}</div>
                <div class="favorite-controls">
                    <button class="load-favorite-btn" onclick="weather.loadFavorite(${index})">Load</button>
                    <button class="remove-favorite-btn" onclick="weather.removeFavorite(${index})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    loadFavorite(index) {
        const favorite = this.favorites[index];
        this.fetchWeatherData(null, favorite.coord);
    }

    removeFavorite(index) {
        this.favorites.splice(index, 1);
        this.saveFavorites();
        this.updateFavoritesDisplay();
    }

    // Preferences management
    loadPreferences() {
        const defaultPrefs = {
            temperatureUnit: 'celsius',
            theme: 'dark',
            autoLocation: true,
            notifications: true
        };
        return { ...defaultPrefs, ...JSON.parse(localStorage.getItem('weatherPreferences') || '{}') };
    }

    savePreferences() {
        localStorage.setItem('weatherPreferences', JSON.stringify(this.preferences));
    }

    updatePreference(key, value) {
        this.preferences[key] = value;
        this.savePreferences();
        this.applyPreferences();
    }

    applyPreferences() {
        // Apply theme
        document.body.className = this.preferences.theme === 'light' ? 'light-theme' : '';
        
        // Apply temperature unit
        if (this.currentWeatherData) {
            this.displayWeather(this.currentWeatherData);
        }
    }

    // Weather history
    loadWeatherHistory() {
        return JSON.parse(localStorage.getItem('weatherHistory') || '[]');
    }

    saveToHistory(city) {
        const historyItem = {
            city,
            timestamp: new Date().toISOString(),
            weather: this.currentWeatherData
        };

        this.weatherHistory.unshift(historyItem);
        this.weatherHistory = this.weatherHistory.slice(0, 50); // Keep last 50 searches
        localStorage.setItem('weatherHistory', JSON.stringify(this.weatherHistory));
    }

    // Utility methods
    convertTemperature(temp) {
        switch (this.preferences.temperatureUnit) {
            case 'fahrenheit':
                return (temp * 9/5) + 32;
            case 'kelvin':
                return temp + 273.15;
            default:
                return temp;
        }
    }

    getTemperatureUnit() {
        switch (this.preferences.temperatureUnit) {
            case 'fahrenheit': return '°F';
            case 'kelvin': return 'K';
            default: return '°C';
        }
    }

    // Enhanced UI methods
    openPreferences() {
        const panel = document.getElementById('preferencesPanel');
        const backdrop = document.getElementById('modalBackdrop');
        
        panel.classList.remove('hidden');
        backdrop.classList.remove('hidden');
        
        // Update form values
        document.getElementById('temperatureUnit').value = this.preferences.temperatureUnit;
        document.getElementById('themeSelect').value = this.preferences.theme;
        document.getElementById('autoLocation').checked = this.preferences.autoLocation;
        document.getElementById('notifications').checked = this.preferences.notifications;
    }

    closePreferences() {
        document.getElementById('preferencesPanel').classList.add('hidden');
        document.getElementById('modalBackdrop').classList.add('hidden');
    }

    async getCurrentLocation() {
        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            await this.fetchWeatherData(null, { lat: latitude, lon: longitude });
        } catch (error) {
            alert('Could not get your location. Please check location permissions.');
        }
    }

    toggleFavorites() {
        const panel = document.getElementById('favoritesPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    // Keep existing methods for compatibility
    createNeuralNetwork() {
        const neuralContainer = document.getElementById('neuralNetwork');
        if (!neuralContainer) return;

        for (let i = 0; i < 30; i++) {
            const node = document.createElement('div');
            node.className = 'neural-node';
            node.style.left = Math.random() * 100 + '%';
            node.style.top = Math.random() * 100 + '%';
            node.style.animationDelay = Math.random() * 4 + 's';
            neuralContainer.appendChild(node);
        }

        for (let i = 0; i < 15; i++) {
            const connection = document.createElement('div');
            connection.className = 'neural-connection';
            connection.style.left = Math.random() * 100 + '%';
            connection.style.top = Math.random() * 100 + '%';
            connection.style.width = (Math.random() * 200 + 100) + 'px';
            connection.style.transform = `rotate(${Math.random() * 360}deg)`;
            connection.style.animationDelay = Math.random() * 3 + 's';
            neuralContainer.appendChild(connection);
        }
    }

    getWeatherIcon(weatherCode, description = '') {
        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌦️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return iconMap[weatherCode] || '🌤️';
    }

    displayWeather(data) {
        const {
            name,
            main: { temp, humidity, feels_like },
            weather: [{ description, icon }],
            wind: { speed },
            visibility
        } = data;

        const tempUnit = this.getTemperatureUnit();
        const convertedTemp = this.convertTemperature(temp);
        const convertedFeelsLike = this.convertTemperature(feels_like);

        this.animateValue('cityName', name.toUpperCase());
        this.animateValue('temperature', Math.round(convertedTemp) + tempUnit);
        this.animateValue('weatherDescription', description);

        this.elements.weatherIcon.textContent = this.getWeatherIcon(icon, description);
        this.animateValue('humidity', humidity + '%');
        this.animateValue('windSpeed', Math.round(speed * 3.6) + ' KM/H');
        this.animateValue('visibility', Math.round(visibility / 1000) + ' KM');
        this.animateValue('feelsLike', Math.round(convertedFeelsLike) + tempUnit);

        this.elements.weatherContent.classList.remove('hidden');
    }

    animateValue(elementId, finalValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = '';
        let index = 0;
        const interval = setInterval(() => {
            element.textContent = finalValue.substring(0, index);
            index++;
            if (index > finalValue.length) {
                clearInterval(interval);
                element.classList.remove('typing-effect');
            }
        }, 50);
        element.classList.add('typing-effect');
    }

async getAIInsights() {
    if (!this.currentWeatherData) return;

    try {
        this.showAILoading();
        const response = await fetch('/api/ai-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weatherData: this.currentWeatherData }),
        });

        if (!response.ok) throw new Error('Neural network analysis failed');

        const result = await response.json();
        
        // Parse the analysis and recommendations
        const parts = result.analysis.split('===RECOMMENDATIONS===');
        const analysis = parts[0].trim();
        let recommendations = [];
        
        if (parts.length > 1) {
            // Extract recommendations from the second part
            recommendations = parts[1].trim()
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(line => line.trim());
        }
        
        // Display both
        this.displayFormattedAIResponse(analysis);
        this.displayRecommendations(recommendations);
    } catch (error) {
        console.error('AI Analysis error:', error);
        this.displayAIError();
        // Fall back to rule-based recommendations
        this.generateRuleBasedRecommendations();
    }
}

// Add a fallback method for rule-based recommendations
generateRuleBasedRecommendations() {
    if (!this.currentWeatherData) return;

    const { main: { temp, humidity }, weather: [{ description }], wind: { speed } } = this.currentWeatherData;
    const recommendations = [];

    // Activity suggestions based on weather
    if (temp > 25 && humidity < 60) {
        recommendations.push('🏃‍♂️ Perfect conditions for outdoor sports and activities');
    } else if (temp < 10) {
        recommendations.push('🧥 Layer up! Indoor activities recommended');
    } else if (description.includes('rain')) {
        recommendations.push('☔ Great day for indoor activities, museums, or cozy cafes');
    }

    // Clothing suggestions
    if (temp > 30) {
        recommendations.push('👕 Light, breathable clothing recommended');
    } else if (temp < 5) {
        recommendations.push('🧥 Heavy winter clothing essential');
    }

    // Health recommendations
    if (humidity > 80) {
        recommendations.push('💧 High humidity - stay hydrated and seek air conditioning');
    }

    this.displayRecommendations(recommendations);
}

    displayFormattedAIResponse(analysis) {
        const cleanedAnalysis = analysis
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/━+/g, '')
            .trim();
        
        this.elements.aiContent.innerHTML = `
            <div class="ai-response">
                <div class="ai-response-header">
                    <div class="ai-response-icon">🧠</div>
                    <div class="ai-response-title">Neural Analysis Complete</div>
                </div>
                <div class="ai-response-content">
                    <div class="analysis-intro">
                        <span class="analysis-label">🔬 ATMOSPHERIC INTELLIGENCE:</span>
                    </div>
                    <div class="analysis-text" id="aiAnalysisText"></div>
                </div>
                <div class="analysis-footer">
                    <div class="analysis-timestamp">Analysis completed at ${new Date().toLocaleTimeString()}</div>
                </div>
            </div>
        `;
        
        const analysisElement = document.getElementById('aiAnalysisText');
        this.typewriterEffect(analysisElement, cleanedAnalysis);
    }

    typewriterEffect(element, text) {
        element.textContent = '';
        element.classList.add('typing-active');
        let index = 0;

        const interval = setInterval(() => {
            element.textContent = text.substring(0, index);
            index++;
            if (index > text.length) {
                clearInterval(interval);
                element.classList.remove('typing-active');
                element.classList.add('typing-complete');
            }
        }, 30);
    }

    showWeatherLoading() {
        this.elements.aiContent.innerHTML = `
            <div class="neural-loading">
                <div class="loading-brain">
                    <div class="synapse"></div>
                    <div class="synapse"></div>
                    <div class="synapse"></div>
                </div>
                <span>🌍 Scanning atmospheric conditions...</span>
            </div>
        `;
    }

    showAILoading() {
        this.elements.aiContent.innerHTML = `
            <div class="ai-thinking">
                <div class="thinking-dots">
                    <div class="thinking-dot"></div>
                    <div class="thinking-dot"></div>
                    <div class="thinking-dot"></div>
                </div>
                <span>🧠 Neural network processing atmospheric data...</span>
            </div>
        `;
    }

    showError(message) {
        this.elements.aiContent.innerHTML = `
            <div class="error-display">
                ${message}
            </div>
        `;
        this.elements.weatherContent.classList.add('hidden');
    }

    displayAIError() {
        this.elements.aiContent.innerHTML = `
            <div class="error-display">
                <div class="error-title">⚠️ NEURAL ANALYSIS OFFLINE</div>
                <div class="error-message">
                    Falling back to basic atmospheric assessment protocols...
                </div>
            </div>
        `;
    }

    updateDisplay() {
        this.updateFavoritesDisplay();
        this.applyPreferences();
    }
}

// Initialize the enhanced weather intelligence system
const weather = new WeatherIntelligence();

// Make methods available globally for HTML onclick handlers
window.weather = weather;