import logging
import sys
from datetime import datetime
from config import Config

logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f'logs/app_{datetime.now().strftime("%Y%m%d")}.log', encoding='utf-8')
    ] if Config.LOG_TO_FILE else [logging.StreamHandler(sys.stdout)]
)

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    
    if Config.ENV == 'development':
        logger.setLevel(logging.DEBUG)
    elif Config.ENV == 'production':
        logger.setLevel(logging.WARNING)
    
    return logger

def log_request(logger: logging.Logger, endpoint: str, method: str, ip: str = None):
    ip_info = f" from {ip}" if ip else ""
    logger.info(f"{method} {endpoint}{ip_info}")

def log_performance(logger: logging.Logger, operation: str, duration: float, details: str = None):
    details_info = f" - {details}" if details else ""
    if duration > 1.0:
        logger.warning(f"{operation}: {duration:.2f}s (lent){details_info}")
    else:
        logger.info(f"{operation}: {duration:.2f}s{details_info}")

def log_error(logger: logging.Logger, operation: str, error: Exception, context: dict = None):
    context_info = f" | Contexte: {context}" if context else ""
    logger.error(f" {operation} a échoué: {str(error)}{context_info}", exc_info=True)