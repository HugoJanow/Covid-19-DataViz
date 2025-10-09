#  COVID-19 DataViz Dashboard

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC)

Application web de visualisation des données COVID-19 en temps réel, utilisant les données de **Johns Hopkins University**.

## Fonctionnalités

### Visualisations
- **Statistiques globales** : Cas totaux, décès, vaccinations avec indicateurs de tendance
- **Top 10 des pays** : Graphique en barres interactif avec tri par différentes métriques
- **Évolution temporelle** : Graphique en ligne pour suivre l'évolution par pays
- **Comparaison multi-pays** : Jusqu'à 6 pays simultanément sur différentes métriques

### 🛠 Architecture Technique
- **Backend** : API REST avec Flask + Pandas
- **Frontend** : Interface React avec Chart.js
- **Styling** : TailwindCSS pour un design moderne et responsive
- **Hébergement** : Render (backend) + Vercel (frontend)

##  Installation Locale

### Prérequis
- Python 3.11+
- Node.js 18+
- npm ou yarn

### 1. Cloner le repository
```bash
git clone https://github.com/votre-username/covid-dataviz.git
cd covid-dataviz
```

### 2. Installation du Backend

```bash
# Accéder au dossier backend
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sur Linux/Mac:
source venv/bin/activate
# Sur Windows:
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur de développement
python app.py
```

Le backend sera accessible sur `http://localhost:5000`

### 3. Installation du Frontend

Dans un nouveau terminal :

```bash
# Accéder au dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

Le frontend sera accessible sur `http://localhost:3000`

##  Endpoints API

### Base URL
- Développement : `http://localhost:5000/api`
- Production : `https://covid-dataviz-api.onrender.com/api`

### Endpoints disponibles

| Méthode | Endpoint | Description | Paramètres |
|---------|----------|-------------|------------|
| GET | `/health` | Vérification de santé | - |
| GET | `/cases` | Cas par pays | `limit`, `sort` |
| GET | `/country/<name>` | Données d'un pays | `days`, `metrics` |
| GET | `/global` | Statistiques mondiales | - |
| POST | `/compare` | Comparaison de pays | `countries`, `metric`, `days` |
| GET | `/countries` | Liste des pays | - |

### Exemples d'utilisation

```bash
# Obtenir le top 10 des pays par cas totaux
curl http://localhost:5000/api/cases?limit=10&sort=total_cases

# Obtenir l'évolution de la France sur 30 jours
curl http://localhost:5000/api/country/France?days=30&metrics=cases,deaths

# Comparer plusieurs pays
curl -X POST http://localhost:5000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"countries": ["France", "Germany", "Italy"], "metric": "new_cases", "days": 30}'
```

##  Tests

### Backend
```bash
cd backend
pytest test_app.py -v

# Vérifier le formatage
black --check .

# Linting
flake8 .
```

### Frontend
```bash
cd frontend
npm test
npm run lint
```

##  Déploiement

### Configuration GitHub Secrets

Ajouter ces secrets dans votre repository GitHub :

#### Pour Render (Backend)
- `RENDER_API_KEY` : Clé API Render
- `RENDER_SERVICE_ID` : ID du service Render

#### Pour Vercel (Frontend)
- `VERCEL_TOKEN` : Token Vercel
- `VERCEL_ORG_ID` : ID de l'organisation Vercel
- `VERCEL_PROJECT_ID` : ID du projet Vercel

### Déploiement automatique

Le déploiement est automatique via GitHub Actions :
- **Push sur `main`** : Déploiement en production
- **Push sur `develop`** : Tests uniquement
- **Pull Request** : Tests automatiques

##  Structure du Projet

```
covid-dataviz/
├── backend/
│   ├── app.py              # Application Flask principale
│   ├── test_app.py         # Tests unitaires
│   └── requirements.txt    # Dépendances Python
├── frontend/
│   ├── public/             # Fichiers statiques
│   ├── src/
│   │   ├── components/     # Composants React
│   │   │   ├── GlobalStats.js
│   │   │   ├── TopCountriesChart.js
│   │   │   ├── TimelineChart.js
│   │   │   └── CountryComparison.js
│   │   ├── services/       # Services API
│   │   │   └── api.js
│   │   ├── App.js          # Composant principal
│   │   ├── index.js        # Point d'entrée
│   │   └── index.css       # Styles globaux
│   └── package.json        # Dépendances Node.js
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       ├── backend.yml
│       └── frontend.yml
├── render.yaml             # Configuration Render
├── vercel.json            # Configuration Vercel
└── README.md              # Documentation

```

##  Gestion de Projet Agile

### GitHub Projects
- Utilisation du Kanban board intégré
- Issues avec labels et story points
- Milestones pour les releases

### Workflow Git
```bash
# Créer une nouvelle feature
git checkout -b feature/nom-feature

# Commit avec message conventionnel
git commit -m "feat: ajouter nouvelle visualisation"

# Push et créer une PR
git push origin feature/nom-feature
```

### Types de commits
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

##  Configuration Environnement

### Variables d'environnement Backend
```env
FLASK_ENV=development
PORT=5000
```

### Variables d'environnement Frontend
```env
REACT_APP_API_URL=http://localhost:5000/api
```

##  Dépannage

### Problème : CORS errors
**Solution** : Vérifier que Flask-CORS est installé et configuré

### Problème : Données non chargées
**Solution** : Vérifier la connexion internet et l'accès à Our World in Data

### Problème : Build React échoue
**Solution** : Supprimer node_modules et réinstaller
```bash
rm -rf node_modules package-lock.json
npm install
```

##  Ressources

- [Our World in Data COVID-19](https://ourworldindata.org/coronavirus)
- [Documentation Flask](https://flask.palletsprojects.com/)
- [Documentation React](https://reactjs.org/)
- [Documentation Chart.js](https://www.chartjs.org/)
- [TailwindCSS](https://tailwindcss.com/)

##  License

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.
