import { useState, useEffect, useCallback } from 'react';
import covidAPI from '../services/api';

export const useCovidData = () => {
  const [state, setState] = useState({
    globalStats: null,
    topCountries: [],
    countries: [],
    allCountriesData: [],
    allData: [],
    availableDates: [],
    dateRange: { start: null, end: null },
    loading: true,
    error: null,
    lastUpdate: null
  });

  const loadInitialData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(' Chargement des données COVID...');
      try {
        await covidAPI.healthCheck();
        console.log(' API disponible');
      } catch (healthError) {
        console.warn(' Health check échoué, tentative de chargement direct...');
      }

      const [globalStats, topCountries, countries, allData, availableDatesData] = await Promise.all([
        covidAPI.getGlobalStats(),
        covidAPI.getTopCountries(20, 'total_cases'),
        covidAPI.getCountriesList(),
        covidAPI.getAllData(),
        covidAPI.getAvailableDates()
      ]);

      console.log(' Global stats reçues:', globalStats);
      console.log(' Top countries reçus:', topCountries);
      console.log(' Countries list reçue:', countries);
      console.log(' All data reçue:', allData?.length, 'entries');
      console.log(' Available dates reçues:', availableDatesData?.count, 'dates');

      setState(prev => ({
        ...prev,
        globalStats,
        topCountries: topCountries || [],
        countries: countries || [],
        allData: allData || [],
        availableDates: availableDatesData?.dates || [],
        loading: false,
        lastUpdate: new Date().toISOString()
      }));

      console.log(' Toutes les données chargées avec succès !');

    } catch (error) {
      console.error(' Erreur chargement données:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erreur de chargement des données'
      }));
    }
  }, []);

  const loadCountryTimeline = useCallback(async (countryName, days = 90) => {
    try {
      console.log(` Chargement timeline ${countryName}...`);
      const timeline = await covidAPI.getCountryTimeline(countryName, days);
      return timeline;
    } catch (error) {
      console.error(` Erreur timeline ${countryName}:`, error);
      throw error;
    }
  }, []);

  const refreshData = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  const filterDataByDateRange = useCallback(async (startDate, endDate) => {
    try {
      console.log(` DEBUT FILTRAGE: ${startDate} → ${endDate}`);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const filteredResponse = await covidAPI.getFilteredData(startDate, endDate);
      console.log(' REPONSE FILTRAGE:', filteredResponse);
    
      const filteredData = filteredResponse.data || [];
      console.log(' DONNEES FILTREES:', filteredData.length, 'pays');
      
      const newGlobalStats = {
        total_cases: filteredData.reduce((sum, country) => sum + (country.total_cases || 0), 0),
        total_deaths: filteredData.reduce((sum, country) => sum + (country.total_deaths || 0), 0),
        new_cases: filteredData.reduce((sum, country) => sum + (country.new_cases || 0), 0),
        new_deaths: filteredData.reduce((sum, country) => sum + (country.new_deaths || 0), 0),
        total_recovered: filteredData.reduce((sum, country) => sum + (country.total_recovered || 0), 0),
        countries_count: filteredData.length,
        last_update: filteredResponse.period?.end_date || endDate
      };

      const newTopCountries = filteredData
        .sort((a, b) => (b.total_cases || 0) - (a.total_cases || 0))
        .slice(0, 20)
        .map(country => ({
          country: country.country,
          total_cases: country.total_cases || 0,
          total_deaths: country.total_deaths || 0,
          value: country.total_cases || 0,
          last_update: country.last_update
        }));
      
      setState(prev => ({
        ...prev,
        globalStats: newGlobalStats,
        topCountries: newTopCountries,
        allData: filteredData,
        dateRange: { start: startDate, end: endDate },
        loading: false
      }));
      
      console.log(` FILTRAGE TERMINE: ${filteredData.length} pays`);
      console.log(' NEW GLOBAL STATS:', newGlobalStats);
      
    } catch (error) {
      console.error(' ERREUR FILTRAGE:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erreur lors du filtrage des données'
      }));
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    ...state,
    allData: state.allData,
    loadCountryTimeline,
    refreshData,
    filterDataByDateRange,
    isLoading: state.loading
  };
};