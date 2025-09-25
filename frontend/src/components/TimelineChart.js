import React, { useState } from 'react';
import LineChart from './LineChart';
import { formatNumber, formatDate } from '../utils/dataUtils';

const TimelineChart = ({ data, countryName, loading = false }) => {
  const [selectedMetric, setSelectedMetric] = useState('total_cases');
  const [selectedTimeRange, setSelectedTimeRange] = useState(30);

  console.log(' TimelineChart data reçue:', data);
  console.log(' Country name:', countryName);

  if (loading) {
    return (
      <div className="timeline-container">
        <div className="loading-container" style={{ minHeight: '400px' }}>
          <div className="loading-spinner"></div>
          <div className="loading-text">Chargement de la timeline de {countryName}...</div>
        </div>
      </div>
    );
  }

  if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
    return (
      <div className="timeline-container">
        <div style={{ 
          textAlign: 'center', 
          color: 'rgba(255, 255, 255, 0.6)',
          padding: '3rem',
          fontSize: '1.1rem'
        }}>
           Aucune donnée timeline disponible pour {countryName}
        </div>
      </div>
    );
  }

  const latestData = data.data[data.data.length - 1] || {};
  
  const timelineData = data.data.slice(-selectedTimeRange);
  
  const metricOptions = [
    { value: 'total_cases', label: ' Cas Total', color: '#ff6b6b' },
    { value: 'total_deaths', label: ' Décès Total', color: '#fd79a8' },
    { value: 'total_recovered', label: ' Guérisons', color: '#00b894' },
    { value: 'new_cases', label: ' Nouveaux Cas', color: '#0984e3' },
    { value: 'new_deaths', label: ' Nouveaux Décès', color: '#e84393' }
  ];

  const timeRangeOptions = [
    { value: 15, label: '15 jours' },
    { value: 30, label: '30 jours' },
    { value: 60, label: '60 jours' },
    { value: 90, label: '90 jours' },
    { value: data.data.length, label: 'Tout' }
  ];

  return (
    <div className="timeline-container">
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: '1.4rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          color: 'white'
        }}>
           {countryName} - Situation Actuelle
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff6b6b' }}>
              {formatNumber(latestData.total_cases || 0)}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Cas Confirmés
            </div>
            {latestData.new_cases && latestData.new_cases > 0 && (
              <div style={{ fontSize: '0.8rem', color: '#ff6b6b', marginTop: '0.5rem' }}>
                +{formatNumber(latestData.new_cases)} aujourd'hui
              </div>
            )}
          </div>

          <div style={{
            background: 'rgba(253, 121, 168, 0.1)',
            border: '1px solid rgba(253, 121, 168, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fd79a8' }}>
              {formatNumber(latestData.total_deaths || 0)}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Décès Total
            </div>
            {latestData.new_deaths && latestData.new_deaths > 0 && (
              <div style={{ fontSize: '0.8rem', color: '#fd79a8', marginTop: '0.5rem' }}>
                +{formatNumber(latestData.new_deaths)} aujourd'hui
              </div>
            )}
          </div>

          <div style={{
            background: 'rgba(0, 184, 148, 0.1)',
            border: '1px solid rgba(0, 184, 148, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#00b894' }}>
              {formatNumber(latestData.total_recovered || 0)}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Guérisons
            </div>
          </div>

          <div style={{
            background: 'rgba(116, 185, 255, 0.1)',
            border: '1px solid rgba(116, 185, 255, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#74b9ff' }}>
              {latestData.total_cases > 0 
                ? ((latestData.total_deaths / latestData.total_cases) * 100).toFixed(1)
                : 0}%
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Taux Létalité
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '2rem',
        marginBottom: '2rem',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
             Métrique à afficher:
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {metricOptions.map(option => (
              <option key={option.value} value={option.value} style={{ background: '#1a1a1a' }}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
             Période:
          </label>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(parseInt(e.target.value))}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value} style={{ background: '#1a1a1a' }}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '2rem'
      }}>
        <LineChart 
          data={timelineData}
          selectedMetric={selectedMetric}
          height={450}
          country={countryName}
        />
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: 'white'
        }}>
           Informations sur la Période
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#74b9ff' }}>
              {timelineData.length}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Jours de données</div>
          </div>
          
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff6b6b' }}>
              {formatDate(timelineData[0]?.date)}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Date de début</div>
          </div>
          
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00b894' }}>
              {formatDate(timelineData[timelineData.length - 1]?.date)}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Date de fin</div>
          </div>
          
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffeaa7' }}>
              {Math.max(...timelineData.map(d => d[selectedMetric] || 0)) > 0 
                ? formatNumber(Math.max(...timelineData.map(d => d[selectedMetric] || 0)))
                : 'N/A'}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Pic maximum</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;