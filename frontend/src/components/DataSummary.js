import React from 'react';
import { formatNumber, formatDate } from '../utils/dataUtils';

export const DataSummary = ({ globalStats, topCountries, selectedCountry, countryData }) => {
  const calculateTrend = (current, previous) => {
    if (!current || !previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '1rem'
    }}>
      <h3 style={{ 
        marginBottom: '1.5rem',
        background: 'var(--gradient-3)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>
         Résumé des Données
      </h3>

      {globalStats && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ 
            color: '#4facfe',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
             Situation Mondiale
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(245, 87, 108, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#f5576c', fontSize: '1.5rem', marginBottom: '0.5rem' }}></div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {formatNumber(globalStats.total_cases)}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Cas Total</div>
            </div>

            <div style={{
              background: 'rgba(139, 90, 60, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#8b5a3c', fontSize: '1.5rem', marginBottom: '0.5rem' }}></div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {formatNumber(globalStats.total_deaths)}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Décès</div>
            </div>

            <div style={{
              background: 'rgba(75, 172, 254, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#4facfe', fontSize: '1.5rem', marginBottom: '0.5rem' }}></div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {formatNumber(globalStats.total_recovered)}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Guérisons</div>
            </div>
          </div>
        </div>
      )}

      {topCountries && topCountries.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ 
            color: '#ffa726',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
             Pays le Plus Affecté
          </h4>
          
          <div style={{
            background: 'rgba(255, 167, 38, 0.1)',
            padding: '1rem',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffa726' }}>
                {topCountries[0].country}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
                Le plus grand nombre de cas
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatNumber(topCountries[0].total_cases)}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                cas confirmés
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCountry && countryData && (
        <div>
          <h4 style={{ 
            color: '#4facfe',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
             {selectedCountry}
          </h4>
          
          <div style={{
            background: 'rgba(75, 172, 254, 0.1)',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f5576c' }}>
                  {formatNumber(countryData.total_cases)}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Cas</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8b5a3c' }}>
                  {formatNumber(countryData.total_deaths)}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Décès</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4facfe' }}>
                  {formatNumber(countryData.total_recovered)}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Guérisons</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '1.5rem',
        padding: '0.8rem',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '0.8rem',
        opacity: 0.7
      }}>
         Dernière mise à jour: {formatDate(new Date())}
      </div>
    </div>
  );
};