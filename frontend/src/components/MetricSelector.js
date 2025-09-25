import React, { useState } from 'react';
import { formatNumber } from '../utils/dataUtils';

export const MetricSelector = ({ 
  selectedMetric, 
  onMetricChange, 
  availableMetrics = ['total_cases', 'total_deaths', 'total_recovered', 'new_cases', 'new_deaths'] 
}) => {
  const metricConfig = {
    total_cases: { 
      label: 'Cas Total', 
      color: '#f5576c',
      description: 'Nombre total de cas confirmés'
    },
    total_deaths: { 
      label: 'Décès Total', 
      color: '#8b5a3c',
      description: 'Nombre total de décès'
    },
    total_recovered: { 
      label: 'Guérisons', 
      color: '#4facfe',
      description: 'Nombre total de guérisons'
    },
    new_cases: { 
      label: 'Nouveaux Cas', 
      color: '#ffa726',
      description: 'Nouveaux cas quotidiens'
    },
    new_deaths: { 
      label: 'Nouveaux Décès', 
      color: '#ef5350',
      description: 'Nouveaux décès quotidiens'
    }
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
        marginBottom: '1rem',
        background: 'var(--gradient-2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
         Sélection de Métrique
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {availableMetrics.map(metric => {
          const config = metricConfig[metric];
          if (!config) return null;

          return (
            <div
              key={metric}
              onClick={() => onMetricChange(metric)}
              style={{
                padding: '1rem',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: selectedMetric === metric ? config.color : 'rgba(255, 255, 255, 0.2)',
                background: selectedMetric === metric 
                  ? `${config.color}20` 
                  : 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                transform: selectedMetric === metric ? 'scale(1.02)' : 'scale(1)',
                boxShadow: selectedMetric === metric 
                  ? `0 0 20px ${config.color}40` 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedMetric !== metric) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'scale(1.01)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMetric !== metric) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={{ 
                fontSize: '2rem', 
                marginBottom: '0.5rem' 
              }}>
                {config.icon}
              </div>
              <div style={{ 
                fontWeight: 'bold', 
                color: selectedMetric === metric ? config.color : 'white',
                marginBottom: '0.3rem'
              }}>
                {config.label}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                opacity: 0.7,
                lineHeight: '1.2'
              }}>
                {config.description}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '0.8rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Métrique sélectionnée: </span>
        <span style={{ 
          color: metricConfig[selectedMetric]?.color || '#4facfe',
          fontWeight: 'bold'
        }}>
          {metricConfig[selectedMetric]?.icon} {metricConfig[selectedMetric]?.label}
        </span>
      </div>
    </div>
  );
};