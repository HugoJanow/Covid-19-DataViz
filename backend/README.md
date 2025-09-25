# COVID-19 Data API

API Flask moderne et modulaire pour la visualisation des données COVID-19.

## 🏗️ Architecture

```
backend/
├── config.py                 # Configuration centralisée
├── app.py                    # Point d'entrée principal (legacy)
├── app_new.py                # Nouvelle architecture modulaire
├── requirements.txt          # Dépendances Python
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   └── covid_data.py     # Modèles de données
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_loader.py    # Service de chargement CSV
│   │   └── data_processor.py # Service de traitement
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── covid_routes.py # Routes API REST
│   └── utils/
│       ├── __init__.py
│       ├── logger.py         # Configuration logging
│       └── cache.py          # Système de cache
├── tests/
│   ├── __init__.py
│   └── test_services.py      # Tests unitaires
└── logs/                     # Fichiers de log (auto-créé)
```

## 🚀 Installation et démarrage

### 1. Installation des dépendances

```bash
pip install -r requirements.txt
```

### 2. Configuration

Créer un fichier `.env` (optionnel):

```env
ENV=development
DEBUG=true
HOST=0.0.0.0
PORT=5000
LOG_LEVEL=INFO
```

### 3. Préparer les données

**Option A: CSV unique** (par défaut)
```bash
# Placer le fichier CSV dans le dossier parent
cp your-covid-data.csv ../01-01-2021.csv
```

**Option B: Multi-CSV pour séries temporelles**
```bash
# Créer le dossier data et utiliser le script d'aide
python ../setup_multi_csv.py
```

### 4. Démarrage

**Version modulaire (recommandée):**
```bash
python app_new.py
```

**Version legacy:**
```bash
python app.py
```

## 📊 API Endpoints

### Santé et administration

- `GET /health` - État de l'API
- `GET /admin/cache/stats` - Statistiques du cache
- `POST /admin/cache/clear` - Vider le cache (dev only)

### Données COVID-19

- `GET /api/data` - Toutes les données pays
- `GET /api/global` - Statistiques globales
- `GET /api/countries` - Liste des pays disponibles
- `GET /api/timeline/<country>?days=30` - Évolution d'un pays
- `POST /api/compare` - Comparaison de pays
- `GET /api/top-countries?metric=total_cases&limit=10` - Top pays

### Exemples d'utilisation

```bash
# Statistiques globales
curl http://localhost:5000/api/global

# Timeline de la France sur 60 jours
curl http://localhost:5000/api/timeline/France?days=60

# Comparaison de pays
curl -X POST http://localhost:5000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"countries": ["France", "Germany", "Italy"], "metric": "total_cases"}'

# Top 5 pays par décès
curl http://localhost:5000/api/top-countries?metric=total_deaths&limit=5
```

## 🛠️ Développement

### Tests

```bash
# Lancer les tests unitaires
python -m pytest tests/ -v

# Test d'un module spécifique
python tests/test_services.py
```

### Qualité du code

```bash
# Formatage automatique
black src/ tests/ *.py

# Vérification du style
flake8 src/ tests/ *.py
```

### Logs

Les logs sont disponibles dans:
- Console (stdout)
- Fichier `logs/app_YYYYMMDD.log` (si `LOG_TO_FILE=true`)

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `ENV` | Environnement (development/production) | `development` |
| `DEBUG` | Mode debug Flask | `true` |
| `HOST` | Adresse d'écoute | `0.0.0.0` |
| `PORT` | Port d'écoute | `5000` |
| `LOG_LEVEL` | Niveau de log (DEBUG/INFO/WARNING/ERROR) | `INFO` |
| `LOG_TO_FILE` | Écrire les logs dans un fichier | `false` |

### Modes de données

**CSV unique**: Modifier `MULTI_CSV_MODE = False` dans `config.py`
**Multi-CSV**: Modifier `MULTI_CSV_MODE = True` dans `config.py`

## 📈 Performance

### Cache

- Cache automatique des réponses API (5-10 minutes)
- Cache intelligent basé sur l'URL et les paramètres
- Statistiques disponibles via `/admin/cache/stats`

### Optimisations

- Chargement paresseux des données
- Agrégation optimisée avec pandas
- Logs structurés pour le monitoring
- Gestion d'erreurs robuste

## 🔄 Migration

Pour migrer de l'ancienne version vers la nouvelle architecture:

1. **Sauvegarder** l'ancien `app.py`
2. **Remplacer** par `app_new.py`
3. **Tester** les endpoints
4. **Renommer** `app_new.py` en `app.py`

```bash
mv app.py app_legacy.py
mv app_new.py app.py
```

## 🐛 Debugging

### Problèmes courants

**Données non trouvées:**
- Vérifier les chemins dans `config.py`
- Vérifier les permissions de lecture des CSV
- Consulter les logs pour plus de détails

**Erreurs d'import:**
- S'assurer que toutes les dépendances sont installées
- Vérifier la structure des dossiers src/

**Performance lente:**
- Activer le cache
- Réduire le nombre de jours dans les timeline
- Vérifier la taille des fichiers CSV

### Logs utiles

```bash
# Suivre les logs en temps réel
tail -f logs/app_$(date +%Y%m%d).log

# Filtrer les erreurs
grep "ERROR" logs/app_*.log

# Statistiques de performance
grep "⏱️" logs/app_*.log
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 License

MIT License - voir le fichier LICENSE pour plus de détails.