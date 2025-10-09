import React, { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import CovidDataTable from './CovidDataTable';
import { CovidDataService } from '../services/covidDataService';

const CovidTablePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await CovidDataService.getEnrichedCountriesData();
        setData(result);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const result = await CovidDataService.getEnrichedCountriesData();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du rechargement des données:', err);
      setError('Erreur lors du rechargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-red-400 text-xl mb-4">❌ Erreur</div>
        <p className="text-white mb-6">{error}</p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      {/* En-tête */}
      <div className="glass-card">
        <h2 style={{ 
          fontSize: '2rem', 
          textAlign: 'center',
          background: 'var(--gradient-3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}>
           Tableau Récapitulatif COVID-19
        </h2>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-gray-300">
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-sm text-gray-300">
              {data.length > 0 && (
                <span>{data.length.toLocaleString()} entrées</span>
              )}
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-white/20 text-white font-medium hover:from-blue-500/30 hover:to-purple-600/30 transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-white/20 mb-4 backdrop-blur-sm">
              <ArrowPathIcon className="w-6 h-6 text-white animate-spin" />
            </div>
            <p className="text-white text-lg mb-2">Chargement des données...</p>
            <p className="text-gray-300 text-sm">
              Traitement en cours, veuillez patienter
            </p>
          </div>
        ) : (
          <CovidDataTable data={data} />
        )}

        {/* Footer avec informations */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-300">
            <div>
              Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
            </div>
            <div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CovidTablePage;