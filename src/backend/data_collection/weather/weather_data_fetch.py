import logging
from datetime import datetime
from ..weather import weather_data_cleaner as wdc
import pandas as pd
import requests


def get_weather_data(base_url, api_key, city):
    """
    Diese Funktion holt die Wetterdaten für eine Stadt von OpenWeatherMap.

    Parameters:
        #todo docs add param
    - api_key (str): Der API-Key für OpenWeatherMap.

    Returns:
    - weather_data (dict): Die Wetterdaten im JSON-Format.
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
        logging.warn(f"Fehlschlag bei der Abfrage. Status Code: {response.status_code}")
        return None


def get_weather_dataframe(url, api_key, city):
    """
    Diese Funktion startet den Prozess zur Ermittlung der Wetterdaten.
    
    Returns:
    - weather_bremen_df (DataFrame): DataFrame mit den Wetterdaten für Bremen.
    """

    # Konfiguriere das Logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    logging.info("Starte Prozess zur Ermittlung der Bremer Wetterdaten...")

    # Abrufen der Funktion zur Ermittlung Wetterdaten
    weather_data = get_weather_data(url, api_key, city)

    # Prüfen, ob die Wetterdaten erfolgreich ermittelt wurden
    if weather_data:
        # Extrahieren der wichtigen Aspekte der Wetterdaten
        temperature = weather_data['main']['temp']
        humidity = weather_data['main']['humidity']
        description = weather_data['weather'][0]['description']

        # Prüfen, ob Winddaten verfügbar sind
        if 'wind' in weather_data:
            wind_speed = weather_data['wind']['speed']
        else:
            wind_speed = None

        # Abrufen der Wetterwarnungen
        weather_warnings = wdc.get_weather_warning()

        # Erstellen eines DataFrames mit den erstellten Wetterdaten
        weather_bremen_df = pd.DataFrame({
            'city': [city],
            'date': [datetime.now().strftime("%Y-%m-%d")],
            'time': [datetime.now().strftime("%H:%M:%S")],
            'temperature (°C)': [temperature],
            'humidity (%)': [humidity],
            'weather_description': [description],
            'wind_speed (m/s)': [wind_speed],
            'weather_warning': [weather_warnings]
        })

        # Optional: Speichern des Wetter-DataFrames als CSV-Datei
        #weather_bremen_df.to_csv("weather_bremen_df.csv", index=False)
        logging.info("Wetterdaten erfolgreich ermittelt und gespeichert!")
        return weather_bremen_df
    else:
        logging.warning("Prozess zur Ermittlung der Bremer Wetterdaten fehlgeschlagen!")