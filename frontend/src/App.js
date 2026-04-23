import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './App.css';

const dateBuilder = (d) => {
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState([]);

  const API_BASE_URL = "https://weather-tracker-backend-c6u1.onrender.com/api/weather";

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/history`);
      setHistory(res.data);
    } catch (err) { console.log("History error"); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const fetchWeather = async () => {
    if (!city.trim()) return;
    try {
      // 1. Current Weather
      const response = await axios.get(`${API_BASE_URL}/${city}`);
      if (response.data && !response.data.error) {
        setWeather(response.data);
        
        // 2. Forecast (Method call)
        try {
          const forecastRes = await axios.get(`${API_BASE_URL}/forecast/${city}`);
          setForecast(forecastRes.data);
        } catch (fErr) { console.log("Forecast CORS or API error"); }

        fetchHistory();
        setCity('');
      } else { alert("City not found!"); }
    } catch (error) { console.error("Network Error"); }
  };

  const getBackground = () => {
    if (!weather || !weather.main) return 'linear-gradient(135deg, #7165ad, #9e9da1)';
    const temp = weather.main.temp;
    if (temp > 30) return 'linear-gradient(135deg, #ff4b1f, #ff9068)';
    if (temp < 15) return 'linear-gradient(135deg, #83a4d4, #b6fbff)';
    return 'linear-gradient(135deg, #f7b733, #fc4a1a)';
  };

 return (
    <div className="App" style={{ background: getBackground(), transition: '0.5s ease', minHeight: '100vh' }}>
      <div className="weather-container">
        <h1>Weather Tracker</h1>
        
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Enter City..." 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather()} 
          />
          <button onClick={fetchWeather}>Search</button>
        </div>

        {weather && weather.main ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="result">
            <h2>{weather.name}, {weather.sys.country}</h2>
            <div className="date">{dateBuilder(new Date())}</div>
            <div className="temp">{Math.round(weather.main.temp)}°C</div>
            <div className="description">{weather.weather[0].description}</div>

            {/* --- FORECAST UI SECTION --- */}
            {forecast && forecast.list && (
              <div className="forecast-section" style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: '#fff' }}>5-Day Forecast</h3>
                <div className="forecast-grid" style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '10px', 
                  flexWrap: 'nowrap', 
                  alignItems: 'stretch' 
                }}>
                  {forecast.list
                    .filter(item => item.dt_txt.includes("12:00:00"))
                    .slice(0, 5)
                    .map((item, index) => (
                      <div 
                        key={index} 
                        className="forecast-card" 
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '15px',
                          borderRadius: '15px',
                          backdropFilter: 'blur(5px)',
                          width: '18%',
                          textAlign: 'center',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {new Date(item.dt_txt).toLocaleDateString('en', { weekday: 'short' })}
                        </p>
                        <img 
                          src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
                          alt="weather-icon" 
                          style={{ width: '40px', height: '40px' }} 
                        />
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{Math.round(item.main.temp)}°C</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <p style={{ color: 'white', marginTop: '20px' }}>Search a city to see the magic!</p>
        )}

        <div className="history-sidebar">
          <h4>Recent Searches</h4>
          {history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="history-item">
                <span>{item.city}</span> - <span>{Math.round(item.temp)}°C</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>No history yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
