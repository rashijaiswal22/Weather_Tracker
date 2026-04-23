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
          <input type="text" placeholder="Enter City..." value={city} onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather()} />
          <button onClick={fetchWeather}>Search</button>
        </div>

        {weather && weather.main && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="result">
            <h2>{weather.name}, {weather.sys.country}</h2>
            <div className="date">{dateBuilder(new Date())}</div>
            <div className="temp">{Math.round(weather.main.temp)}°C</div>
            <div className="description">{weather.weather[0].description}</div>

            {/* --- FORECAST UI SECTION --- */}
            {forecast && forecast.list && (
              <div className="forecast-box">
                <h3>5-Day Forecast</h3>
                <div className="forecast-grid" style={{ display: 'flex', overflowX: 'auto', gap: '10px', marginTop: '20px' }}>
                  {forecast.list.filter(f => f.dt_txt.includes("12:00:00")).map((item, index) => (
                    <div key={index} className="forecast-item" style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '10px', minWidth: '80px' }}>
                      <p>{new Date(item.dt_txt).toLocaleDateString('en', { weekday: 'short' })}</p>
                      <img src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`} alt="icon" />
                      <p>{Math.round(item.main.temp)}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="history-sidebar">
          <h4>Recent Searches</h4>
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <span>{item.city}</span> - <span>{Math.round(item.temp)}°C</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;