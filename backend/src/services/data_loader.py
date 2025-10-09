import os
import glob
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from src.utils.logger import get_logger
from src.services.data_cache import DataCache

logger = get_logger(__name__)

class DataLoader:
    def __init__(self, data_folder: Path, single_csv_path: Path):
        self.data_folder = data_folder
        self.single_csv_path = single_csv_path
        
        # Initialiser le cache
        self.cache = DataCache(
            data_folder=str(data_folder),
            cache_folder=os.path.join(str(data_folder.parent), "cache"),
            cache_duration_hours=2  # Cache valide pendant 2 heures
        )
        
    def load_multiple_csv_files(self) -> Optional[pd.DataFrame]:
        if not self.data_folder.exists():
            logger.warning(f"Dossier de données non trouvé: {self.data_folder}")
            return None
            
        csv_files = list(self.data_folder.glob("*.csv"))
        
        if not csv_files:
            logger.warning(f"Aucun fichier CSV trouvé dans {self.data_folder}")
            return None
        
        logger.info(f"Fichiers CSV trouvés: {len(csv_files)}")
        combined_data = []
        
        for csv_file in sorted(csv_files):
            try:
                logger.debug(f"Lecture de {csv_file.name}")
                df = pd.read_csv(csv_file)
                file_date = self._extract_date_from_filename(csv_file.name)
                if file_date:
                    df['file_date'] = file_date
                    combined_data.append(df)
                    
            except Exception as e:
                logger.error(f"Erreur lors de la lecture de {csv_file}: {e}")
                continue
        
        if not combined_data:
            return None
        
        all_data = pd.concat(combined_data, ignore_index=True)
        logger.info(f"Données combinées: {len(all_data)} lignes")
        
        return all_data
    
    def load_single_csv_file(self) -> Optional[pd.DataFrame]:
        if not self.single_csv_path.exists():
            logger.error(f"Fichier CSV unique non trouvé: {self.single_csv_path}")
            return None
        
        try:
            logger.info(f"Lecture du fichier unique: {self.single_csv_path}")
            df = pd.read_csv(self.single_csv_path)
            df['file_date'] = pd.to_datetime('2021-01-01')
            return df
            
        except Exception as e:
            logger.error(f"Erreur lors de la lecture du fichier unique: {e}")
            return None
    
    def load_data(self) -> Optional[pd.DataFrame]:
        """Charge les données avec mise en cache intelligente"""
        
        # D'abord essayer de charger depuis le cache
        cached_data = self.cache.load_from_cache()
        if cached_data is not None:
            logger.info("✅ Données chargées depuis le cache")
            return cached_data
        
        # Si pas de cache valide, charger les données normalement
        logger.info("📂 Chargement des données depuis les fichiers...")
        df = self.load_multiple_csv_files()
        
        if df is not None:
            logger.info("Utilisation de plusieurs fichiers CSV")
            # Sauvegarder en cache
            self.cache.save_to_cache(df)
            return df
        
        logger.info("Fallback vers le fichier unique")
        df = self.load_single_csv_file()
        
        if df is not None:
            logger.info("Fichier unique chargé")
            # Sauvegarder en cache
            self.cache.save_to_cache(df)
            return df
        
        logger.error("❌ Aucune source de données disponible")
        return None
    
    def refresh_cache(self):
        """Force le rechargement des données et met à jour le cache"""
        logger.info("🔄 Actualisation forcée du cache...")
        self.cache.clear_cache()
        return self.load_data()
    
    def get_cache_info(self):
        """Retourne les informations sur le cache"""
        return self.cache.get_cache_info()
    
    def _extract_date_from_filename(self, filename: str) -> Optional[pd.Timestamp]:
        try:
            if filename.endswith('.csv'):
                date_str = filename[:-4]
                return pd.to_datetime(date_str, format='%m-%d-%Y')
        except:
            try:
                return pd.to_datetime(date_str, format='%Y-%m-%d')
            except:
                logger.warning(f"Impossible d'extraire la date de {filename}")
                return None
        return None