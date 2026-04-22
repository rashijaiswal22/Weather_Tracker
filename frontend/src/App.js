import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './App.css';
import HistoryList from './components/HistoryList';


const dateBuilder = (d) => {
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast,setForecast] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("https://weather-tracker-backend-c6u1.onrender.com/api/weather/history");
      setHistory(res.data);
    } catch (err) {
      console.log("History load error");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

 const fetchWeather = async () => {
    if (!city || city.trim() === "") return;

    
    try {
      // 1. Current Weather Fetch
      const response = await axios.get(`https://weather-tracker-backend-c6u1.onrender.com/api/weather/${city}`);
      
      if (response.data && !response.data.error) {
        setWeather(response.data);
        
        // 2. Forecast Data Fetch (Extra feature)
        try {
          const forecastRes = await axios.get(`https://weather-tracker-backend-c6u1.onrender.com/api/weather/forecast/${city}`);
          setForecast(forecastRes.data);
        } catch (fErr) {
          console.log("Forecast not available");
        }

        fetchHistory();
        setCity('');
      } else {
        alert("Write City name correctly!");
      }
    } catch (error) {
      console.error("Unable to show.Try after sometime");
    }
  };

const getBackground = () => {
    if (!weather || !weather.main) 
      return 'linear-gradient(135deg, #7165ad, #9e9da1)';

    const main = weather.weather[0].main.toLowerCase();
    const temp = weather.main.temp;

    // 1. Check temperature first
    if (temp > 35) {
        return 'linear-gradient(135deg, #ff4b1f, #ff9068)'; // Kadakti Dhoop Look
    }

    // 2. Then check these conditions
    if (main.includes('rain')) 
      return 'linear-gradient(135deg, #4b6cb7, #182848)';
    if (main.includes('cloud')) 
      return 'linear-gradient(135deg, #bdc3c7, #127bb8)';
    if (main.includes('haze') || main.includes('mist')) 
      return 'linear-gradient(135deg, #9b58d3, #8e9db8)';

    // 3. Cold and Normal
    if (temp < 15) 
      return 'linear-gradient(135deg, #83a4d4, #b6fbff)';
    
    return 'linear-gradient(135deg, #f7b733, #fc4a1a)'; // Default Sunny
}; 

  return (
    <div className="App" style={{ background: getBackground(), transition: '0.5s ease' }}>
      <div className="weather-container">
        <h1>Weather Tracker</h1>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Enter City..." 
            value={city} // Important
            onChange={(e) => setCity(e.target.value)} // Important
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchWeather();
              }
            }}
          />
          <button onClick={() => fetchWeather()}>Search</button>
        </div>

        {weather && weather.main ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="result">
            <h2>{weather.name}, {weather.sys.country}</h2>
            <div className="date">{dateBuilder(new Date())}</div>
            <div className="temp">{Math.round(weather.main.temp)}°C</div>
            <div className="description">{weather.weather[0].description}</div>
          </motion.div>
        ) : (
          <p>Search a city to see the magic!</p>
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