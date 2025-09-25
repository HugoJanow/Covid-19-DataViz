import React, { useState } from 'react';
import { formatNumber, sortCountriesByMetric, dataColors } from '../utils/dataUtils';

const CountryCard = ({ country, index, metric = 'total_cases' }) => {
  const getValue = () => {
    switch (metric) {
      case 'total_deaths': return country.total_deaths || 0;
      case 'total_recovered': return country.total_recovered || 0;
      default: return country.total_cases || 0;
    }
  };

  const getColor = () => {
    switch (metric) {
      case 'total_deaths': return dataColors.deaths;
      case 'total_recovered': return dataColors.recovered;
      default: return dataColors.cases;
    }
  };

  const color = getColor();
  const value = getValue();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.25rem',
      margin: '0.75rem 0',
      background: `rgba(255, 255, 255, ${0.06 + (index * 0.01)})`,
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(15px)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      animationDelay: `${index * 0.05}s`
    }}
    className="animate-fade-in"
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.background = `rgba(255, 255, 255, ${0.12 + (index * 0.01)})`;
      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.background = `rgba(255, 255, 255, ${0.06 + (index * 0.01)})`;
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          background: color.gradient,
          borderRadius: '50%',
          width: '45px',
          height: '45px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          {index + 1}
        </div>
        
        <div>
          <div style={{ 
            fontWeight: '700', 
            fontSize: '1.15rem',
            marginBottom: '0.25rem'
          }}>
            {country.country}
          </div>
          <div style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '0.9rem',
            display: 'flex',
            gap: '1rem'
          }}>
            <span> {formatNumber(country.total_deaths || 0)}</span>
            <span> {formatNumber(country.total_recovered || 0)}</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ 
          fontWeight: '800', 
          fontSize: '1.4rem', 
          color: color.solid,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          {formatNumber(value)}
        </div>
        <div style={{ 
          color: 'rgba(255, 255, 255, 0.6)', 
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {metric === 'total_deaths' ? 'décès' : 
           metric === 'total_recovered' ? 'guérisons' : 'cas'}
        </div>
      </div>
    </div>
  );
};

const TopCountriesChart = ({ data = [], loading = false }) => {
  const [selectedMetric, setSelectedMetric] = useState('total_cases');
  const [displayCount, setDisplayCount] = useState(10);

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

  const sortedCountries = sortCountriesByMetric(data, selectedMetric, displayCount);

  const metricOptions = [
    { value: 'total_cases', label: ' Cas Total', color: dataColors.cases.solid },
    { value: 'total_deaths', label: ' Décès Total', color: dataColors.deaths.solid },
    { value: 'total_recovered', label: ' Guérisons', color: dataColors.recovered.solid }
  ];

  return (
    <div className="top-countries-container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {metricOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedMetric(option.value)}
              style={{
                background: selectedMetric === option.value 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '25px',
                padding: '0.75rem 1.25rem',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                if (selectedMetric !== option.value) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMetric !== option.value) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <select
          value={displayCount}
          onChange={(e) => setDisplayCount(Number(e.target.value))}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '15px',
            padding: '0.75rem',
            color: 'white',
            fontSize: '0.9rem',
            backdropFilter: 'blur(10px)',
            outline: 'none'
          }}
        >
          <option value={5} style={{ background: '#1a1a2e' }}>Top 5</option>
          <option value={10} style={{ background: '#1a1a2e' }}>Top 10</option>
          <option value={15} style={{ background: '#1a1a2e' }}>Top 15</option>
          <option value={20} style={{ background: '#1a1a2e' }}>Top 20</option>
        </select>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '15px',
          padding: '1rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: dataColors.cases.solid }}>
            {sortedCountries.length}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Pays affichés</div>
        </div>
        
        {sortedCountries[0] && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '15px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: dataColors.recovered.solid }}>
              #{1}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{sortedCountries[0].country}</div>
          </div>
        )}
      </div>

      <div style={{ 
        maxHeight: '600px', 
        overflowY: 'auto',
        paddingRight: '0.5rem'
      }}>
        {sortedCountries.map((country, index) => (
          <CountryCard
            key={`${country.country}-${selectedMetric}`}
            country={country}
            index={index}
            metric={selectedMetric}
          />
        ))}
      </div>

      {sortedCountries.length > 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
            Total pour les {sortedCountries.length} premiers pays
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
            {formatNumber(sortedCountries.reduce((sum, country) => 
              sum + (country[selectedMetric] || 0), 0))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopCountriesChart;