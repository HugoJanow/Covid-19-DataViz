import React, { useState, useEffect, useRef } from 'react';
import { formatNumber } from '../utils/dataUtils';

const worldCountries = [
  // Amérique du Nord
  { name: 'United States', x: 200, y: 150, size: 80 },
  { name: 'Canada', x: 180, y: 120, size: 60 },
  { name: 'Mexico', x: 160, y: 180, size: 40 },
  { name: 'Guatemala', x: 150, y: 190, size: 15 },
  { name: 'Cuba', x: 170, y: 200, size: 12 },
  
  // Amérique du Sud
  { name: 'Brazil', x: 280, y: 250, size: 70 },
  { name: 'Argentina', x: 260, y: 320, size: 45 },
  { name: 'Peru', x: 240, y: 240, size: 35 },
  { name: 'Colombia', x: 230, y: 220, size: 30 },
  { name: 'Chile', x: 250, y: 330, size: 25 },
  { name: 'Venezuela', x: 240, y: 210, size: 20 },
  { name: 'Ecuador', x: 220, y: 230, size: 15 },
  { name: 'Bolivia', x: 250, y: 260, size: 15 },
  { name: 'Uruguay', x: 270, y: 330, size: 10 },
  
  // Europe
  { name: 'Russia', x: 580, y: 100, size: 90 },
  { name: 'Germany', x: 480, y: 130, size: 35 },
  { name: 'France', x: 460, y: 140, size: 30 },
  { name: 'United Kingdom', x: 440, y: 120, size: 30 },
  { name: 'Italy', x: 480, y: 150, size: 30 },
  { name: 'Spain', x: 440, y: 150, size: 30 },
  { name: 'Poland', x: 500, y: 125, size: 25 },
  { name: 'Ukraine', x: 520, y: 130, size: 25 },
  { name: 'Romania', x: 510, y: 145, size: 20 },
  { name: 'Netherlands', x: 470, y: 120, size: 15 },
  { name: 'Belgium', x: 465, y: 125, size: 12 },
  { name: 'Czech Republic', x: 485, y: 130, size: 12 },
  { name: 'Portugal', x: 430, y: 155, size: 12 },
  { name: 'Sweden', x: 485, y: 105, size: 15 },
  { name: 'Norway', x: 480, y: 100, size: 12 },
  { name: 'Finland', x: 510, y: 100, size: 12 },
  { name: 'Denmark', x: 475, y: 115, size: 10 },
  { name: 'Switzerland', x: 470, y: 135, size: 10 },
  { name: 'Austria', x: 485, y: 135, size: 10 },
  { name: 'Hungary', x: 495, y: 140, size: 10 },
  { name: 'Greece', x: 500, y: 160, size: 10 },
  { name: 'Croatia', x: 485, y: 145, size: 8 },
  
  // Asie
  { name: 'China', x: 650, y: 160, size: 80 },
  { name: 'India', x: 620, y: 200, size: 70 },
  { name: 'Japan', x: 720, y: 150, size: 25 },
  { name: 'South Korea', x: 700, y: 145, size: 20 },
  { name: 'Indonesia', x: 680, y: 230, size: 40 },
  { name: 'Turkey', x: 520, y: 160, size: 35 },
  { name: 'Iran', x: 570, y: 170, size: 30 },
  { name: 'Thailand', x: 650, y: 210, size: 25 },
  { name: 'Vietnam', x: 660, y: 200, size: 20 },
  { name: 'Philippines', x: 700, y: 210, size: 20 },
  { name: 'Malaysia', x: 660, y: 220, size: 18 },
  { name: 'Singapore', x: 660, y: 225, size: 8 },
  { name: 'Pakistan', x: 600, y: 180, size: 30 },
  { name: 'Bangladesh', x: 630, y: 190, size: 20 },
  { name: 'Myanmar', x: 640, y: 200, size: 15 },
  { name: 'Cambodia', x: 655, y: 210, size: 10 },
  { name: 'Laos', x: 650, y: 205, size: 8 },
  { name: 'Nepal', x: 625, y: 185, size: 8 },
  { name: 'Sri Lanka', x: 625, y: 215, size: 8 },
  
  // Moyen-Orient
  { name: 'Israel', x: 530, y: 175, size: 10 },
  { name: 'Saudi Arabia', x: 550, y: 190, size: 25 },
  { name: 'UAE', x: 570, y: 195, size: 12 },
  { name: 'Iraq', x: 555, y: 175, size: 15 },
  { name: 'Kuwait', x: 560, y: 180, size: 8 },
  { name: 'Qatar', x: 565, y: 195, size: 6 },
  { name: 'Oman', x: 575, y: 205, size: 8 },
  { name: 'Jordan', x: 535, y: 175, size: 8 },
  { name: 'Lebanon', x: 530, y: 170, size: 6 },
  
  // Afrique
  { name: 'South Africa', x: 520, y: 320, size: 40 },
  { name: 'Nigeria', x: 480, y: 220, size: 35 },
  { name: 'Egypt', x: 520, y: 180, size: 30 },
  { name: 'Ethiopia', x: 540, y: 240, size: 25 },
  { name: 'Kenya', x: 540, y: 250, size: 20 },
  { name: 'Ghana', x: 465, y: 225, size: 15 },
  { name: 'Morocco', x: 450, y: 175, size: 15 },
  { name: 'Algeria', x: 465, y: 185, size: 20 },
  { name: 'Tunisia', x: 475, y: 170, size: 10 },
  { name: 'Libya', x: 490, y: 180, size: 15 },
  { name: 'Sudan', x: 525, y: 210, size: 15 },
  { name: 'Tanzania', x: 535, y: 260, size: 15 },
  { name: 'Uganda', x: 530, y: 250, size: 10 },
  { name: 'Angola', x: 500, y: 290, size: 15 },
  { name: 'Mozambique', x: 535, y: 300, size: 12 },
  { name: 'Madagascar', x: 550, y: 310, size: 10 },
  
  // Océanie
  { name: 'Australia', x: 740, y: 320, size: 50 },
  { name: 'New Zealand', x: 780, y: 350, size: 15 },
  { name: 'Papua New Guinea', x: 720, y: 250, size: 12 }
];

const WorldMap = ({ countriesData = [], selectedMetric = 'total_cases', onMetricChange }) => {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [currentMetric, setCurrentMetric] = useState(selectedMetric);
  const canvasRef = useRef(null);

  const metricOptions = [
    { value: 'total_cases', label: ' Cas Confirmés', color: '#ff6b6b' },
    { value: 'total_deaths', label: ' Décès Total', color: '#fd79a8' },
    { value: 'total_recovered', label: ' Guérisons', color: '#00b894' },
    { value: 'new_cases', label: ' Nouveaux Cas', color: '#0984e3' },
    { value: 'new_deaths', label: ' Nouveaux Décès', color: '#e84393' }
  ];

  const getMetricColor = (metric) => {
    const option = metricOptions.find(m => m.value === metric);
    return option ? option.color : '#74b9ff';
  };

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;

      ctx.clearRect(0, 0, width, height);

      const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
      oceanGradient.addColorStop(0, '#1a1a2e');
      oceanGradient.addColorStop(1, '#16213e');
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(140, 90, 220, 140, 15);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(220, 240, 80, 140, 10);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(420, 100, 120, 80, 8);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(450, 180, 100, 160, 10);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(550, 80, 200, 150, 12);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(720, 290, 90, 80, 8);
      ctx.fill();
      ctx.stroke();

      const allValues = countriesData.map(c => c[currentMetric] || 0).filter(v => v > 0);
      const maxValue = Math.max(...allValues, 1);
      const minValue = Math.min(...allValues, 0);

      worldCountries.forEach(country => {
        const countryData = countriesData.find(c => 
          c.country && (
            c.country.toLowerCase().includes(country.name.toLowerCase()) ||
            country.name.toLowerCase().includes(c.country.toLowerCase())
          )
        );
        
        const value = countryData?.[currentMetric] || 0;
        
        let intensity = 0.1;
        let pointSize = Math.max(3, country.size * 0.2);
        
        if (value > 0 && maxValue > 0) {
          intensity = Math.min((value - minValue) / (maxValue - minValue), 1);
          pointSize = Math.max(5, country.size * 0.15 + intensity * 25);
        }

        const baseColor = getMetricColor(currentMetric);
        const opacity = Math.max(0.2, intensity);
        
        if (hoveredCountry === country.name || selectedCountry === country.name) {
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        } else {
          const gradient = ctx.createRadialGradient(
            country.x, country.y, 0,
            country.x, country.y, pointSize
          );
          
          const hex = baseColor.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${Math.min(opacity + 0.3, 1)})`);
          gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${opacity})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`);
          
          ctx.fillStyle = gradient;
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
        
        ctx.beginPath();
        ctx.arc(country.x, country.y, pointSize, 0, 2 * Math.PI);
        ctx.fill();
        
        if (value > 0) {
          ctx.strokeStyle = hoveredCountry === country.name ? '#ffffff' : baseColor;
          ctx.lineWidth = hoveredCountry === country.name ? 3 : 1;
          ctx.stroke();
        }
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        if (hoveredCountry === country.name || selectedCountry === country.name) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.roundRect(country.x - 50, country.y - pointSize - 35, 100, 25, 5);
          ctx.fill();
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            country.name, 
            country.x, 
            country.y - pointSize - 18
          );
          
          if (countryData && value > 0) {
            ctx.font = 'bold 10px Arial';
            ctx.fillStyle = baseColor;
            ctx.fillText(
              formatNumber(value),
              country.x,
              country.y - pointSize - 6
            );
          }
        }
      });

      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        ` Carte Mondiale - ${metricOptions.find(m => m.value === currentMetric)?.label || 'Données COVID'}`,
        width / 2,
        25
      );
    };
    
    draw();
  }, [countriesData, currentMetric, hoveredCountry, selectedCountry]);

  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    let foundCountry = null;
    let minDistance = Infinity;

    worldCountries.forEach(country => {
      const distance = Math.sqrt(
        Math.pow(x - country.x, 2) + Math.pow(y - country.y, 2)
      );
      
      if (distance < 35 && distance < minDistance) {
        minDistance = distance;
        foundCountry = country.name;
      }
    });

    setHoveredCountry(foundCountry);
  };

  const handleClick = (event) => {
    if (hoveredCountry) {
      setSelectedCountry(selectedCountry === hoveredCountry ? null : hoveredCountry);
    }
  };

  const handleMetricChange = (newMetric) => {
    setCurrentMetric(newMetric);
    if (onMetricChange) {
      onMetricChange(newMetric);
    }
  };

  const getSelectedCountryData = () => {
    if (!selectedCountry) return null;
    return countriesData.find(c => 
      c.country && (
        c.country.toLowerCase().includes(selectedCountry.toLowerCase()) ||
        selectedCountry.toLowerCase().includes(c.country.toLowerCase())
      )
    );
  };

  const selectedData = getSelectedCountryData();

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        textAlign: 'center',
        fontSize: '1.4rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: 'white'
      }}>
         Carte Mondiale Interactive - COVID-19
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {metricOptions.map(option => (
          <button
            key={option.value}
            onClick={() => handleMetricChange(option.value)}
            style={{
              padding: '0.8rem 1.2rem',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: currentMetric === option.value ? option.color : 'rgba(255, 255, 255, 0.2)',
              background: currentMetric === option.value 
                ? `${option.color}20` 
                : 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              transform: currentMetric === option.value ? 'scale(1.05)' : 'scale(1)',
              boxShadow: currentMetric === option.value 
                ? `0 0 15px ${option.color}40` 
                : 'none'
            }}
            onMouseEnter={(e) => {
              if (currentMetric !== option.value) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentMetric !== option.value) {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <canvas
          ref={canvasRef}
          width={900}
          height={450}
          style={{
            maxWidth: '100%',
            height: 'auto',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onMouseLeave={() => setHoveredCountry(null)}
        />
      </div>

      {selectedCountry && (
        <div style={{
          background: `${getMetricColor(currentMetric)}20`,
          border: `2px solid ${getMetricColor(currentMetric)}60`,
          borderRadius: '15px',
          padding: '1.5rem',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            color: 'white',
            marginBottom: '1rem',
            fontSize: '1.3rem'
          }}>
             {selectedCountry}
          </h3>
          
          {selectedData ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              color: 'white'
            }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}>
                  {formatNumber(selectedData.total_cases || 0)}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Cas Confirmés</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fd79a8' }}>
                  {formatNumber(selectedData.total_deaths || 0)}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Décès</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00b894' }}>
                  {formatNumber(selectedData.total_recovered || 0)}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Guérisons</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getMetricColor(currentMetric) }}>
                  {formatNumber(selectedData[currentMetric] || 0)}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Valeur actuelle</div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
               Données non disponibles pour ce pays
            </div>
          )}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1rem',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#4ecdc4' }}>
            {worldCountries.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Pays représentés
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1rem',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#ff6b6b' }}>
            {countriesData.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Pays avec données
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1rem',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#ffeaa7' }}>
            {hoveredCountry || selectedCountry ? '🎯' : '🔍'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            {hoveredCountry || selectedCountry || 'Survolez la carte'}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center'
      }}>
        💡 <strong>Instructions:</strong> Cliquez sur les métriques pour changer l'affichage • 
        Survolez les pays pour voir les détails • Cliquez pour sélectionner/désélectionner
      </div>
    </div>
  );
};

export default WorldMap;