import React, { useState } from 'react';
import './index.css';
import { useCovidData } from './hooks/useCovidData';
import GlobalStats from './components/GlobalStats';
import BarChart from './components/BarChart';
import TimelineChart from './components/TimelineChart';
import CountryComparator from './components/CountryComparator';
import WorldMap from './components/WorldMapNew';

function App() {
  const { 
    globalStats, 
    topCountries, 
    countries, 
    allData,
    isLoading, 
    error, 
    loadCountryTimeline,
    refreshData,
    filterDataByDateRange
  } = useCovidData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countryTimeline, setCountryTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('total_cases');

  const handleDateRangeChange = (startDate, endDate) => {
    console.log(' APP.JS - handleDateRangeChange appelée:', startDate, '→', endDate);
    filterDataByDateRange(startDate, endDate);
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setTimelineLoading(true);
    
    try {
      const timeline = await loadCountryTimeline(country);
      setCountryTimeline(timeline);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const filteredCountries = Array.isArray(countries) ? countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  ) : [];

  const hasError = error && !isLoading;

  if (isLoading) {
    return (
      <div className="app" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTop: '4px solid #4facfe',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <h2>Chargement des données COVID-19...</h2>
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="content-container">
          <div className="glass-card">
            <h2 style={{ 
              fontSize: '2rem', 
              textAlign: 'center',
              background: 'var(--gradient-3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '2rem'
            }}>
               Situation Mondiale
            </h2>
            <GlobalStats data={globalStats} />
          </div>
          <div className="glass-card">
            <h2 style={{ 
              fontSize: '2rem', 
              textAlign: 'center',
              background: 'var(--gradient-2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '2rem'
            }}>
               Top des Pays
            </h2>
            <BarChart data={topCountries} />
          </div>
        </div>
      );
    }

    if (activeTab === 'timeline') {
      return (
        <div className="content-container">
          <div className="glass-card">
            <h2 style={{ 
              fontSize: '2rem', 
              textAlign: 'center',
              background: 'var(--gradient-main)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '2rem'
            }}>
               Timeline par Pays
            </h2>
            <div style={{ marginBottom: '2rem' }}>
              <input
                type="text"
                placeholder=" Rechercher un pays..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
              />
              <select
                value={selectedCountry}
                onChange={(e) => handleCountrySelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="">Sélectionner un pays...</option>
                {filteredCountries.slice(0, 50).map(country => (
                  <option key={country} value={country} style={{ background: '#1a1a2e' }}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            {timelineLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Chargement...</p>
              </div>
            ) : countryTimeline && selectedCountry ? (
              <TimelineChart 
                data={countryTimeline} 
                countryName={selectedCountry}
                onDateRangeChange={handleDateRangeChange}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                <p>Veuillez sélectionner un pays</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'compare') {
      return (
        <div className="content-container">
          <CountryComparator 
            allCountriesData={allData || []}
            availableCountries={countries}
          />
        </div>
      );
    }

    if (activeTab === 'worldmap') {
      return (
        <div className="content-container">
          <div className="glass-card">
            <h2 style={{ 
              fontSize: '2rem', 
              textAlign: 'center',
              background: 'var(--gradient-3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '2rem'
            }}>
               Carte Mondiale COVID-19
            </h2>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2rem',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {['total_cases', 'total_deaths', 'new_cases', 'new_deaths'].map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: selectedMetric === metric 
                      ? 'rgba(78, 205, 196, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {metric.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
            
            <WorldMap 
              covidData={allData || []}
              selectedMetric={selectedMetric}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app">
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{
          background: 'var(--gradient-main)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.8rem',
          margin: 0
        }}>
           COVID-19 Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {hasError && (
            <div style={{
              background: 'rgba(245, 87, 108, 0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem'
            }}>
              <span> Connexion limitée</span>
            </div>
          )}
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '15px',
              border: 'none',
              background: activeTab === 'dashboard' ? 'var(--gradient-main)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
             Dashboard
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '15px',
              border: 'none',
              background: activeTab === 'timeline' ? 'var(--gradient-main)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
             Timeline
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '15px',
              border: 'none',
              background: activeTab === 'compare' ? 'var(--gradient-main)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
             Comparateur
          </button>
          <button
            onClick={() => setActiveTab('worldmap')}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '15px',
              border: 'none',
              background: activeTab === 'worldmap' ? 'var(--gradient-main)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
             Carte Mondiale
          </button>
          <button
            onClick={refreshData}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '15px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
             Actualiser
          </button>
        </div>
      </nav>
      <main style={{ padding: '2rem', minHeight: 'calc(100vh - 80px)' }}>
        {renderContent()}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        opacity: 0.7
      }}>
        <p> Dashboard COVID-19 - Données en temps réel</p>
      </footer>
    </div>
  );
}

export default App;
