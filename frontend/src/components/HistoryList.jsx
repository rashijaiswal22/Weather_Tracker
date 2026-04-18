import React from 'react';

const HistoryList = ({ history }) => {
  return (
    <div className="history-sidebar">
      <h4>Recent Searches</h4>
      {history.map((item) => (
        <div key={item.id} className="history-item">
          <span>{item.city}</span> - <span>{Math.round(item.temp)}°C</span>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;