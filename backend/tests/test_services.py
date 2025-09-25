"""
Tests unitaires pour les services COVID-19
"""
import unittest
import pandas as pd
from datetime import datetime
import os
import sys

# Ajouter le répertoire parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.data_loader import DataLoader
from src.services.data_processor import DataProcessor
from src.models.covid_data import CovidCountryData, GlobalStats
from config import Config

class TestDataLoader(unittest.TestCase):
    """Tests pour le DataLoader"""
    
    def setUp(self):
        self.loader = DataLoader()
    
    def test_load_single_csv(self):
        """Test du chargement d'un seul CSV"""
        # Ce test nécessite un fichier CSV réel
        if os.path.exists(Config.CSV_FILE):
            df = self.loader.load_single_csv(Config.CSV_FILE)
            self.assertIsNotNone(df)
            self.assertFalse(df.empty)
            self.assertIn('Country_Region', df.columns)
    
    def test_load_multiple_csv(self):
        """Test du chargement multiple CSV"""
        if os.path.exists(Config.DATA_FOLDER):
            df = self.loader.load_multiple_csv()
            if df is not None:
                self.assertFalse(df.empty)
                self.assertIn('file_date', df.columns)

class TestDataProcessor(unittest.TestCase):
    """Tests pour le DataProcessor"""
    
    def setUp(self):
        self.processor = DataProcessor()
        
        # Créer des données de test
        self.test_data = pd.DataFrame({
            'Country_Region': ['France', 'Germany', 'Italy'],
            'Confirmed': [100000, 80000, 120000],
            'Deaths': [5000, 4000, 6000],
            'Recovered': [90000, 75000, 110000],
            'Active': [5000, 1000, 4000],
            'Last_Update': ['2021-01-01', '2021-01-01', '2021-01-01']
        })
    
    def test_process_raw_data(self):
        """Test du traitement des données brutes"""
        result = self.processor.process_raw_data(self.test_data)
        
        self.assertIsNotNone(result)
        self.assertFalse(result.empty)
        self.assertIn('location', result.columns)
        self.assertIn('total_cases', result.columns)
        self.assertIn('total_deaths', result.columns)
    
    def test_get_global_stats(self):
        """Test du calcul des statistiques globales"""
        processed_data = self.processor.process_raw_data(self.test_data)
        stats = self.processor.get_global_stats(processed_data)
        
        self.assertIsInstance(stats, GlobalStats)
        self.assertEqual(stats.total_cases, 300000)  # 100k + 80k + 120k
        self.assertEqual(stats.total_deaths, 15000)  # 5k + 4k + 6k
        self.assertEqual(stats.countries_count, 3)
    
    def test_get_countries_list(self):
        """Test de la récupération de la liste des pays"""
        processed_data = self.processor.process_raw_data(self.test_data)
        countries = self.processor.get_countries_list(processed_data)
        
        self.assertIsInstance(countries, list)
        self.assertEqual(len(countries), 3)
        self.assertIn('France', countries)
        self.assertIn('Germany', countries)
        self.assertIn('Italy', countries)
    
    def test_get_country_data(self):
        """Test de la récupération des données d'un pays"""
        processed_data = self.processor.process_raw_data(self.test_data)
        country_timeline = self.processor.get_country_data(processed_data, 'France')
        
        self.assertIsNotNone(country_timeline)
        self.assertEqual(country_timeline.country, 'France')
        self.assertEqual(len(country_timeline.data), 1)
        self.assertIsInstance(country_timeline.data[0], CovidCountryData)

class TestCovidModels(unittest.TestCase):
    """Tests pour les modèles de données"""
    
    def test_covid_country_data(self):
        """Test du modèle CovidCountryData"""
        data = CovidCountryData(
            location='France',
            iso_code='FRA',
            date=datetime.now(),
            total_cases=100000,
            new_cases=1000,
            total_deaths=5000,
            new_deaths=50
        )
        
        self.assertEqual(data.location, 'France')
        self.assertEqual(data.total_cases, 100000)
        self.assertEqual(data.new_cases, 1000)
        
        # Test de la sérialisation
        data_dict = data.to_dict()
        self.assertIsInstance(data_dict, dict)
        self.assertIn('location', data_dict)
        self.assertIn('total_cases', data_dict)
    
    def test_global_stats(self):
        """Test du modèle GlobalStats"""
        stats = GlobalStats(
            total_cases=1000000,
            total_deaths=50000,
            total_recovered=900000,
            active_cases=50000,
            new_cases=5000,
            new_deaths=100,
            countries_count=195,
            last_update=datetime.now()
        )
        
        self.assertEqual(stats.total_cases, 1000000)
        self.assertEqual(stats.countries_count, 195)
        
        # Test de la sérialisation
        stats_dict = stats.to_dict()
        self.assertIsInstance(stats_dict, dict)
        self.assertIn('total_cases', stats_dict)
        self.assertIn('countries_count', stats_dict)

if __name__ == '__main__':
    # Configuration pour les tests
    Config.LOG_LEVEL = 'ERROR'  # Réduire les logs pendant les tests
    
    # Lancer les tests
    unittest.main(verbosity=2)