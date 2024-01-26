import os
import requests
import pandas as pd
import public_transit.public_transit_fetch as pt_fetch

def main(stop_times_bsag_updates):

    #Entferne alle Spalten außer die Spalte "Haltestelle"
    stop_times_bsag_updates = stop_times_bsag_updates.drop(columns=["StartDate","Startzeit an der Anfangshaltestelle","Linie","Richtung","StopSequence","Ankunftsverspaetung in Sek.","Abfahrtsverspaetung in Sek."])

    # Basis-URL für die API-Anfrage
    base_api_url = 'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=VogM4y4rQiI8XWQIAZJMlcqGIqGn53tr&point='

    # Kombiniere das aktuelle Verzeichnis mit dem relativen Pfad
    full_path = os.path.join(os.path.dirname(__file__), "../resources")

    # Pfad zur Datei mit den Koordinaten
    file_path = os.path.join(full_path, "stops.txt")

    # DataFrame aus der Datei lesen (angepasstes Beispiel, bitte anpassen, wenn nötig)
    coordinates_df = pd.read_csv(file_path)

    # Führe einen Inner Join zwischen stops.txt und stop_times_bsag_updates durch. Join auf die Spalte "Haltestelle" und "stop_name"
    coordinates_df = pd.merge(coordinates_df, stop_times_bsag_updates, left_on="stop_name", right_on="Haltestelle", how="inner")

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
