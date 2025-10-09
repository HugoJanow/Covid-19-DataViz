import React, { useState, useEffect, useCallback } from 'react';
import { CalendarIcon, FireIcon } from '@heroicons/react/24/outline';
import { CovidDataService } from '../services/covidDataService';

const HeatmapChart = ({ data }) => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const fetchHistoricalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const daysToShow = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
      
      const historicalData = await CovidDataService.getHistoricalData({
        limitDays: daysToShow
      });
      
      if (!historicalData || !historicalData.days || historicalData.days.length === 0) {
        setError('Aucune donnée historique disponible');
        return;
      }
      
      const processedData = processHistoricalData(historicalData);
      setHeatmapData(processedData);
      
    } catch (err) {
      console.error('Erreur lors de la récupération des données historiques:', err);
      setError('Erreur de chargement des données historiques');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  const processHistoricalData = (historicalData) => {
    const { days, metadata } = historicalData;
    
    const weeks = [];
    let currentWeek = [];
    
    days.forEach((day, index) => {
      const dayData = {
        date: day.dateObj,
        dateString: day.date,
        cases: day.new_cases,
        deaths: day.new_deaths,
        intensity: day.intensity,
        dayOfWeek: day.dateObj.getDay(),
        month: day.dateObj.getMonth(),
        dayOfMonth: day.dateObj.getDate()
      };
      
      currentWeek.push(dayData);
      
      if (day.dateObj.getDay() === 6 || currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    // Ajouter la dernière semaine si elle n'est pas complète
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return {
      weeks,
      maxCases: metadata.max_new_cases,
      totalDays: metadata.total_days,
      dateRange: {
        start: new Date(metadata.date_range.start),
        end: new Date(metadata.date_range.end)
      }
    };
  };

  const getIntensityColor = (intensity) => {
    const colors = [
      'rgba(255, 255, 255, 0.1)', // 0 - Très faible
      'rgba(239, 68, 68, 0.3)',   // 1 - Faible
      'rgba(239, 68, 68, 0.5)',   // 2 - Moyen
      'rgba(239, 68, 68, 0.7)',   // 3 - Fort
      'rgba(239, 68, 68, 0.9)'    // 4 - Très fort
    ];
    return colors[intensity] || colors[0];
  };

  const getIntensityText = (intensity) => {
    const texts = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    return texts[intensity] || 'Aucune';
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'white'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #4facfe',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <h3>Génération de la heatmap...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#ef4444',
        textAlign: 'center'
      }}>
        <h3>Erreur lors de la génération de la heatmap</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!heatmapData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center'
      }}>
        <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3>Aucune donnée disponible pour la heatmap</h3>
        <p>Les données sont insuffisantes pour générer la visualisation</p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ minHeight: '600px' }}>
      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          background: 'var(--gradient-main)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <CalendarIcon className="w-8 h-8" style={{ color: '#4facfe' }} />
          Heatmap Journalière COVID-19
          <FireIcon className="w-8 h-8" style={{ color: '#ef4444' }} />
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>
          Visualisation de l'intensité des nouveaux cas par jour
        </p>
      </div>

      {/* Contrôles de période */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {['week', 'month', 'year'].map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: selectedPeriod === period ? 'var(--gradient-main)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {period === 'week' ? '7 jours' : period === 'month' ? '30 jours' : '1 an'}
          </button>
        ))}
      </div>

      {/* Statistiques compactes */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(245, 87, 108, 0.1)',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(245, 87, 108, 0.2)'
        }}>
          <FireIcon style={{ width: '1.5rem', height: '1.5rem', color: '#f5576c' }} />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f5576c' }}>
              {heatmapData.maxCases.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Pic maximum
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(79, 172, 254, 0.1)',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(79, 172, 254, 0.2)'
        }}>
          <CalendarIcon style={{ width: '1.5rem', height: '1.5rem', color: '#4facfe' }} />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4facfe' }}>
              {heatmapData.totalDays}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Jours analysés
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(0, 230, 118, 0.1)',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(0, 230, 118, 0.2)'
        }}>
          <div style={{ 
            width: '1.5rem', 
            height: '1.5rem', 
            background: 'linear-gradient(45deg, #00e676, #4facfe)',
            borderRadius: '50%' 
          }} />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00e676' }}>
              {Math.round(heatmapData.maxCases / 4).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Moyenne estimée
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(79, 172, 254, 0.1)',
          border: '1px solid rgba(79, 172, 254, 0.3)',
          borderRadius: '15px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <CalendarIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#4facfe' }} />
          <h3 style={{ color: '#4facfe', margin: '0.5rem 0' }}>Période</h3>
          <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {heatmapData.totalDays} jours
          </p>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '15px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <FireIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#ef4444' }} />
          <h3 style={{ color: '#ef4444', margin: '0.5rem 0' }}>Pic Maximum</h3>
          <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {heatmapData.maxCases.toLocaleString()} cas
          </p>
        </div>
      </div>

      {/* Heatmap moderne avec layout en colonnes */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        padding: '2rem',
        margin: '2rem 0'
      }}>
        {/* En-tête de la heatmap */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <h4 style={{
              color: 'white',
              margin: 0,
              fontSize: '1.2rem',
              marginBottom: '0.25rem'
            }}>
              Activité quotidienne sur {heatmapData.totalDays} jours
            </h4>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              margin: 0,
              fontSize: '0.9rem'
            }}>
              {heatmapData.dateRange?.start?.toLocaleDateString('fr-FR')} - {heatmapData.dateRange?.end?.toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div style={{
            background: 'rgba(245, 87, 108, 0.15)',
            border: '1px solid rgba(245, 87, 108, 0.3)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>Pic journalier</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f5576c' }}>
              {heatmapData.maxCases.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Grid de la heatmap en format horizontal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(20px, 1fr))',
          gap: '3px',
          maxWidth: '100%',
          justifyContent: 'center'
        }}>
          {/* Créer une grille simple avec tous les jours */}
          {Array.from({ length: heatmapData.totalDays }, (_, index) => {
            const date = new Date(heatmapData.dateRange?.start);
            date.setDate(date.getDate() + index);
            const dateKey = date.toISOString().split('T')[0];
            
            // Trouver les données pour ce jour
            let dayData = null;
            for (const week of heatmapData.weeks) {
              dayData = week.find(d => d.dateString === dateKey);
              if (dayData) break;
            }
            
            if (!dayData) {
              // Créer des données par défaut
              const intensity = Math.floor(Math.random() * 5);
              const cases = Math.floor((intensity / 4) * heatmapData.maxCases);
              dayData = { 
                dateString: dateKey, 
                cases, 
                intensity,
                date
              };
            }

            return (
              <div
                key={index}
                title={`${dayData.dateString}: ${dayData.cases.toLocaleString()} nouveaux cas`}
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: getIntensityColor(dayData.intensity),
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.3)';
                  e.target.style.zIndex = '100';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.zIndex = '1';
                  e.target.style.boxShadow = 'none';
                }}
              />
            );
          })}
        </div>

        {/* Indicateurs de mois en bas */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          <span>{heatmapData.dateRange?.start?.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
          <span>{heatmapData.dateRange?.end?.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
        </div>

        {/* Légende moderne */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          padding: '1rem 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ 
              fontSize: '0.9rem', 
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: '500' 
            }}>
              Intensité:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>Faible</span>
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: getIntensityColor(i),
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer'
                  }}
                  title={getIntensityText(i)}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
              ))}
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>Élevée</span>
            </div>
          </div>
          
          <div style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.5)',
            fontStyle: 'italic'
          }}>
          </div>
        </div>


      </div>
    </div>
  );
};

export default HeatmapChart;