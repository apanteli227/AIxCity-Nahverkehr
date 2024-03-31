import logging
from datetime import datetime
from ..weather import weather_data_cleaner as wdc
from ..weather import weather_data_transform as wdt
import pandas as pd
import requests


def get_weather_data(base_url, api_key, city):
    """
    Diese Funktion holt die Wetterdaten für eine Stadt von OpenWeatherMap.

    Parameters:
    - base_url (str): Die Basis-URL für die Abfrage der Wetterdaten.
    - api_key (str): Der API-Key für OpenWeatherMap.
    - city (str): Der Name der Stadt, für die die Wetterdaten abgefragt werden sollen.

    Returns:
    - weather_data: Die Wetterdaten im JSON-Format.
    """

    # Parameter für die Abfrage der Wetterdaten
    params = {
        'q': city,
        'appid': api_key,
        'units': 'metric'
    }

    # Abrufen der Wetterdaten
    response = requests.get(base_url, params=params)

    # Prüfen, ob die Abfrage erfolgreich war
    if response.status_code == 200:
        weather_data = response.json()
        return weather_data
    else:
        logging.warn(f"Fehlschlag bei der Wetterabfrage. Status Code: {response.status_code}")
        return None


def get_weather_dataframe(url, api_key, city):
    """
    Diese Funktion startet den Prozess zur Ermittlung der Wetterdaten.
    
    Returns:
    - weather_bremen_df (DataFrame): DataFrame mit den Wetterdaten für Bremen.
    """

    # Konfiguriere das Logging
    CCYAN = '\033[36m'
    CEND = '\033[0m'
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    logging.info(CCYAN + "[WEATHER] " + CEND + "Starte Prozess zur Ermittlung der Wetterdaten...")

    # Abrufen der Funktion zur Ermittlung Wetterdaten
    weather_data = get_weather_data(url, api_key, city)

    # Prüfen, ob die Wetterdaten erfolgreich ermittelt wurden
    if weather_data:
        # Extrahieren der wichtigen Aspekte der Wetterdaten
        temperature = weather_data['main']['temp']
        humidity = weather_data['main']['humidity']
        description = weather_data['weather'][0]['description']

        # Tranformation der Wetterbeschreibung
        transformed_description = wdt.transform_weather_description(description)

        # Prüfen, ob Winddaten verfügbar sind
        if 'wind' in weather_data:
            wind_speed = weather_data['wind']['speed']
        else:
            wind_speed = None

        # Abrufen der Wetterwarnungen
        weather_warnings = wdc.get_weather_warning()

        # Transformation der Wetterwarnungen
        transformed_weather_warnings = wdt.transform_weather_warning(weather_warnings)

        # Erstellen eines DataFrames mit den erstellten Wetterdaten
        weather_bremen_df = pd.DataFrame({
            'city': [city],
            'date': [datetime.now().strftime("%Y-%m-%d")],
            'time': [datetime.now().strftime("%H:%M:%S")],
            'dayhour': [wdt.assign_hour_value()],
            'temperature_celsius': [temperature],
            'humidity_percentage': [humidity],
            'weather_description': [transformed_description],
            'wind_speed_m_s': [wind_speed],
            'weather_warning': [transformed_weather_warnings]
        })

        # Optional: Speichern des Wetter-DataFrames als CSV-Datei
        #weather_bremen_df.to_csv("weather_bremen_df.csv", index=False)
        logging.info(CCYAN + "[WEATHER] " + CEND + "Daten erfolgreich ermittelt!")
        return weather_bremen_df
    else:
        logging.warning(CCYAN + "[WEATHER] " + CEND + "Prozess zur Ermittlung der Bremer Wetterdaten fehlgeschlagen!")
