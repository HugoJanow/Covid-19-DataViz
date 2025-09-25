import React, { useState, useMemo, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  ZoomableGroup
} from 'react-simple-maps';
import { formatNumber } from '../utils/dataUtils';

const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

const getCountryAlternatives = (countryName) => {
  const nameMap = {
    'united states': ['usa', 'us', 'america'],
    'usa': ['united states', 'us', 'america'],
    'us': ['united states', 'usa', 'america'],
    'united kingdom': ['uk', 'britain', 'great britain'],
    'uk': ['united kingdom', 'britain', 'great britain'],
    'south korea': ['korea, republic of', 'republic of korea'],
    'north korea': ['korea, democratic people\'s republic of'],
    'russia': ['russian federation'],
    'iran': ['iran, islamic republic of'],
    'venezuela': ['venezuela, bolivarian republic of'],
    'syria': ['syrian arab republic'],
    'tanzania': ['tanzania, united republic of'],
    'bolivia': ['bolivia, plurinational state of'],
    'vietnam': ['viet nam'],
    'laos': ['lao people\'s democratic republic'],
    'brunei': ['brunei darussalam'],
    'moldova': ['republic of moldova'],
    'czechia': ['czech republic'],
    'macedonia': ['north macedonia'],
    'democratic republic of congo': ['congo, the democratic republic of the', 'drc'],
    'republic of congo': ['congo'],
  };
  
  return nameMap[countryName] || [];
};

const WorldMap = ({ covidData = [], selectedMetric = 'total_cases' }) => {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const covidDataMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(covidData)) {
      covidData.forEach(country => {
        if (country.country || country.location) {
          const countryName = (country.country || country.location).toLowerCase();
          map.set(countryName, country);
          const alternatives = getCountryAlternatives(countryName);
          alternatives.forEach(alt => map.set(alt, country));
        }
      });
    }
    return map;
  }, [covidData]);

  const { minValue, maxValue } = useMemo(() => {
    const values = Array.from(covidDataMap.values())
      .map(country => country[selectedMetric] || 0)
      .filter(value => value > 0);
    
    return {
      minValue: Math.min(...values) || 0,
      maxValue: Math.max(...values) || 1
    };
  }, [covidDataMap, selectedMetric]);

  if (isLoading) {
    return (
      <div style={{ 
        height: '600px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: '15px',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
          <div>Chargement de la carte mondiale...</div>
        </div>
      </div>
    );
  }

  const getCountryColor = (countryData) => {
    if (!countryData || !countryData[selectedMetric] || countryData[selectedMetric] === 0) {
      return 'rgba(100, 100, 100, 0.3)';
    }

    const value = countryData[selectedMetric];
    const normalizedValue = Math.min((value - minValue) / (maxValue - minValue), 1);
    
    if (selectedMetric.includes('cases')) {
      const intensity = normalizedValue;
      return `rgba(${Math.floor(255 * (0.3 + intensity * 0.7))}, ${Math.floor(100 * (1 - intensity * 0.5))}, ${Math.floor(100 * (1 - intensity * 0.5))}, 0.8)`;
    } else if (selectedMetric.includes('deaths')) {
      const intensity = normalizedValue;
      return `rgba(${Math.floor(200 * (0.4 + intensity * 0.6))}, ${Math.floor(50 * (1 - intensity * 0.3))}, ${Math.floor(50 * (1 - intensity * 0.3))}, 0.8)`;
    } else if (selectedMetric.includes('recovered')) {
      const intensity = normalizedValue;
      return `rgba(${Math.floor(100 * (1 - intensity * 0.3))}, ${Math.floor(255 * (0.3 + intensity * 0.7))}, ${Math.floor(100 * (1 - intensity * 0.3))}, 0.8)`;
    } else {
      const intensity = normalizedValue;
      return `rgba(${Math.floor(100 * (1 - intensity * 0.3))}, ${Math.floor(150 * (1 - intensity * 0.2))}, ${Math.floor(255 * (0.3 + intensity * 0.7))}, 0.8)`;
    }
  };

  const findCountryData = (geoProperties) => {
    const geoName = geoProperties.NAME?.toLowerCase() || 
                    geoProperties.NAME_EN?.toLowerCase() || 
                    geoProperties.ADMIN?.toLowerCase() ||
                    geoProperties.name?.toLowerCase() ||
                    geoProperties.name_en?.toLowerCase();
                    
    if (!geoName) {
      return null;
    }
    
    const searchNames = [geoName].filter(Boolean);
    
    const specialMappings = {
      'united states of america': 'united states',
      'united kingdom': 'united kingdom',
      'russian federation': 'russia',
      'iran (islamic republic of)': 'iran',
      'venezuela (bolivarian republic of)': 'venezuela',
      'syrian arab republic': 'syria',
      'united republic of tanzania': 'tanzania',
      'bolivia (plurinational state of)': 'bolivia',
      'viet nam': 'vietnam',
      "lao people's democratic republic": 'laos',
      'brunei darussalam': 'brunei',
      'republic of moldova': 'moldova',
      'czech republic': 'czechia',
      'republic of korea': 'south korea',
      "democratic people's republic of korea": 'north korea',
      'congo': 'republic of congo',
      'democratic republic of the congo': 'democratic republic of congo'
    };
    
    for (const name of searchNames) {
      if (specialMappings[name]) {
        searchNames.push(specialMappings[name]);
      }
    }
    
    for (const name of searchNames) {
      if (covidDataMap.has(name)) {
        const data = covidDataMap.get(name);
        return data;
      }
    }
    
    return null;
  };

  const handleMouseEnter = (geo, event) => {
    const countryData = findCountryData(geo.properties);
    const countryName = geo.properties.NAME || geo.properties.name || geo.properties.ADMIN || geo.properties.NAME_EN || 'Pays inconnu';
    
    if (countryData) {
      setTooltipContent(
        `${countryName}\nCas: ${formatNumber(countryData.total_cases || 0)}\nDécès: ${formatNumber(countryData.total_deaths || 0)}\n${selectedMetric}: ${formatNumber(countryData[selectedMetric] || 0)}`
      );
    } else {
      setTooltipContent(`${countryName}\nPas de données`);
    }
    
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '600px',
      borderRadius: '15px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
          center: [0, 20]
        }}
        width={1000}
        height={600}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <ZoomableGroup>
          <Sphere stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} fill="none" />
          
          <Graticule stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
          
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const countryData = findCountryData(geo.properties);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(countryData)}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={0.5}
                    onMouseEnter={(event) => handleMouseEnter(geo, event)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      },
                      hover: {
                        fill: countryData ? getCountryColor(countryData) : 'rgba(255,255,255,0.2)',
                        stroke: '#ffffff',
                        strokeWidth: 1,
                        outline: 'none',
                        filter: 'brightness(1.2)'
                      },
                      pressed: {
                        outline: 'none'
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltipContent && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            whiteSpace: 'pre-line',
            pointerEvents: 'none',
            zIndex: 1000,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            maxWidth: '200px'
          }}
        >
          {tooltipContent}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          right: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '0.75rem',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>
             {selectedMetric.replace('_', ' ').toUpperCase()}
          </div>
          <div>Min: {formatNumber(minValue)}</div>
          <div>Max: {formatNumber(maxValue)}</div>
          <div style={{ fontSize: '0.7rem', marginTop: '0.3rem', opacity: 0.8 }}>
            Gris = Pas de données
          </div>
        </div>
        
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '0.75rem',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.75rem',
            textAlign: 'right'
          }}
        >
          <div> Pays avec données: {Array.from(covidDataMap.values()).length}</div>
          <div> Total mappé: {covidData.length} pays</div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;