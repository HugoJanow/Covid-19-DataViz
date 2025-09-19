import os
from datetime import timedelta
from pathlib import Path

class Config:
    
    ENV = os.environ.get('ENV', os.environ.get('FLASK_ENV', 'development'))
    VERSION = '2.0.0'
    
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 5000))
    
    BASE_DIR = Path(__file__).parent
    DATA_FOLDER = BASE_DIR / "data"
    CSV_FILE = BASE_DIR / "01-01-2021.csv"
    MULTI_CSV_MODE = os.environ.get('MULTI_CSV_MODE', 'true').lower() == 'true'
    
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('DEBUG', os.environ.get('FLASK_DEBUG', 'False')).lower() in ['true', '1', 'yes']
    
    API_PREFIX = '/api'
    API_VERSION = 'v1'
    
    CACHE_TIMEOUT = timedelta(hours=6)
    
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]
    
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 200
    
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_TO_FILE = os.environ.get('LOG_TO_FILE', 'false').lower() == 'true'

class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    DEBUG = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-only')
    
    @classmethod
    def validate(cls):
        if not os.environ.get('SECRET_KEY') and os.environ.get('ENV') == 'production':
            raise ValueError("SECRET_KEY must be set in production")

class TestingConfig(Config):
    TESTING = True
    DEBUG = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    env = os.environ.get('ENV', os.environ.get('FLASK_ENV', 'development'))
    config_class = config.get(env, config['default'])
    
    if env == 'production' and config_class == ProductionConfig:
        ProductionConfig.validate()
    
    return config_class

Config = get_config()