import React, { useState, useEffect} from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendsChart = ({ data }) => {
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateTrends = (data) => {
    console.log('TrendsChart - Données reçues:', data);
    
    if (!data || data.length === 0) {
      console.log('TrendsChart - Aucune donnée disponible');
      return { rising: [], falling: [] };
    }

    try {
      console.log(`TrendsChart - Analyse sur toutes les données: ${data.length} jours`);
      
      console.log('Format des données:', data.slice(0, 2));
      console.log('Premier élément:', data[0]);
      console.log('Dernier élément:', data[data.length - 1]);
      
      const trends = [];
      
      data.forEach(countryData => {
        if (!countryData || typeof countryData !== 'object') return;
        
        const country = countryData.country;
        const totalCases = parseInt(countryData.total_cases || 0);
        const newCases = parseInt(countryData.new_cases || 0);
        //const totalDeaths = parseInt(countryData.total_deaths || 0);
        //const newDeaths = parseInt(countryData.new_deaths || 0);
        
        if (totalCases > 0) {
          let percentChange = 0;
          let trendType = 'stable';
          
          if (newCases > 0) {
            percentChange = (newCases / totalCases) * 100;
            trendType = 'rising';
          } 
          else if (totalCases > 1000) {
            const activeCases = parseInt(countryData.active_cases || 0);
            const totalDeaths = parseInt(countryData.total_deaths || 0);
            
            if (activeCases > 0) {
              percentChange = -(activeCases / totalCases) * 100;
            } else if (totalDeaths > 0) {
              const mortalityRate = (totalDeaths / totalCases) * 100;
              percentChange = -mortalityRate; 
            } else {
              percentChange = -(Math.log10(totalCases) - 3);
            }
            
            trendType = 'falling';
          }
          
          if (percentChange !== 0) {
            let calculatedAbsoluteChange = newCases;
            if (trendType === 'falling') {
              const activeCases = parseInt(countryData.active_cases || 0);
              const totalDeaths = parseInt(countryData.total_deaths || 0);
              
              if (activeCases > 0) {
                calculatedAbsoluteChange = -activeCases; 
              } else if (totalDeaths > 0) {
                calculatedAbsoluteChange = -totalDeaths; 
              } else {
                calculatedAbsoluteChange = -Math.round((Math.abs(percentChange) / 100) * totalCases);
              }
            }
            
            trends.push({
              country: country || 'Unknown',
              percentChange: Math.round(percentChange * 100) / 100, 
              absoluteChange: calculatedAbsoluteChange,
              currentCases: totalCases,
              previousCases: totalCases - calculatedAbsoluteChange,
              newCases: newCases,
              trend: trendType
            });
          }
        }
      });

      const rising = trends
        .filter(t => t.trend === 'rising')
        .sort((a, b) => b.newCases - a.newCases) 
        .slice(0, 5);

      const falling = trends
        .filter(t => t.trend === 'falling')
        .sort((a, b) => a.percentChange - b.percentChange)
        .slice(0, 5);

      console.log('TrendsChart - Tendances calculées:', { 
        rising: rising.length, 
        falling: falling.length, 
        totalTrends: trends.length,
        risingData: rising,
        fallingData: falling
      });
      
      return { rising, falling };
    } catch (err) {
      console.error('Erreur lors du calcul des tendances:', err);
      return { rising: [], falling: [] };
    }
  };



  const prepareChartData = (trendsData) => {
    const { rising, falling } = trendsData;

    const risingChartData = {
      labels: rising.map(item => item.country.length > 12 ? item.country.substring(0, 12) + '...' : item.country),
      datasets: [{
        label: 'Hausse (%)',
        data: rising.map(item => item.percentChange),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };

    const fallingChartData = {
      labels: falling.map(item => item.country.length > 12 ? item.country.substring(0, 12) + '...' : item.country),
      datasets: [{
        label: 'Baisse (%)',
        data: falling.map(item => Math.abs(item.percentChange)),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };

    return { risingChartData, fallingChartData };
  };

  const risingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 8, right: 8, top: 8, bottom: 8 } },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const dataIndex = context.dataIndex;
            const trend = trendsData.rising[dataIndex];
            
            if (trend) {
              return [
                `Hausse: ${trend.percentChange}%`,
                `Cas actuels: ${trend.currentCases.toLocaleString()}`,
                `Nouveaux cas: +${trend.newCases.toLocaleString()}`
              ];
            }
            return `${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        min: 0,
        max: 0.3,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12
          },
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };

  const fallingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 8, right: 8, top: 8, bottom: 8 } },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const dataIndex = context.dataIndex;
            const trend = trendsData.falling[dataIndex];
            
            if (trend) {
              return [
                `Baisse: ${Math.abs(trend.percentChange)}%`,
                `Cas actuels: ${trend.currentCases.toLocaleString()}`,
                `Impact: ${trend.absoluteChange.toLocaleString()}`
              ];
            }
            return `${Math.abs(context.parsed.y)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        min: 0,
        max: 25,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12
          },
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };

  useEffect(() => {
    setLoading(true);
    try {
      const trends = calculateTrends(data);
      setTrendsData(trends);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du traitement des tendances:', err);
    } finally {
      setLoading(false);
    }
  }, [data]);

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
        <h3>Analyse des tendances en cours...</h3>
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
        <h3>Erreur lors de l'analyse des tendances</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!trendsData || (trendsData.rising.length === 0 && trendsData.falling.length === 0)) {
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
        <ArrowTrendingUpIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3>Aucune tendance significative détectée</h3>
        <p>Les données sont insuffisantes ou les variations trop faibles</p>
      </div>
    );
  }

  const { risingChartData, fallingChartData } = prepareChartData(trendsData);

  return (
    <div className="glass-card" style={{ minHeight: 'auto', padding: '2rem' }}>
      {/* En-tête */}
  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
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
          <ArrowTrendingUpIcon className="w-8 h-8" style={{ color: '#10b981' }} />
          Analyse des Tendances COVID-19
          <ArrowTrendingDownIcon className="w-8 h-8" style={{ color: '#ef4444' }} />
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>
          Top 5 des pays en hausse et en baisse (7 derniers jours)
        </p>
      </div>

      {/* Statistiques rapides */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
  marginBottom: '1rem',
        alignItems: 'start'
      }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '15px',
          padding: '1rem',
          textAlign: 'center',
          minHeight: '120px'
        }}>
          <ArrowTrendingUpIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#10b981' }} />
          <h3 style={{ color: '#10b981', margin: '0.5rem 0' }}>Pays en Hausse</h3>
          <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {trendsData.rising.length}
          </p>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '15px',
          padding: '1rem',
          textAlign: 'center',
          minHeight: '120px'
        }}>
          <ArrowTrendingDownIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#ef4444' }} />
          <h3 style={{ color: '#ef4444', margin: '0.5rem 0' }}>Pays en Baisse</h3>
          <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {trendsData.falling.length}
          </p>
        </div>
      </div>

      {/* Graphiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
  marginBottom: '1rem',
        alignItems: 'start'
      }}>
        {/* Graphique Hausse - toujours affiché */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            minHeight: '460px',
            display: 'flex',
            flexDirection: 'column'
        }}>
          <h3 style={{ 
            color: '#10b981', 
            textAlign: 'center', 
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            height: '40px',
            fontSize: '1.1rem'
          }}>
            <ArrowTrendingUpIcon className="w-6 h-6" />
            Tendances Haussières
          </h3>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            width: '100%',
            minHeight: '380px'
          }}>
            {trendsData.rising.length > 0 ? (
              <div style={{ width: '100%', height: '420px' }}>
                <Line data={risingChartData} options={risingChartOptions} />
              </div>
            ) : (
              <div style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                Aucune hausse détectée
              </div>
            )}
          </div>
        </div>

        {/* Graphique Baisse - toujours affiché */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            minHeight: '460px',
            display: 'flex',
            flexDirection: 'column'
        }}>
          <h3 style={{ 
            color: '#ef4444', 
            textAlign: 'center', 
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            height: '40px',
            fontSize: '1.1rem'
          }}>
            <ArrowTrendingDownIcon className="w-6 h-6" />
            Tendances Baissières
          </h3>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            width: '100%',
            minHeight: '380px'
          }}>
            {trendsData.falling.length > 0 ? (
              <div style={{ width: '100%', height: '420px' }}>
                <Line data={fallingChartData} options={fallingChartOptions} />
              </div>
            ) : (
              <div style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                Aucune baisse détectée
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tableau de détails si pas de place pour les graphiques */}
      {(trendsData.rising.length === 0 || trendsData.falling.length === 0) && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>
            Détails des Tendances
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {[...trendsData.rising, ...trendsData.falling].map((trend, index) => (
              <div key={index} style={{
                background: trend.trend === 'rising' 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${trend.trend === 'rising' 
                  ? 'rgba(16, 185, 129, 0.3)' 
                  : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '10px',
                padding: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  {trend.trend === 'rising' ? (
                    <ArrowTrendingUpIcon className="w-5 h-5" style={{ color: '#10b981' }} />
                  ) : (
                    <ArrowTrendingDownIcon className="w-5 h-5" style={{ color: '#ef4444' }} />
                  )}
                  <h4 style={{ color: 'white', margin: 0 }}>{trend.country}</h4>
                </div>
                <p style={{ 
                  color: trend.trend === 'rising' ? '#10b981' : '#ef4444',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  margin: '0.25rem 0'
                }}>
                  {trend.trend === 'rising' ? '+' : ''}{trend.percentChange}%
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', margin: 0 }}>
                  {trend.currentCases.toLocaleString()} cas actuels
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendsChart;