import React, { useState, useEffect, useRef } from 'react';
import { formatNumber, formatDate } from '../utils/dataUtils';

const LineChart = ({ 
  data = [], 
  selectedMetric = 'total_cases', 
  height = 400,
  country = 'N/A'
}) => {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  console.log(' LineChart data reçue:', data, 'metric:', selectedMetric);

  useEffect(() => {
    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas || !data || data.length === 0) return;

      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      
      ctx.clearRect(0, 0, width, height);

      const padding = { top: 40, right: 40, bottom: 60, left: 80 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      const values = data.map(d => d[selectedMetric] || 0);
      const dates = data.map(d => d.date);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const valueRange = maxValue - minValue;

      const getMetricColor = (metric) => {
        switch(metric) {
          case 'total_cases': return '#ff6b6b';
          case 'total_deaths': return '#fd79a8';
          case 'total_recovered': return '#00b894';
          case 'new_cases': return '#0984e3';
          case 'new_deaths': return '#e84393';
          default: return '#74b9ff';
        }
      };

      const lineColor = getMetricColor(selectedMetric);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();

        const value = maxValue - (valueRange / 5) * i;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(formatNumber(value), padding.left - 10, y + 4);
      }

      const timeStep = Math.max(1, Math.floor(data.length / 8));
      for (let i = 0; i < data.length; i += timeStep) {
        const x = padding.left + (chartWidth / (data.length - 1)) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + chartHeight);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x, padding.top + chartHeight + 20);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(formatDate(dates[i]), 0, 0);
        ctx.restore();
      }

      if (values.length > 1) {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.beginPath();

        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, `${lineColor}40`);
        gradient.addColorStop(1, `${lineColor}10`);
        const points = values.map((value, index) => {
          const x = padding.left + (chartWidth / (data.length - 1)) * index;
          const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
          return { x, y, value, index };
        });

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartHeight);
        points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        ctx.fillStyle = lineColor;
        points.forEach((point, index) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fill();
          
          if (hoveredPoint === index) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        ` ${country} - Évolution ${selectedMetric}`,
        width / 2,
        25
      );
    };

    drawChart();
  }, [data, selectedMetric, hoveredPoint, country]);

  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;

    const padding = { top: 40, right: 40, bottom: 60, left: 80 };
    const chartWidth = canvas.width - padding.left - padding.right;

    const pointIndex = Math.round(((x - padding.left) / chartWidth) * (data.length - 1));
    
    if (pointIndex >= 0 && pointIndex < data.length) {
      setHoveredPoint(pointIndex);
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  if (!data || data.length === 0) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '1.1rem'
      }}>
         Aucune donnée pour la courbe d'évolution
      </div>
    );
  }

  return (
    <div style={{ 
      height: `${height}px`, 
      position: 'relative',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '10px',
      padding: '1rem',
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        width={1200}
        height={height - 32}
        style={{
          width: '100%',
          height: `${height - 32}px`,
          cursor: 'crosshair',
          maxWidth: '100%',
          objectFit: 'contain'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {hoveredPoint !== null && data[hoveredPoint] && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.95)',
          color: 'white',
          padding: '1rem',
          borderRadius: '10px',
          fontSize: '0.9rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 10,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          minWidth: '200px'
        }}>
          <div style={{ 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '0.5rem'
          }}>
            {formatDate(data[hoveredPoint].date)}
          </div>
          <div style={{ 
            color: (() => {
              switch(selectedMetric) {
                case 'total_cases': return '#ff6b6b';
                case 'total_deaths': return '#fd79a8';
                case 'total_recovered': return '#00b894';
                case 'new_cases': return '#0984e3';
                case 'new_deaths': return '#e84393';
                default: return '#74b9ff';
              }
            })(),
            marginBottom: '0.3rem'
          }}>
            <strong>{selectedMetric}:</strong> {formatNumber(data[hoveredPoint][selectedMetric] || 0)}
          </div>
          {data[hoveredPoint].new_cases && selectedMetric !== 'new_cases' && (
            <div style={{ color: '#0984e3', fontSize: '0.8rem' }}>
              Nouveaux cas: {formatNumber(data[hoveredPoint].new_cases)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LineChart;