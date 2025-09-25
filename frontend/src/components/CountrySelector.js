import React, { useState } from 'react';
import { formatNumber, formatDate } from '../utils/dataUtils';

export const CountrySelector = ({ countries, selectedCountry, onCountrySelect, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ 
        marginBottom: '1rem',
        background: 'var(--gradient-main)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
         Sélection de Pays
      </h3>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder=" Rechercher un pays..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '0.9rem'
          }}
        />
      </div>

      <div style={{ 
        maxHeight: '300px', 
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        {filteredCountries.slice(0, 100).map(country => (
          <div
            key={country}
            onClick={() => onCountrySelect(country)}
            style={{
              padding: '0.8rem 1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              background: selectedCountry === country ? 'var(--gradient-main)' : 'transparent',
              transition: 'all 0.2s ease',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              if (selectedCountry !== country) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCountry !== country) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>{country}</span>
            {selectedCountry === country && (
              <span style={{ color: '#4facfe', fontSize: '0.8rem' }}>✓</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '1rem', 
        fontSize: '0.8rem', 
        opacity: 0.7, 
        textAlign: 'center' 
      }}>
        {searchTerm ? 
          `${filteredCountries.length} pays trouvés` : 
          `${countries.length} pays disponibles`
        }
      </div>
    </div>
  );
};