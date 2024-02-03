import requests
import pandas as pd
import logging
import weather_cleaner as wc
from datetime import datetime



def get_weather_data(api_key, city):
    """
    Diese Funktion holt die Wetterdaten für eine Stadt von OpenWeatherMap.

    Parameters:
    - api_key (str): Der API-Key für OpenWeatherMap.

    Returns:
    - weather_data (dict): Die Wetterdaten im JSON-Format.
    """

    # URL für die Abfrage der Wetterdaten
    base_url = "http://api.openweathermap.org/data/2.5/weather"

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


def start_weather_process():
    """
    Diese Funktion startet den Prozess zur Ermittlung der Wetterdaten.
    
    Returns:
    - weather_bremen_df (DataFrame): DataFrame mit den Wetterdaten für Bremen.
    """
    # API-Key für OpenWeatherMap 
    # Achtung: API-Key ist vom Account von Emmanuel
    # todo: Für längerfristige Lösung könnte man einen gemeinsamen Account für den Key erstellen
    api_key = '131b00cd42bee49451a4c69d496797e1'

    # Stadt für die Wetterdaten
    city = 'Bremen'

    # Abrufen der Funktion zur Ermittlung Wetterdaten
    weather_data = get_weather_data(api_key, city)

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

        weather_warning = wc.get_weather_warning()

        # Erstellen eines DataFrames mit den erstellten Wetterdaten
        weather_bremen_df = pd.DataFrame({
            'Stadt': [city],
            'Datum': [datetime.now().strftime("%Y-%m-%d")],
            'Uhrzeit': [datetime.now().strftime("%H:%M:%S")],
            'Temperatur (°C)': [temperature],
            'Feuchtigkeit (%)': [humidity],
            'Wetterbeschreibung': [description],
            'Windgeschwindigkeit (m/s)': [wind_speed],
            'Wetterwarnungen': [weather_warning]
        })

        # Optional: Speichern des Wetter-DataFrames als CSV-Datei
        weather_bremen_df.to_csv("weather_bremen_df.csv", index=False)
        print(weather_bremen_df)
        logging.info("Wetterdaten erfolgreich ermittelt und gespeichert!")
    else:
        logging.warning("Prozess zur Ermittlung der Bremer Wetterdaten fehlgeschlagen!")


# Main-Funktion zum Start des zur Ermittlung der Wetterdaten über OpenWeatherMap
if __name__ == "__main__":
    # Konfiguriere das Logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    logging.info("Starte Prozess zur Ermittlung der Bremer Wetterdaten...")

    start_weather_process()

