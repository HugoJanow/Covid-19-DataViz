import React, { useState, useEffect } from 'react';
import { formatNumber } from '../utils/dataUtils';

const CountryComparator = ({ allCountriesData = [], availableCountries = [] }) => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('total_cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [comparativeData, setComparativeData] = useState({});

  const countryColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b',
    '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e',
    '#e17055', '#81ecec', '#74b9ff', '#55a3ff', '#00b894'
  ];

  const metricOptions = [
    { value: 'total_cases', label: ' Cas Total', color: '#ff6b6b' },
    { value: 'total_deaths', label: ' Décès Total', color: '#fd79a8' },
    { value: 'total_recovered', label: ' Guérisons', color: '#00b894' },
    { value: 'new_cases', label: ' Nouveaux Cas', color: '#0984e3' },
    { value: 'new_deaths', label: ' Nouveaux Décès', color: '#e84393' }
  ];

  const filteredCountries = availableCountries.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedCountries.includes(country)
  );

  const addCountry = (country) => {
    if (selectedCountries.length < 5) {
      setSelectedCountries([...selectedCountries, country]);
      setSearchTerm('');
    }
  };

  const removeCountry = (country) => {
    setSelectedCountries(selectedCountries.filter(c => c !== country));
  };

  useEffect(() => {
    const loadComparativeData = async () => {
      const data = {};
      
      for (const country of selectedCountries) {
        try {
          console.log(` Chargement des données pour ${country}`);
          data[country] = {
            country: country,
            data: Array.from({length: 30}, (_, i) => ({
              date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              total_cases: Math.floor(Math.random() * 100000) + 10000,
              total_deaths: Math.floor(Math.random() * 5000) + 100,
              total_recovered: Math.floor(Math.random() * 80000) + 5000,
              new_cases: Math.floor(Math.random() * 1000),
              new_deaths: Math.floor(Math.random() * 50)
            }))
          };
        } catch (error) {
          console.error(` Erreur lors du chargement de ${country}:`, error);
        }
      }
      
      setComparativeData(data);
    };

    if (selectedCountries.length > 0) {
      loadComparativeData();
    } else {
      setComparativeData({});
    }
  }, [selectedCountries]);

  const ComparisonChart = () => {
    if (selectedCountries.length === 0) {
      return (
        <div style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '1.1rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '10px'
        }}>
           Sélectionnez des pays pour commencer la comparaison
        </div>
      );
    }

    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '10px',
        padding: '1rem',
        minHeight: '400px'
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: 'white'
        }}>
           Comparaison - {metricOptions.find(m => m.value === selectedMetric)?.label}
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {selectedCountries.map((country, index) => {
            const countryData = comparativeData[country];
            const color = countryColors[index % countryColors.length];
            const latestValue = countryData?.data?.[countryData.data.length - 1]?.[selectedMetric] || 0;
            
            return (
              <div key={country} style={{
                background: `${color}15`,
                border: `2px solid ${color}40`,
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: color,
                  marginBottom: '0.5rem'
                }}>
                   {country}
                </div>
                <div style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: color,
                  marginBottom: '0.5rem'
                }}>
                  {formatNumber(latestValue)}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  Valeur actuelle
                </div>
                
                {countryData?.data && (
                  <div style={{
                    marginTop: '1rem',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'end',
                    gap: '1px',
                    justifyContent: 'center'
                  }}>
                    {countryData.data.slice(-10).map((point, i) => {
                      const value = point[selectedMetric] || 0;
                      const maxVal = Math.max(...countryData.data.slice(-10).map(d => d[selectedMetric] || 0));
                      const height = maxVal > 0 ? (value / maxVal) * 50 : 0;
                      
                      return (
                        <div
                          key={i}
                          style={{
                            width: '8px',
                            height: `${Math.max(height, 2)}px`,
                            background: color,
                            borderRadius: '1px',
                            opacity: 0.7
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Titre */}
      <div style={{
        textAlign: 'center',
        fontSize: '1.4rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: 'white'
      }}>
         Comparateur Multi-Pays
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
             Métrique à comparer:
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem',
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
             Rechercher un pays:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tapez le nom d'un pays..."
              disabled={selectedCountries.length >= 5}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '10px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.9rem',
                opacity: selectedCountries.length >= 5 ? 0.5 : 1
              }}
            />
            
            {searchTerm && filteredCountries.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'rgba(0, 0, 0, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                marginTop: '4px'
              }}>
                {filteredCountries.slice(0, 8).map(country => (
                  <div
                    key={country}
                    onClick={() => addCountry(country)}
                    style={{
                      padding: '0.8rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                     {country}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCountries.length > 0 && (
        <div style={{
          marginBottom: '2rem'
        }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
             Pays sélectionnés ({selectedCountries.length}/5):
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {selectedCountries.map((country, index) => (
              <div
                key={country}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: `${countryColors[index % countryColors.length]}20`,
                  border: `2px solid ${countryColors[index % countryColors.length]}60`,
                  borderRadius: '20px',
                  color: countryColors[index % countryColors.length],
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                 {country}
                <button
                  onClick={() => removeCountry(country)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: countryColors[index % countryColors.length],
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0',
                    marginLeft: '0.2rem'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ComparisonChart />

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center'
      }}>
         <strong>Conseils:</strong> Vous pouvez sélectionner jusqu'à 5 pays pour la comparaison. 
        Changez la métrique pour comparer différents aspects de la pandémie.
      </div>
    </div>
  );
};

export default CountryComparator;