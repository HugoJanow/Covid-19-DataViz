import React, { useState } from 'react';
import { formatNumber, dataColors } from '../utils/dataUtils';

const BarChart = ({ data = [], selectedMetric = 'total_cases', height = 400 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '1.1rem'
      }}>
         Aucune donnée pour le graphique
      </div>
    );
  }

  const topCountries = data.slice(0, 10);
  const maxValue = Math.max(...topCountries.map(country => country[selectedMetric] || 0));

  const getColor = (index) => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
      '#dda0dd', '#ff7675', '#74b9ff', '#a29bfe', '#6c5ce7'
    ];
    return colors[index % colors.length];
  };

  return (
    <div style={{ 
      height: `${height}px`, 
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '10px'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '1.5rem',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        opacity: 0.9
      }}>
         Top 10 - {selectedMetric === 'total_cases' ? 'Cas Confirmés' : 
                      selectedMetric === 'total_deaths' ? 'Décès' : 'Guérisons'}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        height: 'calc(100% - 80px)',
        gap: '0.5rem',
        padding: '0 1rem'
      }}>
        {topCountries.map((country, index) => {
          const value = country[selectedMetric] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const barColor = getColor(index);

          return (
            <div
              key={country.country}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                top: `${Math.max(5, 95 - percentage - 8)}%`,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                color: '#ffffff',
                textShadow: `0 0 4px ${barColor}, 0 1px 2px rgba(0,0,0,0.8)`,
                whiteSpace: 'nowrap',
                zIndex: 2,
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: `1px solid ${barColor}60`
              }}>
                {formatNumber(value)}
              </div>

              <div
                style={{
                  width: '100%',
                  height: `${percentage}%`,
                  background: `linear-gradient(to top, ${barColor}, ${barColor}80)`,
                  borderRadius: '4px 4px 0 0',
                  marginTop: 'auto',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scaleY(1.05)';
                  e.target.style.filter = 'brightness(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scaleY(1)';
                  e.target.style.filter = 'brightness(1)';
                }}
              />

              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.7rem',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '500',
                lineHeight: '1.2',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                #{index + 1}
                <br />
                {country.country.length > 8 
                  ? country.country.substring(0, 8) + '...' 
                  : country.country}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TopCountriesChart = ({ data = [], loading = false }) => {
  const [selectedMetric, setSelectedMetric] = useState('total_cases');

  console.log(' TopCountriesChart data reçue:', data);

  if (loading) {
    return (
      <div className="top-countries-container">
        <div className="loading-container" style={{ minHeight: '400px' }}>
          <div className="loading-spinner"></div>
          <div className="loading-text">Chargement du classement des pays...</div>
        </div>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn(' Données des pays manquantes ou invalides:', data);
    return (
      <div className="top-countries-container">
        <div style={{ 
          textAlign: 'center', 
          color: 'rgba(255, 255, 255, 0.6)',
          padding: '3rem',
          fontSize: '1.1rem'
        }}>
           Aucune donnée de pays disponible
        </div>
      </div>
    );
  }

  const metricOptions = [
    { value: 'total_cases', label: ' Cas Total', color: dataColors.cases.solid },
    { value: 'total_deaths', label: ' Décès Total', color: dataColors.deaths.solid },
    { value: 'total_recovered', label: ' Guérisons', color: dataColors.recovered.solid }
  ];

  return (
    <div className="top-countries-container">
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {metricOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setSelectedMetric(option.value)}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: selectedMetric === option.value ? option.color : 'rgba(255, 255, 255, 0.2)',
              background: selectedMetric === option.value 
                ? `${option.color}20` 
                : 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              transform: selectedMetric === option.value ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedMetric === option.value 
                ? `0 0 20px ${option.color}40` 
                : 'none'
            }}
            onMouseEnter={(e) => {
              if (selectedMetric !== option.value) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedMetric !== option.value) {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <BarChart 
          data={data} 
          selectedMetric={selectedMetric}
          height={400}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1rem',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ecdc4' }}>
            {data.length}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Pays total</div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1rem',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}>
            #{1}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            {data[0]?.country || 'N/A'}
          </div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1rem',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffeaa7' }}>
            {formatNumber(data[0]?.[selectedMetric] || 0)}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Valeur max</div>
        </div>
      </div>
    </div>
  );
};

export default TopCountriesChart;