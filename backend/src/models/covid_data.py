from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List
import pandas as pd

@dataclass
class CovidCountryData:
    location: str
    iso_code: str
    date: datetime
    total_cases: int
    new_cases: int
    total_deaths: int
    new_deaths: int
    total_recovered: Optional[int]
    active_cases: Optional[int]
    population: Optional[int]
    
    def to_dict(self) -> dict:
        return {
            'location': self.location,
            'iso_code': self.iso_code,
            'date': self.date.isoformat() if self.date else None,
            'total_cases': self.total_cases,
            'new_cases': self.new_cases,
            'total_deaths': self.total_deaths,
            'new_deaths': self.new_deaths,
            'total_recovered': self.total_recovered,
            'active_cases': self.active_cases,
            'population': self.population
        }

@dataclass
class GlobalStats:
    total_cases: int
    total_deaths: int
    total_recovered: int
    active_cases: int
    new_cases: int
    new_deaths: int
    countries_count: int
    last_update: datetime
    
    def to_dict(self) -> dict:
        return {
            'total_cases': self.total_cases,
            'total_deaths': self.total_deaths,
            'total_recovered': self.total_recovered,
            'active_cases': self.active_cases,
            'new_cases': self.new_cases,
            'new_deaths': self.new_deaths,
            'countries_count': self.countries_count,
            'last_update': self.last_update.isoformat() if self.last_update else None
        }

@dataclass
class CountryTimeline:
    country: str
    data: List[CovidCountryData]
    days: int
    temporal: bool
    
    def to_dict(self) -> dict:
        return {
            'country': self.country,
            'data': [item.to_dict() for item in self.data],
            'days': self.days,
            'temporal': self.temporal
        }

@dataclass
class CountryComparison:
    countries: List[str]
    metric: str
    comparison_data: dict
    
    def to_dict(self) -> dict:
        return {
            'countries': self.countries,
            'metric': self.metric,
            'comparison': self.comparison_data,
            'countries_found': len(self.comparison_data),
            'countries_requested': len(self.countries)
        }