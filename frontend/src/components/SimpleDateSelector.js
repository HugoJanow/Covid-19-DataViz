import React, { useState } from 'react';

const SimpleDateSelector = ({ onDateRangeChange, availableDates = [] }) => {
  const [selectedRange, setSelectedRange] = useState('all');

  const handleRangeChange = (range) => {
    console.log(' SIMPLE: Range change to:', range);
    setSelectedRange(range);
    
    if (availableDates.length === 0) {
      console.warn(' No available dates');
      return;
    }

    const minDate = availableDates[0];
    const maxDate = availableDates[availableDates.length - 1];

    let startDate = minDate;
    let endDate = maxDate;

    if (range === '7d') {
      const end = new Date(maxDate);
      const start = new Date(end);
      start.setDate(end.getDate() - 7);
      startDate = start.toISOString().split('T')[0];
      endDate = maxDate;
    }

    console.log(' SIMPLE: Calling onDateRangeChange with:', startDate, '→', endDate);
    
    if (typeof onDateRangeChange === 'function') {
      onDateRangeChange(startDate, endDate);
    } else {
      console.error('❌ onDateRangeChange is not a function:', typeof onDateRangeChange);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1rem'
    }}>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>🧪 Test Simple Date Selector</h3>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          type="button"
          onClick={() => handleRangeChange('all')}
          style={{
            padding: '0.5rem 1rem',
            background: selectedRange === 'all' ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Toute la période
        </button>
        
        <button 
          type="button"
          onClick={() => handleRangeChange('7d')}
          style={{
            padding: '0.5rem 1rem',
            background: selectedRange === '7d' ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          7 derniers jours
        </button>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
        Dates disponibles: {availableDates.length} | 
        Range: {availableDates[0]} → {availableDates[availableDates.length - 1]}
      </div>
    </div>
  );
};

export default SimpleDateSelector;