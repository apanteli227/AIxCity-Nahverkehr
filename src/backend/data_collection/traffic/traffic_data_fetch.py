import pandas as pd
import requests
import logging

def get_traffic_dataframe(api_url) -> pd.DataFrame:
    """
    Diese Funktion ruft anhand der übergebenen API
    die Verehrsdaten ab und gibt diese als DataFrame zurück.

    Parameters:
    - api_url (str): Die URL zur Abfrage der Verkehrsdaten.

    Returns:
    - dataframe (DataFrame): DataFrame mit den Verkehrsdaten.
    """
    # API-Anfrage senden und JSON-Daten abrufen
    response = requests.get(api_url)

    # Überprüfen, ob die Anfrage erfolgreich war (Status Code 200)
    if response.status_code == 200:
        # JSON-Daten aus der Antwort extrahieren
        json_data = response.json()

        # DataFrame erstellen
        dataframe = pd.DataFrame(json_data)

        return dataframe
    else:
        # Falls die Anfrage nicht erfolgreich war, eine Fehlermeldung ausgeben
        logging.warn(f"Fehler bei der API-Anfrage der Verkehrsdaten. Status Code: {response.status_code}")
        return None
