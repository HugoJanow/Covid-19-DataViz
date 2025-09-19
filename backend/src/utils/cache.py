import time
import hashlib
import json
from typing import Any, Optional, Callable
from functools import wraps
from flask import request, jsonify
from src.utils.logger import get_logger

logger = get_logger(__name__)

class SimpleCache:
    def __init__(self):
        self._cache = {}
        self._timestamps = {}
    
    def _generate_key(self, endpoint: str, args: dict = None) -> str:
        key_data = {
            'endpoint': endpoint,
            'args': args or {}
        }
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, key: str, max_age: int = 300) -> Optional[Any]:
        if key not in self._cache:
            return None
        
        timestamp = self._timestamps.get(key, 0)
        if time.time() - timestamp > max_age:
            self._remove(key)
            return None
        
        logger.debug(f"Cache hit: {key}")
        return self._cache[key]
    
    def set(self, key: str, value: Any) -> None:
        self._cache[key] = value
        self._timestamps[key] = time.time()
        logger.debug(f"Cache set: {key}")
    
    def _remove(self, key: str) -> None:
        if key in self._cache:
            del self._cache[key]
        if key in self._timestamps:
            del self._timestamps[key]
    
    def clear(self) -> None:
        self._cache.clear()
        self._timestamps.clear()
        logger.info("Cache vidé")
    
    def get_stats(self) -> dict:
        return {
            'entries': len(self._cache),
            'size_bytes': sum(len(str(v)) for v in self._cache.values()),
            'oldest_entry': min(self._timestamps.values()) if self._timestamps else None
        }

_cache = SimpleCache()

def cache_response(seconds: int = 300):
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            endpoint = request.endpoint or func.__name__
            cache_args = {
                'url': request.url,
                'method': request.method,
                'args': dict(request.args),
                'json': request.get_json() if request.is_json else None
            }
            cache_key = _cache._generate_key(endpoint, cache_args)
            cached_result = _cache.get(cache_key, seconds)
            if cached_result is not None:
                return cached_result
            
            start_time = time.time()
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            
            if hasattr(result, 'status_code') and result.status_code == 200:
                _cache.set(cache_key, result)
                logger.info(f"Réponse mise en cache: {endpoint} (durée: {duration:.2f}s)")
            
            return result
        
        return wrapper
    return decorator

def invalidate_cache(pattern: str = None) -> None:
    _cache.clear()
    logger.info("Cache invalidé")

def get_cache_stats() -> dict:
    return _cache.get_stats()