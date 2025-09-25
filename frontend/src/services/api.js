import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response) {
      throw new Error(error.response.data.error || 'Erreur serveur');
    } else if (error.request) {
      throw new Error('Impossible de contacter le serveur');
    } else {
      throw new Error('Erreur de connexion');
    }
  }
);

const covidAPI = {
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  getGlobalStats: async () => {
    try {
      console.log(' Fetching global stats...');
      const response = await apiClient.get('/global');
      console.log(' Global stats received:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Error fetching global stats:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  getTopCountries: async (limit = 10, metric = 'total_cases') => {
    try {
      console.log(` Fetching top ${limit} countries by ${metric}...`);
      const response = await apiClient.get('/top-countries', {
        params: { limit, metric }
      });
      console.log(' Top countries received:', response.data?.length, 'countries');
      return response.data || [];
    } catch (error) {
      console.error(' Error fetching top countries:', error);
      throw error;
    }
  },

  getCountriesList: async () => {
    try {
      console.log(' Fetching countries list...');
      const response = await apiClient.get('/countries');
      console.log(' Countries list received:', response.data?.countries?.length, 'countries');
      return response.data?.countries || [];
    } catch (error) {
      console.error(' Error fetching countries list:', error);
      throw error;
    }
  },

  getCountryTimeline: async (country, days = 30) => {
    try {
      console.log(` Fetching timeline for ${country}...`);
      const response = await apiClient.get(`/countries/${encodeURIComponent(country)}`, {
        params: { days }
      });
      console.log(` Timeline for ${country} received:`, response.data);
      return response.data;
    } catch (error) {
      console.error(` Error fetching timeline for ${country}:`, error);
      throw error;
    }
  },

  getCountryData: async (countryName) => {
    try {
      console.log(` Fetching current data for ${countryName}...`);
      const response = await apiClient.get(`/countries/${countryName}`);
      console.log(' Country data received:', response.data);
      return response.data;
    } catch (error) {
      console.error(` Error fetching data for ${countryName}:`, error);
      throw error;
    }
  },


  getAllData: async () => {
    try {
      console.log(' Fetching all raw data...');
      const response = await apiClient.get('/cases');
      console.log(' All data received:', response.data?.length, 'entries');
      return response.data || [];
    } catch (error) {
      console.error(' Error fetching all data:', error);
      throw error;
    }
  },

  getCases: async (limit = 20, sort = 'total_cases') => {
    try {
      if (limit <= 50) {
        const response = await apiClient.get('/top-countries', {
          params: { 
            metric: sort || 'total_cases',
            limit: limit 
          }
        });
        
        return {
          data: response.data || [],
          last_update: response.data?.[0]?.last_update || null
        };
      } else {
        const response = await apiClient.get('/cases');
        
        return {
          data: response.data || [],
          last_update: response.data?.[0]?.last_update || null
        };
      }
    } catch (error) {
      console.error(' Error in getCases:', error);
      throw error;
    }
  },

  getFilteredData: async (startDate, endDate) => {
    try {
      console.log(` Fetching filtered data: ${startDate} → ${endDate}`);
      const params = {};
      
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiClient.get('/data/filtered', { params });
      console.log(' Filtered data received:', response.data?.data?.length, 'entries');
      return response.data || { data: [], period: {} };
    } catch (error) {
      console.error(' Error fetching filtered data:', error);
      throw error;
    }
  },

  getAvailableDates: async () => {
    try {
      console.log(' Fetching available dates...');
      const response = await apiClient.get('/dates/available');
      console.log(' Available dates received:', response.data?.count, 'dates');
      return response.data || { dates: [], count: 0 };
    } catch (error) {
      console.error(' Error fetching available dates:', error);
      throw error;
    }
  },
};

export default covidAPI;