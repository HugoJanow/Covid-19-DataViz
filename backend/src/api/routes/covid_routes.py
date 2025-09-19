import pandas as pd
from flask import Blueprint, jsonify, request
from src.services.data_loader import DataLoader
from src.services.data_processor import DataProcessor
from src.utils.logger import get_logger
from config import Config

covid_routes = Blueprint('covid', __name__)
data_loader = DataLoader(Config.DATA_FOLDER, Config.CSV_FILE)
data_processor = DataProcessor()
logger = get_logger(__name__)

@covid_routes.route('/global', methods=['GET'])
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
