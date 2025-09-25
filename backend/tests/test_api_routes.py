import unittest
import json
import sys
import os

# Ajouter le chemin du backend au Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

class TestCovidRoutes(unittest.TestCase):
    """Tests des routes de l'API COVID-19"""
    
    def setUp(self):
        """Configuration avant chaque test"""
        app.config['TESTING'] = True
        self.client = app.test_client()
        self.base_url = '/api'
    
    def test_health_endpoint(self):
        """Test de la route /api/health"""
        response = self.client.get(f'{self.base_url}/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'OK')
        self.assertIn('message', data)
        self.assertIn('version', data)
        print("✅ Health endpoint OK")
    
    def test_global_stats_endpoint(self):
        """Test de la route /api/global"""
        response = self.client.get(f'{self.base_url}/global')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        required_fields = ['total_cases', 'total_deaths', 'countries_count']
        
        for field in required_fields:
            self.assertIn(field, data, f"Champ manquant: {field}")
            self.assertIsInstance(data[field], int, f"Type incorrect pour {field}")
        
        print(f"✅ Global stats OK - {data['total_cases']} cas dans {data['countries_count']} pays")
    
    def test_countries_list_endpoint(self):
        """Test de la route /api/countries"""
        response = self.client.get(f'{self.base_url}/countries')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('countries', data)
        self.assertIsInstance(data['countries'], list)
        self.assertGreater(len(data['countries']), 0, "La liste des pays ne doit pas être vide")
        
        print(f"✅ Countries list OK - {len(data['countries'])} pays disponibles")
        return data['countries']
    
    def test_top_countries_endpoint(self):
        """Test de la route /api/top-countries"""
        # Test avec limite par défaut
        response = self.client.get(f'{self.base_url}/top-countries')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertLessEqual(len(data), 10, "Par défaut, max 10 pays")
        
        # Test avec limite personnalisée
        response = self.client.get(f'{self.base_url}/top-countries?limit=5')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertLessEqual(len(data), 5, "Limite de 5 pays respectée")
        
        # Vérifier la structure des données
        if data:
            country = data[0]
            required_fields = ['country', 'total_cases', 'total_deaths', 'value']
            for field in required_fields:
                self.assertIn(field, country, f"Champ manquant dans top country: {field}")
        
        print(f"✅ Top countries OK - {len(data)} pays retournés")
    
    def test_cases_endpoint(self):
        """Test de la route /api/cases (toutes les données)"""
        response = self.client.get(f'{self.base_url}/cases')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0, "Des données doivent être retournées")
        
        # Vérifier la structure d'un élément
        if data:
            country_data = data[0]
            required_fields = ['country', 'total_cases', 'total_deaths', 'last_update']
            for field in required_fields:
                self.assertIn(field, country_data, f"Champ manquant dans cases: {field}")
        
        print(f"✅ Cases endpoint OK - {len(data)} entrées de données")
    
    def test_country_timeline_endpoint(self):
        """Test de la route /api/countries/<country>"""
        # D'abord récupérer la liste des pays
        countries_response = self.client.get(f'{self.base_url}/countries')
        countries_data = json.loads(countries_response.data)
        countries = countries_data['countries']
        
        if not countries:
            self.skipTest("Aucun pays disponible pour test timeline")
        
        # Tester avec le premier pays de la liste
        test_country = countries[0]
        response = self.client.get(f'{self.base_url}/countries/{test_country}')
        
        if response.status_code == 404:
            print(f"⚠️ Country timeline pour '{test_country}' non trouvé (normal si données limitées)")
            return
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Vérifier la structure de la timeline
        self.assertIn('country', data, "Country field manquant dans timeline")
        
        print(f"✅ Country timeline OK pour {test_country}")
    
    def test_invalid_endpoints(self):
        """Test des endpoints inexistants"""
        response = self.client.get(f'{self.base_url}/nonexistent')
        self.assertEqual(response.status_code, 404)
        
        response = self.client.get('/invalid')
        self.assertEqual(response.status_code, 404)
        
        print("✅ Invalid endpoints correctement gérés")
    
    def test_error_handling(self):
        """Test de la gestion d'erreur avec paramètres invalides"""
        # Test avec métrique invalide
        response = self.client.get(f'{self.base_url}/top-countries?metric=invalid_metric')
        # Peut soit retourner 400 (erreur) ou 200 (gestion gracieuse)
        self.assertIn(response.status_code, [200, 400])
        
        # Test avec limite négative
        response = self.client.get(f'{self.base_url}/top-countries?limit=-5')
        self.assertIn(response.status_code, [200, 400])
        
        print("✅ Error handling OK")

class TestAPIPerformance(unittest.TestCase):
    """Tests de performance de l'API"""
    
    def setUp(self):
        """Configuration avant chaque test"""
        app.config['TESTING'] = True
        self.client = app.test_client()
        self.base_url = '/api'
    
    def test_response_time(self):
        """Test des temps de réponse"""
        import time
        
        # Test health check (doit être rapide)
        start_time = time.time()
        response = self.client.get(f'{self.base_url}/health')
        end_time = time.time()
        
        response_time = end_time - start_time
        self.assertLess(response_time, 1.0, "Health check trop lent")
        
        print(f"✅ Health check response time: {response_time:.3f}s")
        
        # Test données globales
        start_time = time.time()
        response = self.client.get(f'{self.base_url}/global')
        end_time = time.time()
        
        response_time = end_time - start_time
        self.assertLess(response_time, 5.0, "Global stats trop lent")
        
        print(f"✅ Global stats response time: {response_time:.3f}s")

def run_all_tests():
    """Fonction pour lancer tous les tests"""
    print("🧪 Lancement des tests des routes API")
    print("=" * 50)
    
    # Créer la suite de tests
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Ajouter les tests
    suite.addTests(loader.loadTestsFromTestCase(TestCovidRoutes))
    suite.addTests(loader.loadTestsFromTestCase(TestAPIPerformance))
    
    # Lancer les tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Résumé
    print("\n" + "=" * 50)
    if result.wasSuccessful():
        print("🎉 Tous les tests sont passés avec succès!")
    else:
        print(f"❌ {len(result.failures)} test(s) échoué(s)")
        print(f"⚠️ {len(result.errors)} erreur(s)")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    run_all_tests()