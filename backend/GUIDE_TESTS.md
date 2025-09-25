# 🧪 Guide des Tests Unitaires - API COVID-19

Ce guide vous explique comment utiliser, lancer et étendre les tests unitaires de votre API COVID-19.

## 📋 Table des matières

1. [Structure des tests](#structure)
2. [Comment lancer les tests](#lancement)
3. [Types de tests disponibles](#types)
4. [Ajouter de nouveaux tests](#nouveaux)
5. [Tests d'intégration API](#integration)
6. [Bonnes pratiques](#bonnes-pratiques)

---

## 🏗️ Structure des tests {#structure}

```
backend/tests/
├── test_services.py        # Tests des services (DataLoader, DataProcessor)
├── test_api_routes.py      # Tests des routes API (à créer)
├── test_models.py          # Tests des modèles de données
└── __init__.py            # Initialisation du module tests
```

### Tests actuels disponibles :
- ✅ **DataLoader** : Chargement des fichiers CSV
- ✅ **DataProcessor** : Traitement et transformation des données
- ✅ **CovidModels** : Validation des modèles de données
- ⚠️ **API Routes** : À compléter

---

## 🚀 Comment lancer les tests {#lancement}

### 1. Depuis le dossier backend :

```bash
# Lancer tous les tests
cd backend
python -m pytest tests/ -v

# Ou avec unittest
python -m unittest discover tests -v

# Lancer un fichier de test spécifique
python -m unittest tests.test_services -v

# Lancer une classe de test spécifique
python -m unittest tests.test_services.TestDataLoader -v

# Lancer un test spécifique
python -m unittest tests.test_services.TestDataLoader.test_load_single_csv -v
```

### 2. Avec coverage (couverture de code) :

```bash
# Installer coverage si pas encore fait
pip install coverage

# Lancer les tests avec mesure de couverture
coverage run -m unittest discover tests
coverage report
coverage html  # Génère un rapport HTML dans htmlcov/
```

### 3. Lancement rapide :

```bash
# Directement depuis le fichier test
cd backend
python tests/test_services.py
```

---

## 🧪 Types de tests disponibles {#types}

### 1. **Tests du DataLoader** 
```python
# Teste le chargement des fichiers CSV
test_load_single_csv()    # Charge un fichier CSV unique
test_load_multiple_csv()  # Charge plusieurs fichiers CSV
```

### 2. **Tests du DataProcessor**
```python
# Teste le traitement des données
test_process_raw_data()   # Transformation des données brutes
test_get_global_stats()   # Calcul des statistiques globales
test_get_countries_list() # Extraction de la liste des pays
test_get_country_data()   # Données spécifiques d'un pays
```

### 3. **Tests des Modèles**
```python
# Teste la validation des modèles
test_covid_country_data() # Modèle CovidCountryData
test_global_stats()       # Modèle GlobalStats
```

---

## ➕ Ajouter de nouveaux tests {#nouveaux}

### Exemple : Créer des tests pour les routes API

```python
# Créer tests/test_api_routes.py
import unittest
import json
from app import create_app

class TestCovidRoutes(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
    
    def test_health_endpoint(self):
        """Test de la route /api/health"""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'OK')
    
    def test_global_stats_endpoint(self):
        """Test de la route /api/global"""
        response = self.client.get('/api/global')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('total_cases', data)
        self.assertIn('total_deaths', data)
    
    def test_countries_endpoint(self):
        """Test de la route /api/countries"""
        response = self.client.get('/api/countries')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('countries', data)
        self.assertIsInstance(data['countries'], list)
    
    def test_top_countries_endpoint(self):
        """Test de la route /api/top-countries"""
        response = self.client.get('/api/top-countries?limit=5')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertLessEqual(len(data), 5)
```

### Exemple : Tests avec mock des données

```python
import unittest
from unittest.mock import Mock, patch
import pandas as pd

class TestWithMocks(unittest.TestCase):
    @patch('src.services.data_loader.DataLoader.load_data')
    def test_with_mock_data(self, mock_load):
        """Test avec des données simulées"""
        # Préparer des données de test
        mock_data = pd.DataFrame({
            'Country_Region': ['France', 'Germany'],
            'Confirmed': [100000, 80000],
            'Deaths': [5000, 4000]
        })
        mock_load.return_value = mock_data
        
        # Tester avec les données simulées
        loader = DataLoader()
        result = loader.load_data()
        
        self.assertEqual(len(result), 2)
        mock_load.assert_called_once()
```

---

## 🌐 Tests d'intégration API {#integration}

### Créer un script de tests complet :

```python
# tests/integration_test.py
import requests
import time

def test_full_api():
    """Test complet de l'API en conditions réelles"""
    base_url = "http://localhost:5000/api"
    
    print("🧪 Tests d'intégration de l'API COVID-19")
    print("=" * 50)
    
    # Test 1: Health Check
    print("1️⃣ Test Health Check...")
    response = requests.get(f"{base_url}/health")
    assert response.status_code == 200
    print("✅ Health Check OK")
    
    # Test 2: Global Stats
    print("2️⃣ Test Global Stats...")
    response = requests.get(f"{base_url}/global")
    assert response.status_code == 200
    data = response.json()
    assert 'total_cases' in data
    print(f"✅ Global Stats OK - {data.get('total_cases', 0)} cas")
    
    # Test 3: Countries List
    print("3️⃣ Test Countries List...")
    response = requests.get(f"{base_url}/countries")
    assert response.status_code == 200
    countries = response.json()['countries']
    print(f"✅ Countries List OK - {len(countries)} pays")
    
    # Test 4: Top Countries
    print("4️⃣ Test Top Countries...")
    response = requests.get(f"{base_url}/top-countries?limit=10")
    assert response.status_code == 200
    top_countries = response.json()
    assert len(top_countries) <= 10
    print(f"✅ Top Countries OK - {len(top_countries)} pays")
    
    # Test 5: Country Timeline
    if countries:
        country = countries[0]
        print(f"5️⃣ Test Country Timeline ({country})...")
        response = requests.get(f"{base_url}/countries/{country}")
        assert response.status_code == 200
        print(f"✅ Country Timeline OK")
    
    print("🎉 Tous les tests d'intégration réussis!")

if __name__ == "__main__":
    test_full_api()
```

---

## 🎯 Bonnes pratiques {#bonnes-pratiques}

### 1. **Organisation des tests**
- Un fichier de test par module
- Une classe de test par classe testée
- Une méthode de test par fonctionnalité

### 2. **Nommage des tests**
```python
def test_should_return_valid_data_when_csv_exists(self):
    """Le test doit retourner des données valides quand le CSV existe"""
    pass

def test_should_raise_error_when_file_not_found(self):
    """Le test doit lever une erreur quand le fichier n'existe pas"""
    pass
```

### 3. **Structure d'un test (AAA)**
```python
def test_example(self):
    # Arrange (Préparer)
    data = create_test_data()
    processor = DataProcessor()
    
    # Act (Agir)
    result = processor.process_data(data)
    
    # Assert (Vérifier)
    self.assertIsNotNone(result)
    self.assertEqual(len(result), expected_length)
```

### 4. **Tests avec setUp et tearDown**
```python
class TestExample(unittest.TestCase):
    def setUp(self):
        """Exécuté avant chaque test"""
        self.test_data = create_test_data()
    
    def tearDown(self):
        """Exécuté après chaque test"""
        cleanup_test_data()
```

---

## 📊 Exemple de lancement complet

```bash
# Terminal 1: Démarrer le backend
cd backend
python app.py

# Terminal 2: Lancer tous les tests
cd backend
python -m unittest discover tests -v

# Résultat attendu :
# test_get_countries_list (tests.test_services.TestDataProcessor) ... ok
# test_get_country_data (tests.test_services.TestDataProcessor) ... ok
# test_get_global_stats (tests.test_services.TestDataProcessor) ... ok
# test_process_raw_data (tests.test_services.TestDataProcessor) ... ok
# test_load_multiple_csv (tests.test_services.TestDataLoader) ... ok
# test_load_single_csv (tests.test_services.TestDataLoader) ... ok
# test_covid_country_data (tests.test_services.TestCovidModels) ... ok
# test_global_stats (tests.test_services.TestCovidModels) ... ok
# 
# Ran 8 tests in 0.123s
# OK
```

---

## 🔧 Installation des dépendances de test

```bash
# Si pas encore installé
pip install pytest
pip install coverage
pip install requests  # Pour les tests d'intégration
```

Ce guide vous donne tous les outils pour maîtriser les tests de votre API ! 🚀