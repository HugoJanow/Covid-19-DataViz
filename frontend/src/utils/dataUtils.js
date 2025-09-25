
export const formatNumber = (num) => {
  if (!num || num === 0) return '0';
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('fr-FR');
};

export const formatPercentage = (num) => {
  if (!num || num === 0) return '0%';
  return `${num.toFixed(1)}%`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const dataColors = {
  cases: {
    gradient: 'var(--gradient-2)',
    solid: '#f5576c',
    light: 'rgba(245, 87, 108, 0.1)'
  },
  deaths: {
    gradient: 'var(--gradient-3)',
    solid: '#4facfe',
    light: 'rgba(79, 172, 254, 0.1)'
  },
  recovered: {
    gradient: 'var(--gradient-4)',
    solid: '#38f9d7',
    light: 'rgba(56, 249, 215, 0.1)'
  },
  active: {
    gradient: 'var(--gradient-5)',
    solid: '#fee140',
    light: 'rgba(254, 225, 64, 0.1)'
  }
};

export const calculateStats = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      totalCases: 0,
      totalDeaths: 0,
      totalRecovered: 0,
      activeCases: 0,
      mortalityRate: 0,
      recoveryRate: 0
    };
  }

  const totals = data.reduce((acc, country) => ({
    cases: acc.cases + (country.total_cases || 0),
    deaths: acc.deaths + (country.total_deaths || 0),
    recovered: acc.recovered + (country.total_recovered || 0)
  }), { cases: 0, deaths: 0, recovered: 0 });

  const activeCases = totals.cases - totals.deaths - totals.recovered;
  const mortalityRate = totals.cases > 0 ? (totals.deaths / totals.cases) * 100 : 0;
  const recoveryRate = totals.cases > 0 ? (totals.recovered / totals.cases) * 100 : 0;

  return {
    totalCases: totals.cases,
    totalDeaths: totals.deaths,
    totalRecovered: totals.recovered,
    activeCases: Math.max(0, activeCases),
    mortalityRate,
    recoveryRate
  };
};

export const sortCountriesByMetric = (countries, metric = 'total_cases', limit = 10) => {
  if (!countries || !Array.isArray(countries)) return [];
  
  return countries
    .filter(country => country[metric] && country[metric] > 0)
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    .slice(0, limit);
};

export const prepareChartData = (timeline, metric = 'total_cases') => {
  if (!timeline || !Array.isArray(timeline)) return [];
  
  return timeline.map(day => ({
    date: formatDate(day.date),
    value: day[metric] || 0,
    rawDate: day.date
  }));
};

export const searchCountries = (countries, query) => {
  if (!query || !countries) return countries;
  
  const searchQuery = query.toLowerCase();
  return countries.filter(country => 
    country.toLowerCase().includes(searchQuery)
  );
};

export const validateCovidData = (data) => {
  if (!data) return false;
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    return !!(data.total_cases || data.total_deaths || data.total_recovered);
  }
  
  if (Array.isArray(data)) {
    return data.length > 0 && data.some(item => 
      item.country && (item.total_cases || item.total_deaths)
    );
  }
  
  return false;
};

export const generateDashboardData = (globalStats, topCountries) => {
  const stats = calculateStats(topCountries);
  
  return {
    overview: {
      title: "Vue d'ensemble mondiale",
      stats: [
        {
          label: "Cas Total",
          value: globalStats?.total_cases || stats.totalCases,
          color: dataColors.cases,
          trend: "+2.3%"
        },
        {
          label: "Décès Total", 
          value: globalStats?.total_deaths || stats.totalDeaths,
          color: dataColors.deaths,
          trend: "+1.8%"
        },
        {
          label: "Guérisons",
          value: globalStats?.total_recovered || stats.totalRecovered,
          color: dataColors.recovered,
          trend: "+5.2%"
        },
        {
          label: "Cas Actifs",
          value: stats.activeCases,
          color: dataColors.active,
          trend: "-0.5%"
        }
      ]
    },
    topCountries: sortCountriesByMetric(topCountries, 'total_cases', 15),
    lastUpdate: new Date().toISOString()
  };
};