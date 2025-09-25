import React from 'react';
import { formatNumber, formatPercentage, dataColors } from '../utils/dataUtils';

const StatCard = ({ stat, index }) => {
  const { label, value, icon, color, trend } = stat;
  
  return (
    <div 
      className={`stat-card`}
      style={{
        background: color.gradient,
        animationDelay: `${index * 0.1}s`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="stat-shine" />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}>
          {icon}
        </div>
        
        <div className="stat-number" style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          marginBottom: '0.5rem',
          textShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          {formatNumber(value)}
        </div>
        
        <div className="stat-label" style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          opacity: 0.95,
          marginBottom: '0.5rem'
        }}>
          {label}
        </div>
        
        {trend && (
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '500',
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ 
              color: trend.includes('+') ? '#4ade80' : '#ef4444' 
            }}>
            </span>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

const GlobalStats = ({ data, loading = false }) => {
  console.log('🔍 GlobalStats data reçue:', data);

  if (loading) {
    return (
      <div className="global-stats-container">
        <div className="loading-container" style={{ minHeight: '200px' }}>
          <div className="loading-spinner"></div>
          <div className="loading-text">Chargement des statistiques mondiales...</div>
        </div>
      </div>
    );
  }

  if (!data || typeof data !== 'object') {
    console.warn(' Données globales manquantes ou invalides:', data);
    return (
      <div className="global-stats-container">
        <div style={{ 
          textAlign: 'center', 
          color: 'rgba(255, 255, 255, 0.6)',
          padding: '3rem',
          fontSize: '1.1rem'
        }}>
           Aucune donnée disponible
        </div>
      </div>
    );
  }

  const mortalityRate = data.total_cases > 0 ? 
    (data.total_deaths / data.total_cases) * 100 : 0;
  const recoveryRate = data.total_cases > 0 ? 
    (data.total_recovered / data.total_cases) * 100 : 0;
  const stats = [
    {
      label: "Cas Confirmés",
      value: data.total_cases || 0,
      color: dataColors.cases,
      trend: "+2.1%"
    },
    {
      label: "Décès",
      value: data.total_deaths || 0,
      color: dataColors.deaths,
      trend: "+1.5%"
    },
    {
      label: "Guérisons",
      value: data.total_recovered || 0,
      color: dataColors.recovered,
      trend: "+4.8%"
    },
    {
      label: "Taux Mortalité",
      value: `${mortalityRate.toFixed(1)}%`,
      color: { gradient: 'var(--gradient-6)' },
      trend: null
    }
  ];

  return (
    <div className="global-stats-container">
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '1rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '50px',
          padding: '0.75rem 1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <span style={{ fontSize: '1.1rem' }}></span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            Données mondiales en temps réel
          </span>
          {data.last_update && (
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.85rem'
            }}>
              • Mis à jour: {new Date(data.last_update).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>

      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '15px',
          padding: '1.5rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: dataColors.recovered.solid }}>
            {formatPercentage(recoveryRate)}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Taux de Guérison</div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '15px',
          padding: '1.5rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: dataColors.active.solid }}>
            {formatNumber((data.total_cases || 0) - (data.total_deaths || 0) - (data.total_recovered || 0))}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Cas Actifs</div>
        </div>
      </div>
    </div>
  );
};

export default GlobalStats;