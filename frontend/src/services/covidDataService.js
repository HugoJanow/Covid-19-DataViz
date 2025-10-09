
import { calculateCasesPerMillion } from './populationData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Service pour récupérer les données COVID avec calculs enrichis
export class CovidDataService {
  
  // Récupérer toutes les données avec enrichissement
  static async getEnrichedCountriesData() {
    try {
      const response = await fetch(`${API_BASE_URL}/cases`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Enrichir les données avec cas par million
      const enrichedData = data.map(country => ({
        ...country,
        cases_per_million: calculateCasesPerMillion(country.total_cases, country.country),
        deaths_per_million: calculateCasesPerMillion(country.total_deaths, country.country),
        // Formatage des nombres pour l'affichage
        total_cases_formatted: this.formatNumber(country.total_cases),
        total_deaths_formatted: this.formatNumber(country.total_deaths),
        new_cases_formatted: this.formatNumber(country.new_cases),
        new_deaths_formatted: this.formatNumber(country.new_deaths),
        // Taux de mortalité
        mortality_rate: country.total_cases > 0 
          ? ((country.total_deaths / country.total_cases) * 100).toFixed(2)
          : '0.00'
      }));
      
      return enrichedData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error;
    }
  }
  
  // Récupérer les statistiques globales
  static async getGlobalStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/global`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des stats globales:', error);
      throw error;
    }
  }
  
  // Récupérer le ranking des pays
  static async getRankingData(limit = 10, metric = 'cases', order = 'desc') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ranking/${limit}?metric=${metric}&order=${order}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Enrichir avec les cas par million
      const enrichedData = data.top_countries.map(country => ({
        ...country,
        cases_per_million: calculateCasesPerMillion(country.total_cases, country.country),
        deaths_per_million: calculateCasesPerMillion(country.total_deaths, country.country),
        total_cases_formatted: this.formatNumber(country.total_cases),
        total_deaths_formatted: this.formatNumber(country.total_deaths),
        mortality_rate: country.total_cases > 0 
          ? ((country.total_deaths / country.total_cases) * 100).toFixed(2)
          : '0.00'
      }));
      
      return {
        ...data,
        top_countries: enrichedData
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du ranking:', error);
      throw error;
    }
  }
  
  // Formatage des nombres avec séparateurs de milliers
  static formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  }
  
  // Formatage compact pour les grands nombres
  static formatCompactNumber(num) {
    if (num === null || num === undefined) return '0';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  // Récupérer les données historiques pour la heatmap
  static async getHistoricalData(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.startDate) params.append('start_date', options.startDate);
      if (options.endDate) params.append('end_date', options.endDate);
      if (options.limitDays) params.append('limit_days', options.limitDays);
      
      const url = `${API_BASE_URL}/historical${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transformer les données pour la heatmap
      const processedData = data.data.map(day => ({
        ...day,
        dateObj: new Date(day.date),
        intensity: this.calculateIntensity(day.new_cases, data.metadata.max_new_cases)
      }));
      
      return {
        days: processedData,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données historiques:', error);
      throw error;
    }
  }

  // Calculer l'intensité pour la heatmap (0-4)
  static calculateIntensity(cases, maxCases) {
    if (!cases || !maxCases) return 0;
    const ratio = cases / maxCases;
    if (ratio === 0) return 0;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  }
}

export default CovidDataService;