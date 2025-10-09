import os
import pandas as pd
import pickle
import hashlib
from datetime import datetime, timedelta
from src.utils.logger import get_logger

logger = get_logger(__name__)

class DataCache:
    def __init__(self, data_folder, cache_folder="cache", cache_duration_hours=1):
        self.data_folder = data_folder
        self.cache_folder = cache_folder
        self.cache_duration_hours = cache_duration_hours
        self.cache_file = os.path.join(cache_folder, "covid_data_cache.pkl")
        self.meta_file = os.path.join(cache_folder, "cache_metadata.pkl")
        
        # Créer le dossier cache s'il n'existe pas
        os.makedirs(cache_folder, exist_ok=True)
        
        self._cached_data = None
        self._cache_timestamp = None
    
    def get_data_hash(self):
        """Calcule un hash des fichiers CSV pour détecter les changements"""
        try:
            csv_files = []
            if os.path.exists(self.data_folder):
                csv_files = [f for f in os.listdir(self.data_folder) if f.endswith('.csv')]
            
            # Hash basé sur les noms de fichiers et leurs tailles
            hash_input = ""
            for csv_file in sorted(csv_files):
                file_path = os.path.join(self.data_folder, csv_file)
                if os.path.exists(file_path):
                    stat = os.stat(file_path)
                    hash_input += f"{csv_file}:{stat.st_size}:{stat.st_mtime};"
            
            return hashlib.md5(hash_input.encode()).hexdigest()
        except Exception as e:
            logger.warning(f"Erreur calcul hash: {e}")
            return None
    
    def is_cache_valid(self):
        """Vérifie si le cache est valide (pas expiré et données inchangées)"""
        try:
            # Vérifier si les fichiers de cache existent
            if not os.path.exists(self.cache_file) or not os.path.exists(self.meta_file):
                return False
            
            # Charger les métadonnées du cache
            with open(self.meta_file, 'rb') as f:
                metadata = pickle.load(f)
            
            cache_time = metadata.get('timestamp')
            cached_hash = metadata.get('data_hash')
            
            # Vérifier l'âge du cache
            if cache_time:
                age = datetime.now() - cache_time
                if age > timedelta(hours=self.cache_duration_hours):
                    logger.info(f"Cache expiré (âge: {age})")
                    return False
            
            # Vérifier si les données ont changé
            current_hash = self.get_data_hash()
            if current_hash and cached_hash != current_hash:
                logger.info("Données modifiées, cache invalide")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Erreur validation cache: {e}")
            return False
    
    def load_from_cache(self):
        """Charge les données depuis le cache"""
        try:
            if not self.is_cache_valid():
                return None
            
            logger.info("Chargement depuis le cache...")
            with open(self.cache_file, 'rb') as f:
                cached_data = pickle.load(f)
            
            with open(self.meta_file, 'rb') as f:
                metadata = pickle.load(f)
            
            self._cached_data = cached_data
            self._cache_timestamp = metadata.get('timestamp')
            
            logger.info(f"Cache chargé avec succès ({len(cached_data)} lignes)")
            return cached_data
            
        except Exception as e:
            logger.error(f"Erreur chargement cache: {e}")
            return None
    
    def save_to_cache(self, data):
        """Sauvegarde les données dans le cache"""
        try:
            logger.info(f"Sauvegarde en cache ({len(data)} lignes)...")
            
            # Sauvegarder les données
            with open(self.cache_file, 'wb') as f:
                pickle.dump(data, f)
            
            # Sauvegarder les métadonnées
            metadata = {
                'timestamp': datetime.now(),
                'data_hash': self.get_data_hash(),
                'row_count': len(data),
                'columns': list(data.columns) if hasattr(data, 'columns') else []
            }
            
            with open(self.meta_file, 'wb') as f:
                pickle.dump(metadata, f)
            
            self._cached_data = data
            self._cache_timestamp = metadata['timestamp']
            
            logger.info("Cache sauvegardé avec succès")
            
        except Exception as e:
            logger.error(f"Erreur sauvegarde cache: {e}")
    
    def clear_cache(self):
        """Vide le cache"""
        try:
            for cache_path in [self.cache_file, self.meta_file]:
                if os.path.exists(cache_path):
                    os.remove(cache_path)
            
            self._cached_data = None
            self._cache_timestamp = None
            
            logger.info("Cache vidé")
        except Exception as e:
            logger.error(f"Erreur vidage cache: {e}")
    
    def get_cache_info(self):
        """Retourne les informations sur le cache"""
        try:
            if not os.path.exists(self.meta_file):
                return {"status": "no_cache"}
            
            with open(self.meta_file, 'rb') as f:
                metadata = pickle.load(f)
            
            age = datetime.now() - metadata.get('timestamp', datetime.now())
            
            return {
                "status": "exists",
                "timestamp": metadata.get('timestamp'),
                "age_hours": age.total_seconds() / 3600,
                "row_count": metadata.get('row_count', 0),
                "is_valid": self.is_cache_valid(),
                "data_hash": metadata.get('data_hash', ''),
                "file_size_mb": round(os.path.getsize(self.cache_file) / 1024 / 1024, 2) if os.path.exists(self.cache_file) else 0
            }
        except Exception as e:
            logger.error(f"Erreur info cache: {e}")
            return {"status": "error", "error": str(e)}