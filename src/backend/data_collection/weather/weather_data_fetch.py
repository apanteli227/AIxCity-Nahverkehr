import logging
from datetime import datetime

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
        print(f"Fehlschlag bei der Abfrage. Status Code: {response.status_code}")
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
        warnings_response = requests.get(f"http://api.openweathermap.org/data/3.0/warnings?appid={api_key}&q={city}")
        warnings_data = warnings_response.json()

        # Prüfen, ob Wetterwarnungen verfügbar sind
        if 'warnings' in warnings_data:
            weather_warnings = warnings_data['warnings']
        else:
            weather_warnings = None

        # Erstellen eines DataFrames mit den erstellten Wetterdaten
        weather_bremen_df = pd.DataFrame({
            'Stadt': [city],
            'Datum': [datetime.now().strftime("%Y-%m-%d")],
            'Uhrzeit': [datetime.now().strftime("%H:%M:%S")],
            'Temperatur (°C)': [temperature],
            'Feuchtigkeit (%)': [humidity],
            'Wetterbeschreibung': [description],
            'Windgeschwindigkeit (m/s)': [wind_speed],
            'Wetterwarnungen': [weather_warnings]
        })

        # Optional: Speichern des Wetter-DataFrames als CSV-Datei
        weather_bremen_df.to_csv("weather_bremen_df.csv", index=False)
        logging.info("Wetterdaten erfolgreich ermittelt und gespeichert!")
        return weather_bremen_df
    else:
        logging.warning("Prozess zur Ermittlung der Bremer Wetterdaten fehlgeschlagen!")
