import pandas as pd
from datetime import datetime
from typing import List, Optional, Dict, Any
from src.models.covid_data import CovidCountryData, GlobalStats, CountryTimeline, CountryComparison
from src.utils.logger import get_logger

logger = get_logger(__name__)

class DataProcessor:
    def process_raw_data(self, df: pd.DataFrame) -> pd.DataFrame:
        logger.info(f"Traitement de {len(df)} lignes de données brutes")
        groupby_cols = ['Country_Region']
        
        if 'file_date' in df.columns:
            groupby_cols.append('file_date')
            logger.info("Données multi-temporelles détectées")
        
        if 'Province_State' in df.columns:
            country_data = df.groupby(groupby_cols).agg({
                'Confirmed': 'sum',
                'Deaths': 'sum',
                'Recovered': 'sum',
                'Active': 'sum',
                'Last_Update': 'first'
            }).reset_index()
        else:
            country_data = df.copy()
        
        rename_dict = {
            'Country_Region': 'location',
            'Confirmed': 'total_cases',
            'Deaths': 'total_deaths',
            'Recovered': 'total_recovered',
            'Active': 'active_cases'
        }
        
        if 'file_date' in country_data.columns:
            rename_dict['file_date'] = 'date'
        else:
            rename_dict['Last_Update'] = 'date'
        
        country_data = country_data.rename(columns=rename_dict)
        
        country_data['date'] = pd.to_datetime(country_data['date'])
        country_data['iso_code'] = country_data['location'].apply(
            lambda x: x.replace(' ', '').upper()[:3] if pd.notna(x) else 'UNK'
        )
        country_data = self._calculate_new_values(country_data)
        country_data['population'] = None
        columns_to_keep = [
            'location', 'iso_code', 'date', 'total_cases', 'new_cases', 
            'total_deaths', 'new_deaths', 'total_recovered', 'active_cases', 'population'
        ]
        
        country_data = country_data[columns_to_keep]
        country_data = country_data[
            country_data['total_cases'].notna() & (country_data['total_cases'] > 0)
        ]
        
        logger.info(
            f"Données traitées: {len(country_data)} entrées, "
            f"{len(country_data['location'].unique())} pays, "
            f"{len(country_data['date'].unique())} dates"
        )
        
        return country_data
    
    def _calculate_new_values(self, df: pd.DataFrame) -> pd.DataFrame:
        if len(df['date'].unique()) > 1:
            logger.info("Calcul des nouveaux cas et décès")
            df = df.sort_values(['location', 'date'])
            df['new_cases'] = df.groupby('location')['total_cases'].diff().fillna(0)
            df['new_deaths'] = df.groupby('location')['total_deaths'].diff().fillna(0)
            df['new_cases'] = df['new_cases'].clip(lower=0)
            df['new_deaths'] = df['new_deaths'].clip(lower=0)
        else:
            logger.info("Données statiques - new_cases et new_deaths mis à 0")
            df['new_cases'] = 0
            df['new_deaths'] = 0
        
        return df
    
    def get_country_data(self, df: pd.DataFrame, country_name: str, days: int = 30) -> Optional[CountryTimeline]:
        country_data = df[df['location'].str.lower() == country_name.lower()]
        
        if country_data.empty:
            country_data = df[df['location'].str.contains(country_name, case=False, na=False)]
        
        if country_data.empty:
            return None
        
        country_data = country_data.sort_values('date').tail(days)
        
        data_list = []
        for _, row in country_data.iterrows():
            data_list.append(CovidCountryData(
                location=row['location'],
                iso_code=row['iso_code'],
                date=row['date'],
                total_cases=int(row['total_cases']) if pd.notna(row['total_cases']) else 0,
                new_cases=int(row['new_cases']) if pd.notna(row['new_cases']) else 0,
                total_deaths=int(row['total_deaths']) if pd.notna(row['total_deaths']) else 0,
                new_deaths=int(row['new_deaths']) if pd.notna(row['new_deaths']) else 0,
                total_recovered=int(row['total_recovered']) if pd.notna(row['total_recovered']) else None,
                active_cases=int(row['active_cases']) if pd.notna(row['active_cases']) else None,
                population=row['population'] if pd.notna(row['population']) else None
            ))
        
        is_temporal = len(country_data['date'].unique()) > 1
        
        return CountryTimeline(
            country=country_data.iloc[0]['location'],
            data=data_list,
            days=len(data_list),
            temporal=is_temporal
        )
    
    def get_global_stats(self, df: pd.DataFrame) -> GlobalStats:
        latest_data = df.groupby('location').last().reset_index()
        
        total_cases = int(latest_data['total_cases'].sum())
        total_deaths = int(latest_data['total_deaths'].sum())
        total_recovered = int(latest_data['total_recovered'].fillna(0).sum())
        active_cases = int(latest_data['active_cases'].fillna(0).sum())
        
        new_cases = int(latest_data['new_cases'].fillna(0).sum())
        new_deaths = int(latest_data['new_deaths'].fillna(0).sum())
        
        countries_count = len(latest_data)
        last_update = df['date'].max()
        
        return GlobalStats(
            total_cases=total_cases,
            total_deaths=total_deaths,
            total_recovered=total_recovered,
            active_cases=active_cases,
            new_cases=new_cases,
            new_deaths=new_deaths,
            countries_count=countries_count,
            last_update=last_update
        )
    
    def compare_countries(self, df: pd.DataFrame, countries: List[str], metric: str) -> CountryComparison:
        comparison_data = {}
        
        for country in countries:
            country_data = df[df['location'].str.lower() == country.lower()]
            if not country_data.empty:
                country_data = country_data.sort_values('date')
                
                comparison_data[country] = {
                    'dates': country_data['date'].dt.strftime('%Y-%m-%d').tolist(),
                    'values': country_data[metric].fillna(0).astype(int).tolist() if metric in country_data.columns else [0],
                    'total_cases': int(country_data.iloc[-1]['total_cases']),
                    'total_deaths': int(country_data.iloc[-1]['total_deaths']),
                    'total_recovered': int(country_data.iloc[-1]['total_recovered']) if pd.notna(country_data.iloc[-1]['total_recovered']) else 0,
                    'active_cases': int(country_data.iloc[-1]['active_cases']) if pd.notna(country_data.iloc[-1]['active_cases']) else 0
                }
        
        return CountryComparison(
            countries=countries,
            metric=metric,
            comparison_data=comparison_data
        )
    
    def get_countries_list(self, df: pd.DataFrame) -> List[str]:
        return sorted(df['location'].unique().tolist())