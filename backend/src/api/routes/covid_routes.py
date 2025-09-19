import pandas as pd
from flask import Blueprint, jsonify, request
from src.services.data_loader import DataLoader
from src.services.data_processor import DataProcessor
from src.utils.logger import get_logger
from src.utils.cache import cache_response
from config import Config

covid_routes = Blueprint('covid', __name__)
data_loader = DataLoader(Config.DATA_FOLDER, Config.CSV_FILE)
data_processor = DataProcessor()
logger = get_logger(__name__)

@covid_routes.route('/cases', methods=['GET'])
@cache_response(seconds=300)
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