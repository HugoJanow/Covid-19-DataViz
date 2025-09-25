import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/dataUtils';

const DateSelector = ({ 
  onDateRangeChange, 
  availableDates = [],
  initialStartDate = null,
  initialEndDate = null 
}) => {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [quickSelect, setQuickSelect] = useState('all');

  const minDate = availableDates.length > 0 ? availableDates[0] : null;
  const maxDate = availableDates.length > 0 ? availableDates[availableDates.length - 1] : null;

  const quickOptions = [
    { value: 'all', label: ' Toute la période', days: null },
    { value: '7d', label: ' 7 derniers jours', days: 7 },
    { value: '30d', label: ' 30 derniers jours', days: 30 },
    { value: '90d', label: ' 3 derniers mois', days: 90 },
    { value: '6m', label: ' 6 derniers mois', days: 180 },
    { value: '1y', label: ' Dernière année', days: 365 }
  ];

  useEffect(() => {
    if (minDate && maxDate && !initialStartDate && !initialEndDate) {
      setStartDate(minDate);
      setEndDate(maxDate);
    }
  }, [minDate, maxDate, initialStartDate, initialEndDate]);

  const handleQuickSelect = (option) => {
    console.log(' Quick select:', option.label);
    setQuickSelect(option.value);
    
    if (option.value === 'all' && minDate && maxDate) {
      setStartDate(minDate);
      setEndDate(maxDate);
      if (typeof onDateRangeChange === 'function') {
        setTimeout(() => onDateRangeChange(minDate, maxDate), 0);
      }
    } else if (option.days && maxDate) {
      const endDateObj = new Date(maxDate);
      const startDateObj = new Date(endDateObj);
      startDateObj.setDate(endDateObj.getDate() - option.days);
      const startDateStr = startDateObj.toISOString().split('T')[0];
      const closestStartDate = availableDates.find(date => date >= startDateStr) || minDate;
      
      setStartDate(closestStartDate);
      setEndDate(maxDate);
      if (typeof onDateRangeChange === 'function') {
        setTimeout(() => onDateRangeChange(closestStartDate, maxDate), 0);
      }
    }
  };

  const handleStartDateChange = (event) => {
    const newStartDate = event.target.value;
    console.log(' Start date change:', newStartDate);
    
    setStartDate(newStartDate);
    setQuickSelect('custom');
    
    if (endDate && newStartDate > endDate) {
      setEndDate(newStartDate);
      if (typeof onDateRangeChange === 'function') {
        setTimeout(() => onDateRangeChange(newStartDate, newStartDate), 0);
      }
    } else {
      if (typeof onDateRangeChange === 'function') {
        setTimeout(() => onDateRangeChange(newStartDate, endDate), 0);
      }
    }
  };

  const handleEndDateChange = (event) => {
    const newEndDate = event.target.value;
    console.log(' End date change:', newEndDate);
    
    setEndDate(newEndDate);
    setQuickSelect('custom');
    
    if (startDate && startDate > newEndDate) {
      setStartDate(newEndDate);
      if (typeof onDateRangeChange === 'function') {
        setTimeout(() => onDateRangeChange(newEndDate, newEndDate), 0);
      }
    } else {
      if (typeof onDateRangeChange === 'function') {
        setTimeout(() => onDateRangeChange(startDate, newEndDate), 0);
      }
    }
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: 'white'
      }}>
         Sélection de Période
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 'bold',
          marginBottom: '0.8rem',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
           Sélection Rapide:
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.8rem'
        }}>
          {quickOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleQuickSelect(option);
              }}
              style={{
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: quickSelect === option.value ? '#4ecdc4' : 'rgba(255, 255, 255, 0.2)',
                background: quickSelect === option.value 
                  ? 'rgba(78, 205, 196, 0.2)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                transform: quickSelect === option.value ? 'scale(1.02)' : 'scale(1)',
                boxShadow: quickSelect === option.value 
                  ? '0 0 15px rgba(78, 205, 196, 0.3)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (quickSelect !== option.value) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'scale(1.01)';
                }
              }}
              onMouseLeave={(e) => {
                if (quickSelect !== option.value) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '1.5rem'
      }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
           Sélection Personnalisée:
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
               Date de début:
            </label>
            <input
              type="date"
              value={formatDateForInput(startDate)}
              onChange={handleStartDateChange}
              min={formatDateForInput(minDate)}
              max={formatDateForInput(maxDate)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
               Date de fin:
            </label>
            <input
              type="date"
              value={formatDateForInput(endDate)}
              onChange={handleEndDateChange}
              min={formatDateForInput(minDate)}
              max={formatDateForInput(maxDate)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{
            background: 'rgba(78, 205, 196, 0.1)',
            border: '1px solid rgba(78, 205, 196, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#4ecdc4',
              marginBottom: '0.3rem'
            }}>
              {startDate && endDate ? 
                Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
                : '-'
              }
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              Jours sélectionnés
            </div>
          </div>
        </div>

        {startDate && endDate && (
          <div style={{
            marginTop: '1rem',
            padding: '0.8rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
             Période sélectionnée: <strong>{formatDate(startDate)}</strong> → <strong>{formatDate(endDate)}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateSelector;