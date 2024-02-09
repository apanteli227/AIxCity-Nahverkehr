import pandas as pd
import requests


def get_traffic_dataframe(api_url):
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
        print(f"Fehler bei der API-Anfrage. Status Code: {response.status_code}")
        return None
