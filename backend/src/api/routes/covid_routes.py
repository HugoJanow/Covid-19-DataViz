import pandas as pd
import time
from flask import Blueprint, jsonify, request
from src.services.data_loader import DataLoader
from src.services.data_processor import DataProcessor
from src.utils.logger import get_logger
from config import Config

covid_routes = Blueprint('covid', __name__)
data_loader = DataLoader(Config.DATA_FOLDER, Config.CSV_FILE)
data_processor = DataProcessor()
logger = get_logger(__name__)

# Decorator pour mesurer les performances
def measure_performance(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        # Ajouter les headers de performance à la réponse
        if hasattr(result, 'headers'):
            result.headers['X-Response-Time'] = f"{(end_time - start_time):.3f}s"
            cache_info = data_loader.get_cache_info()
            result.headers['X-Cache-Status'] = cache_info.get('status', 'unknown')
            result.headers['X-Cache-Valid'] = str(cache_info.get('is_valid', False))
        
        return result
    wrapper.__name__ = func.__name__
    return wrapper

@covid_routes.route('/health', methods=['GET'])
def health_check():
    try:
        # Obtenir les infos de cache pour le health check
        cache_info = data_loader.get_cache_info()
        
        return jsonify({
            'status': 'OK',
            'message': 'API COVID-19 opérationnelle',
            'version': '1.0.0',
            'performance': {
                'cache_status': cache_info.get('status', 'unknown'),
                'cache_valid': cache_info.get('is_valid', False),
                'cache_age_hours': round(cache_info.get('age_hours', 0), 2),
                'cached_rows': cache_info.get('row_count', 0)
            }
        }), 200
    except Exception as e:
        logger.error(f"Erreur health check: {e}")
        return jsonify({
            'status': 'ERROR',
            'message': 'Service indisponible'
        }), 500

@covid_routes.route('/global', methods=['GET'])
@measure_performance
def get_global_stats():
    try:
        logger.info("Requête: statistiques globales")
        
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        latest_data = processed_df.groupby('location').last().reset_index()
        
        global_stats = {
            'total_cases': int(latest_data['total_cases'].sum()),
            'total_deaths': int(latest_data['total_deaths'].sum()),
            'new_cases': int(latest_data['new_cases'].sum()),
            'new_deaths': int(latest_data['new_deaths'].sum()),
            'total_recovered': int(latest_data['total_recovered'].sum()) if 'total_recovered' in latest_data.columns else 0,
            'active_cases': int(latest_data['active_cases'].sum()) if 'active_cases' in latest_data.columns else 0,
            'countries_count': len(latest_data),
            'last_update': latest_data['date'].max().isoformat() if not latest_data.empty else None
        }
        
        logger.info("Statistiques globales calculées")
        return jsonify(global_stats)
        
    except Exception as e:
        return jsonify({'error': f'Erreur de calcul des statistiques globales: {str(e)}'}), 500

@covid_routes.route('/cases', methods=['GET'])
@measure_performance
def get_all_data():
    try:
        logger.info("Requête: toutes les données")
        
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        latest_data = processed_df.groupby('location').last().reset_index()
        
        result = []
        for _, row in latest_data.iterrows():
            result.append({
                'country': row['location'],
                'total_cases': int(row['total_cases']) if pd.notna(row['total_cases']) else 0,
                'new_cases': int(row['new_cases']) if pd.notna(row['new_cases']) else 0,
                'total_deaths': int(row['total_deaths']) if pd.notna(row['total_deaths']) else 0,
                'new_deaths': int(row['new_deaths']) if pd.notna(row['new_deaths']) else 0,
                'total_recovered': int(row['total_recovered']) if pd.notna(row['total_recovered']) else None,
                'active_cases': int(row['active_cases']) if pd.notna(row['active_cases']) else None,
                'last_update': row['date'].isoformat()
            })
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Erreur de traitement des données: {str(e)}'}), 500

@covid_routes.route('/countries', methods=['GET'])
def get_countries():
    try:
        logger.info("Requête: liste des pays")
        
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        countries = data_processor.get_countries_list(processed_df)
        
        logger.info(f"Liste des pays: {len(countries)} pays")
        return jsonify({'countries': countries})
        
    except Exception as e:
        return jsonify({'error': f'Erreur de récupération des pays: {str(e)}'}), 500

@covid_routes.route('/countries/<country>', methods=['GET'])
def get_country_timeline(country):
    try:
        days = request.args.get('days', 30, type=int)
        logger.info(f"Requête countries pour {country} ({days} jours)")
        
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        timeline = data_processor.get_country_data(processed_df, country, days)
        
        if timeline is None:
            logger.warning(f"Pays non trouvé: {country}")
            return jsonify({'error': f'Pays "{country}" non trouvé'}), 404
        
        logger.info(f"Timeline pour {country}: {timeline.days} points de données")
        return jsonify(timeline.to_dict())
        
    except Exception as e:
        return jsonify({'error': f'Erreur de récupération des countries: {str(e)}'}), 500

@covid_routes.route('/top-countries', methods=['GET'])
def get_top_countries():
    try:
        limit = request.args.get('limit', 10, type=int)
        metric = request.args.get('metric', 'total_cases', type=str)
        logger.info(f"Requête top {limit} pays par {metric}")
        
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        latest_data = processed_df.groupby('location').last().reset_index()
        
        if metric not in latest_data.columns:
            return jsonify({'error': f'Métrique "{metric}" non disponible'}), 400
        
        top_countries = latest_data.nlargest(limit, metric)
        
        result = []
        for _, row in top_countries.iterrows():
            result.append({
                'country': row['location'],
                'total_cases': int(row['total_cases']) if pd.notna(row['total_cases']) else 0,
                'total_deaths': int(row['total_deaths']) if pd.notna(row['total_deaths']) else 0,
                'value': int(row[metric]) if pd.notna(row[metric]) else 0,
                'last_update': row['date'].isoformat()
            })
        
        logger.info(f"Top {len(result)} pays par {metric}")
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Erreur de récupération du top pays: {str(e)}'}), 500

@covid_routes.route('/data/filtered', methods=['GET'])
def get_filtered_data():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        logger.info(f"Requête de données filtrées: {start_date} → {end_date}")
        
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        
        if start_date:
            try:
                start_dt = pd.to_datetime(start_date)
                processed_df = processed_df[processed_df['date'] >= start_dt]
            except:
                return jsonify({'error': 'Format de date invalide pour start_date (utilisez YYYY-MM-DD)'}), 400
        
        if end_date:
            try:
                end_dt = pd.to_datetime(end_date)
                processed_df = processed_df[processed_df['date'] <= end_dt]
            except:
                return jsonify({'error': 'Format de date invalide pour end_date (utilisez YYYY-MM-DD)'}), 400
        
        if processed_df.empty:
            return jsonify({'error': 'Aucune donnée trouvée pour cette période'}), 404
        
        latest_data = processed_df.groupby('location').last().reset_index()
        
        result = []
        for _, row in latest_data.iterrows():
            result.append({
                'country': row['location'],
                'total_cases': int(row['total_cases']) if pd.notna(row['total_cases']) else 0,
                'new_cases': int(row['new_cases']) if pd.notna(row['new_cases']) else 0,
                'total_deaths': int(row['total_deaths']) if pd.notna(row['total_deaths']) else 0,
                'new_deaths': int(row['new_deaths']) if pd.notna(row['new_deaths']) else 0,
                'total_recovered': int(row['total_recovered']) if pd.notna(row['total_recovered']) else None,
                'active_cases': int(row['active_cases']) if pd.notna(row['active_cases']) else None,
                'last_update': row['date'].isoformat()
            })
        
        logger.info(f"Données filtrées: {len(result)} pays pour période {start_date} → {end_date}")
        return jsonify({
            'data': result,
            'period': {
                'start_date': start_date,
                'end_date': end_date,
                'countries_count': len(result)
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erreur de filtrage des données: {str(e)}'}), 500

@covid_routes.route('/dates/available', methods=['GET'])
def get_available_dates():
    try:
        logger.info("Requête: dates disponibles")
        
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        
        available_dates = sorted(processed_df['date'].dt.strftime('%Y-%m-%d').unique().tolist())
        
        logger.info(f"Dates disponibles: {len(available_dates)} dates")
        return jsonify({
            'dates': available_dates,
            'count': len(available_dates),
            'min_date': available_dates[0] if available_dates else None,
            'max_date': available_dates[-1] if available_dates else None
        })
        
    except Exception as e:
        return jsonify({'error': f'Erreur de récupération des dates: {str(e)}'}), 500

# ===== GESTION DU CACHE =====

@covid_routes.route('/cache/info', methods=['GET'])
def get_cache_info():
    """
    Retourne les informations sur le cache système
    """
    try:
        cache_info = data_loader.get_cache_info()
        return jsonify({
            'cache_info': cache_info,
            'performance': {
                'cache_enabled': True,
                'cache_duration_hours': 2,
                'recommendations': {
                    'use_cache': cache_info.get('is_valid', False),
                    'refresh_needed': not cache_info.get('is_valid', False)
                }
            }
        })
    except Exception as e:
        logger.error(f"Erreur info cache: {e}")
        return jsonify({'error': f'Erreur récupération info cache: {str(e)}'}), 500

@covid_routes.route('/cache/refresh', methods=['POST'])
def refresh_cache():
    """
    Force la mise à jour du cache
    """
    try:
        start_time = pd.Timestamp.now()
        
        logger.info("🔄 Actualisation du cache demandée")
        data = data_loader.refresh_cache()
        
        if data is None:
            return jsonify({'error': 'Impossible de recharger les données'}), 500
        
        end_time = pd.Timestamp.now()
        load_time = (end_time - start_time).total_seconds()
        
        return jsonify({
            'message': 'Cache actualisé avec succès',
            'performance': {
                'load_time_seconds': round(load_time, 2),
                'rows_loaded': len(data),
                'cache_updated': True,
                'timestamp': end_time.isoformat()
            },
            'cache_info': data_loader.get_cache_info()
        })
        
    except Exception as e:
        logger.error(f"Erreur refresh cache: {e}")
        return jsonify({'error': f'Erreur actualisation cache: {str(e)}'}), 500

# ===== NOUVEAUX ENDPOINTS =====

@covid_routes.route('/ranking', methods=['GET'])
@covid_routes.route('/ranking/<int:n>', methods=['GET'])
def get_country_ranking(n=10):
    """
    Retourne le top N pays les plus touchés
    Paramètres:
    - n: nombre de pays (défaut: 10)
    - metric: 'cases' ou 'deaths' (défaut: 'cases')
    - order: 'desc' ou 'asc' (défaut: 'desc')
    """
    try:
        # Paramètres de requête
        metric = request.args.get('metric', 'cases')
        order = request.args.get('order', 'desc')
        
        # Validation des paramètres
        if metric not in ['cases', 'deaths']:
            return jsonify({'error': 'Métrique non valide. Utilisez "cases" ou "deaths"'}), 400
        
        if order not in ['desc', 'asc']:
            return jsonify({'error': 'Ordre non valide. Utilisez "desc" ou "asc"'}), 400
            
        if n <= 0 or n > 500:
            return jsonify({'error': 'N doit être entre 1 et 500'}), 400

        logger.info(f"Requête: top {n} pays par {metric} ({order})")
        
        # Charger et traiter les données
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        latest_data = processed_df.groupby('location').last().reset_index()
        
        # Sélectionner la colonne de tri
        sort_column = 'total_cases' if metric == 'cases' else 'total_deaths'
        
        # Trier et limiter
        ascending = order == 'asc'
        top_countries = latest_data.nlargest(n, sort_column) if not ascending else latest_data.nsmallest(n, sort_column)
        
        # Formatage du résultat
        result = []
        for i, (_, row) in enumerate(top_countries.iterrows(), 1):
            result.append({
                'rank': i,
                'country': row['location'],
                'total_cases': int(row['total_cases']) if pd.notna(row['total_cases']) else 0,
                'total_deaths': int(row['total_deaths']) if pd.notna(row['total_deaths']) else 0,
                'new_cases': int(row['new_cases']) if pd.notna(row['new_cases']) else 0,
                'new_deaths': int(row['new_deaths']) if pd.notna(row['new_deaths']) else 0,
                'last_update': row['date'].isoformat(),
                'sort_value': int(row[sort_column]) if pd.notna(row[sort_column]) else 0
            })
        
        logger.info(f"Top {n} pays calculé: {len(result)} résultats")
        return jsonify({
            'top_countries': result,
            'criteria': {
                'metric': metric,
                'order': order,
                'count': len(result)
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur top countries: {e}")
        return jsonify({'error': f'Erreur de calcul du top pays: {str(e)}'}), 500

@covid_routes.route('/trends', methods=['GET'])
def get_trends():
    """
    Retourne les pays avec la plus forte hausse/baisse sur 7 jours
    Paramètres:
    - metric: 'cases' ou 'deaths' (défaut: 'cases') 
    - limit: nombre de pays à retourner (défaut: 20)
    """
    try:
        metric = request.args.get('metric', 'cases')
        limit = int(request.args.get('limit', 20))
        
        if metric not in ['cases', 'deaths']:
            return jsonify({'error': 'Métrique non valide. Utilisez "cases" ou "deaths"'}), 400
            
        if limit <= 0 or limit > 100:
            return jsonify({'error': 'Limit doit être entre 1 et 100'}), 400

        logger.info(f"Requête: tendances {metric} sur 7 jours")
        
        # Charger et traiter les données
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        
        # Calculer les tendances sur 7 jours
        column_name = 'total_cases' if metric == 'cases' else 'total_deaths'
        trends = []
        
        for country in processed_df['location'].unique():
            country_data = processed_df[processed_df['location'] == country].sort_values('date')
            
            if len(country_data) >= 7:
                # Prendre les 7 derniers jours disponibles
                recent_data = country_data.tail(7)
                
                first_value = recent_data.iloc[0][column_name]
                last_value = recent_data.iloc[-1][column_name]
                
                # Éviter division par zéro
                if first_value > 0:
                    change_pct = ((last_value - first_value) / first_value) * 100
                    change_abs = last_value - first_value
                    
                    trends.append({
                        'country': country,
                        'current_value': int(last_value) if pd.notna(last_value) else 0,
                        'previous_value': int(first_value) if pd.notna(first_value) else 0,
                        'change_absolute': int(change_abs) if pd.notna(change_abs) else 0,
                        'change_percentage': round(change_pct, 2),
                        'trend_direction': 'hausse' if change_abs > 0 else 'baisse' if change_abs < 0 else 'stable',
                        'last_update': recent_data.iloc[-1]['date'].isoformat()
                    })
        
        # Trier par changement absolu (plus forte hausse/baisse)
        trends.sort(key=lambda x: abs(x['change_absolute']), reverse=True)
        
        # Séparer hausses et baisses
        hausses = [t for t in trends if t['change_absolute'] > 0][:limit]
        baisses = [t for t in trends if t['change_absolute'] < 0][:limit]
        
        logger.info(f"Tendances calculées: {len(hausses)} hausses, {len(baisses)} baisses")
        return jsonify({
            'trends': {
                'metric': metric,
                'period_days': 7,
                'strongest_increases': hausses,
                'strongest_decreases': baisses,
                'summary': {
                    'increases_count': len(hausses),
                    'decreases_count': len(baisses),
                    'total_countries': len(trends)
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur trends: {e}")
        return jsonify({'error': f'Erreur de calcul des tendances: {str(e)}'}), 500

# Mapping pays → continent
CONTINENT_MAPPING = {
    # Europe
    'Albania': 'Europe', 'Andorra': 'Europe', 'Austria': 'Europe', 'Belarus': 'Europe', 'Belgium': 'Europe',
    'Bosnia and Herzegovina': 'Europe', 'Bulgaria': 'Europe', 'Croatia': 'Europe', 'Cyprus': 'Europe', 'Czechia': 'Europe',
    'Czech Republic': 'Europe', 'Denmark': 'Europe', 'Estonia': 'Europe', 'Finland': 'Europe', 'France': 'Europe',
    'Germany': 'Europe', 'Greece': 'Europe', 'Hungary': 'Europe', 'Iceland': 'Europe', 'Ireland': 'Europe',
    'Italy': 'Europe', 'Latvia': 'Europe', 'Lithuania': 'Europe', 'Luxembourg': 'Europe', 'Malta': 'Europe',
    'Moldova': 'Europe', 'Monaco': 'Europe', 'Montenegro': 'Europe', 'Netherlands': 'Europe', 'North Macedonia': 'Europe',
    'Norway': 'Europe', 'Poland': 'Europe', 'Portugal': 'Europe', 'Romania': 'Europe', 'Russia': 'Europe',
    'San Marino': 'Europe', 'Serbia': 'Europe', 'Slovakia': 'Europe', 'Slovenia': 'Europe', 'Spain': 'Europe',
    'Sweden': 'Europe', 'Switzerland': 'Europe', 'Ukraine': 'Europe', 'United Kingdom': 'Europe', 'Vatican': 'Europe',

    # Asie
    'Afghanistan': 'Asia', 'Armenia': 'Asia', 'Azerbaijan': 'Asia', 'Bahrain': 'Asia', 'Bangladesh': 'Asia',
    'Bhutan': 'Asia', 'Brunei': 'Asia', 'Cambodia': 'Asia', 'China': 'Asia', 'Georgia': 'Asia',
    'India': 'Asia', 'Indonesia': 'Asia', 'Iran': 'Asia', 'Iraq': 'Asia', 'Israel': 'Asia',
    'Japan': 'Asia', 'Jordan': 'Asia', 'Kazakhstan': 'Asia', 'Kuwait': 'Asia', 'Kyrgyzstan': 'Asia',
    'Laos': 'Asia', 'Lebanon': 'Asia', 'Malaysia': 'Asia', 'Maldives': 'Asia', 'Mongolia': 'Asia',
    'Myanmar': 'Asia', 'Nepal': 'Asia', 'North Korea': 'Asia', 'Oman': 'Asia', 'Pakistan': 'Asia',
    'Palestine': 'Asia', 'Philippines': 'Asia', 'Qatar': 'Asia', 'Saudi Arabia': 'Asia', 'Singapore': 'Asia',
    'South Korea': 'Asia', 'Sri Lanka': 'Asia', 'Syria': 'Asia', 'Taiwan': 'Asia', 'Tajikistan': 'Asia',
    'Thailand': 'Asia', 'Timor': 'Asia', 'Turkey': 'Asia', 'Turkmenistan': 'Asia', 'United Arab Emirates': 'Asia',
    'Uzbekistan': 'Asia', 'Vietnam': 'Asia', 'Yemen': 'Asia',

    # Afrique
    'Algeria': 'Africa', 'Angola': 'Africa', 'Benin': 'Africa', 'Botswana': 'Africa', 'Burkina Faso': 'Africa',
    'Burundi': 'Africa', 'Cameroon': 'Africa', 'Cape Verde': 'Africa', 'Central African Republic': 'Africa', 'Chad': 'Africa',
    'Comoros': 'Africa', 'Congo': 'Africa', 'Democratic Republic of Congo': 'Africa', 'Djibouti': 'Africa', 'Egypt': 'Africa',
    'Equatorial Guinea': 'Africa', 'Eritrea': 'Africa', 'Eswatini': 'Africa', 'Ethiopia': 'Africa', 'Gabon': 'Africa',
    'Gambia': 'Africa', 'Ghana': 'Africa', 'Guinea': 'Africa', 'Guinea-Bissau': 'Africa', 'Ivory Coast': 'Africa',
    'Kenya': 'Africa', 'Lesotho': 'Africa', 'Liberia': 'Africa', 'Libya': 'Africa', 'Madagascar': 'Africa',
    'Malawi': 'Africa', 'Mali': 'Africa', 'Mauritania': 'Africa', 'Mauritius': 'Africa', 'Morocco': 'Africa',
    'Mozambique': 'Africa', 'Namibia': 'Africa', 'Niger': 'Africa', 'Nigeria': 'Africa', 'Rwanda': 'Africa',
    'Sao Tome and Principe': 'Africa', 'Senegal': 'Africa', 'Seychelles': 'Africa', 'Sierra Leone': 'Africa', 'Somalia': 'Africa',
    'South Africa': 'Africa', 'South Sudan': 'Africa', 'Sudan': 'Africa', 'Tanzania': 'Africa', 'Togo': 'Africa',
    'Tunisia': 'Africa', 'Uganda': 'Africa', 'Zambia': 'Africa', 'Zimbabwe': 'Africa',

    # Amérique du Nord
    'Canada': 'North America', 'Mexico': 'North America', 'United States': 'North America', 'Greenland': 'North America',

    # Amérique Centrale et Caraïbes
    'Antigua and Barbuda': 'North America', 'Bahamas': 'North America', 'Barbados': 'North America', 'Belize': 'North America',
    'Costa Rica': 'North America', 'Cuba': 'North America', 'Dominica': 'North America', 'Dominican Republic': 'North America',
    'El Salvador': 'North America', 'Grenada': 'North America', 'Guatemala': 'North America', 'Haiti': 'North America',
    'Honduras': 'North America', 'Jamaica': 'North America', 'Nicaragua': 'North America', 'Panama': 'North America',
    'Saint Kitts and Nevis': 'North America', 'Saint Lucia': 'North America', 'Saint Vincent and the Grenadines': 'North America',
    'Trinidad and Tobago': 'North America',

    # Amérique du Sud
    'Argentina': 'South America', 'Bolivia': 'South America', 'Brazil': 'South America', 'Chile': 'South America',
    'Colombia': 'South America', 'Ecuador': 'South America', 'French Guiana': 'South America', 'Guyana': 'South America',
    'Paraguay': 'South America', 'Peru': 'South America', 'Suriname': 'South America', 'Uruguay': 'South America',
    'Venezuela': 'South America',

    # Océanie
    'Australia': 'Oceania', 'Fiji': 'Oceania', 'Kiribati': 'Oceania', 'Marshall Islands': 'Oceania',
    'Micronesia': 'Oceania', 'Nauru': 'Oceania', 'New Zealand': 'Oceania', 'Palau': 'Oceania',
    'Papua New Guinea': 'Oceania', 'Samoa': 'Oceania', 'Solomon Islands': 'Oceania', 'Tonga': 'Oceania',
    'Tuvalu': 'Oceania', 'Vanuatu': 'Oceania'
}

@covid_routes.route('/continent/<continent_name>', methods=['GET'])
def get_continent_data(continent_name):
    """
    Regroupe les données par continent
    Continents supportés: Europe, Asia, Africa, North America, South America, Oceania
    """
    try:
        # Normaliser le nom du continent
        continent_normalized = continent_name.title()
        valid_continents = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania']
        
        if continent_normalized not in valid_continents:
            return jsonify({
                'error': f'Continent non valide. Continents supportés: {", ".join(valid_continents)}'
            }), 400

        logger.info(f"Requête: données continent {continent_normalized}")
        
        # Charger et traiter les données
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        latest_data = processed_df.groupby('location').last().reset_index()
        
        # Filtrer par continent
        continent_countries = [country for country, continent in CONTINENT_MAPPING.items() 
                             if continent == continent_normalized]
        
        continent_data = latest_data[latest_data['location'].isin(continent_countries)]
        
        if continent_data.empty:
            return jsonify({
                'continent': continent_normalized,
                'countries': [],
                'summary': {
                    'countries_count': 0,
                    'total_cases': 0,
                    'total_deaths': 0,
                    'message': 'Aucun pays trouvé pour ce continent'
                }
            })
        
        # Préparer les données par pays
        countries_data = []
        for _, row in continent_data.iterrows():
            countries_data.append({
                'country': row['location'],
                'total_cases': int(row['total_cases']) if pd.notna(row['total_cases']) else 0,
                'total_deaths': int(row['total_deaths']) if pd.notna(row['total_deaths']) else 0,
                'new_cases': int(row['new_cases']) if pd.notna(row['new_cases']) else 0,
                'new_deaths': int(row['new_deaths']) if pd.notna(row['new_deaths']) else 0,
                'last_update': row['date'].isoformat()
            })
        
        # Calculer les totaux du continent
        continent_summary = {
            'countries_count': len(countries_data),
            'total_cases': int(continent_data['total_cases'].sum()),
            'total_deaths': int(continent_data['total_deaths'].sum()),
            'total_new_cases': int(continent_data['new_cases'].sum()),
            'total_new_deaths': int(continent_data['new_deaths'].sum()),
            'avg_cases_per_country': round(continent_data['total_cases'].mean(), 2),
            'avg_deaths_per_country': round(continent_data['total_deaths'].mean(), 2)
        }
        
        # Trier par nombre de cas
        countries_data.sort(key=lambda x: x['total_cases'], reverse=True)
        
        logger.info(f"Données continent {continent_normalized}: {len(countries_data)} pays")
        return jsonify({
            'continent': continent_normalized,
            'countries': countries_data,
            'summary': continent_summary,
            'top_5_countries': countries_data[:5]  # Top 5 du continent
        })
        
    except Exception as e:
        logger.error(f"Erreur continent data: {e}")
        return jsonify({'error': f'Erreur de récupération des données continent: {str(e)}'}), 500

@covid_routes.route('/historical', methods=['GET'])
@measure_performance
def get_historical_data():
    """Endpoint pour récupérer les données historiques pour la heatmap"""
    try:
        logger.info("Requête: données historiques")
        
        # Paramètres de requête
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        limit_days = request.args.get('limit_days', type=int)
        
        raw_df = data_loader.load_data()
        if raw_df is None or raw_df.empty:
            return jsonify({'error': 'Aucune donnée disponible'}), 404
        
        processed_df = data_processor.process_raw_data(raw_df)
        
        # Filtrer par dates si spécifiées
        if start_date:
            processed_df = processed_df[processed_df['date'] >= pd.to_datetime(start_date)]
        if end_date:
            processed_df = processed_df[processed_df['date'] <= pd.to_datetime(end_date)]
        
        # Limiter le nombre de jours si spécifié
        if limit_days:
            latest_date = processed_df['date'].max()
            start_limit = latest_date - pd.Timedelta(days=limit_days)
            processed_df = processed_df[processed_df['date'] >= start_limit]
        
        # Grouper par date et calculer les totaux mondiaux quotidiens
        daily_totals = processed_df.groupby('date').agg({
            'new_cases': 'sum',
            'new_deaths': 'sum',
            'total_cases': 'sum',
            'total_deaths': 'sum'
        }).reset_index()
        
        # Convertir en format pour la heatmap
        historical_data = []
        for _, row in daily_totals.iterrows():
            historical_data.append({
                'date': row['date'].strftime('%Y-%m-%d'),
                'new_cases': int(row['new_cases']) if pd.notna(row['new_cases']) else 0,
                'new_deaths': int(row['new_deaths']) if pd.notna(row['new_deaths']) else 0,
                'total_cases': int(row['total_cases']) if pd.notna(row['total_cases']) else 0,
                'total_deaths': int(row['total_deaths']) if pd.notna(row['total_deaths']) else 0
            })
        
        # Statistiques pour la réponse
        max_new_cases = max([d['new_cases'] for d in historical_data]) if historical_data else 0
        total_days = len(historical_data)
        date_range = {
            'start': historical_data[0]['date'] if historical_data else None,
            'end': historical_data[-1]['date'] if historical_data else None
        }
        
        logger.info(f"Données historiques: {total_days} jours, pic: {max_new_cases}")
        return jsonify({
            'data': historical_data,
            'metadata': {
                'total_days': total_days,
                'max_new_cases': max_new_cases,
                'date_range': date_range,
                'available_metrics': ['new_cases', 'new_deaths', 'total_cases', 'total_deaths']
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur données historiques: {e}")
        return jsonify({'error': f'Erreur de récupération des données historiques: {str(e)}'}), 500
