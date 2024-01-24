import os
import requests
import pandas as pd
import concurrent.futures

def api_to_dataframe(api_url):
    # API-Anfrage senden und JSON-Daten abrufen
    response = requests.get(api_url)
    
    # Überprüfen, ob die Anfrage erfolgreich war (Status Code 200)
    if response.status_code == 200:
        # JSON-Daten aus der Antwort extrahieren
        json_data = response.json()
        
        # DataFrame erstellen
        dataframe = pd.DataFrame(json_data)
        
        # DataFrame in eine JSON-Datei speichern (optional)
        dataframe.to_json("output.json", orient="records")
        
        return dataframe
    else:
        # Falls die Anfrage nicht erfolgreich war, eine Fehlermeldung ausgeben
        print(f"Fehler bei der API-Anfrage. Status Code: {response.status_code}")
        return None

# Basis-URL für die API-Anfrage
base_api_url = 'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=VogM4y4rQiI8XWQIAZJMlcqGIqGn53tr&point='

# Pfad zur Datei mit den Koordinaten
file_path = '../resources/stops.txt'

# DataFrame aus der Datei lesen (angepasstes Beispiel, bitte anpassen, wenn nötig)
coordinates_df = pd.read_csv(file_path)  # Hier wird angenommen, dass die Datei tabulatorgetrennt ist

# Iteriere durch die Zeilen des DataFrames und rufe die API für jede Koordinate auf
for index, row in coordinates_df.iterrows():
    latitude = row['stop_lat']
    longitude = row['stop_lon']
    
    # Füge die Koordinaten zur Basis-URL hinzu
    api_endpoint = f"{base_api_url}{latitude},{longitude}"
    
    # Funktion aufrufen und DataFrame erhalten
    result_dataframe = api_to_dataframe(api_endpoint)
    
    # Überprüfen, ob ein DataFrame erstellt wurde
    if result_dataframe is not None:
        # DataFrame anzeigen
        print(result_dataframe)
