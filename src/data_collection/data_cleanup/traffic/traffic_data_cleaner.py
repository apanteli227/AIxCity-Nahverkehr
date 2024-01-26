import os
import requests
import pandas as pd
import sys
sys.path.append('../')
from public_transit import public_transit_fetch as pt_fetch

def main(stop_times_bsag_updates):

    #Entferne alle Spalten außer die Spalte "Haltestelle"
    stop_times_bsag_updates = stop_times_bsag_updates.drop(columns=["StartDate","Startzeit an der Anfangshaltestelle","Linie","Richtung","StopSequence","Ankunftsverspaetung in Sek.","Abfahrtsverspaetung in Sek."])

    # Basis-URL für die API-Anfrage
    base_api_url = 'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=VogM4y4rQiI8XWQIAZJMlcqGIqGn53tr&point='

    # Kombiniere das aktuelle Verzeichnis mit dem relativen Pfad
    full_path = os.path.join(os.path.dirname(__file__), "../resources")

    # Pfad zur Datei stops.txt mit den Haltestellenkoordinaten
    file_path = os.path.join(full_path, "stops.txt")

    # Pfad zur Datei not_used_stops.txt mit den Haltestellen, die nicht relevant für den Verkehr sind
    not_used_stops = os.path.join(full_path, "not_used_stops.csv")

    # DataFrame aus der Datei stops.txt erstellen
    coordinates_df = pd.read_csv(file_path)

    # DataFrame aus der Datei not_used_stops.txt erstellen
    not_used_stops_df = pd.read_csv(not_used_stops)

    # Führe einen Inner Join zwischen stops.txt und stop_times_bsag_updates durch. Join auf die Spalte "Haltestelle" und "stop_name"
    coordinates_df = pd.merge(coordinates_df, stop_times_bsag_updates, left_on="stop_name", right_on="Haltestelle", how="inner")
    
    # Aus DataFrame alle Spalten löschen außer der stop_name, stop_lat und stop_lon
    coordinates_df = coordinates_df.drop(columns=["stop_id","stop_code","stop_desc","location_type","parent_station","wheelchair_boarding","platform_code","zone_id"])

    # Duplikate aus dem DataFrame in stop_names entfernen
    coordinates_df = coordinates_df.drop_duplicates(subset=["stop_name"])

    # Entferne alle Haltestellen aus coordinates_df, die in der Spalte "Nicht relevante Haltestellen" in not_used_stops_df vorkommen
    coordinates_df = coordinates_df[~coordinates_df.stop_name.isin(not_used_stops_df["Nicht relevante Haltestellen"])]

    coordinates_df.to_csv("coordinates_df.csv", index=False)
    """
    # Iteriere durch die Zeilen des DataFrames und rufe die API für jede Koordinate auf
    for index, row in coordinates_df.iterrows():
        latitude = row['stop_lat']
        longitude = row['stop_lon']
        
        # Füge die Koordinaten zur Basis-URL hinzu
        #api_endpoint = f"{base_api_url}{latitude},{longitude}"
        
        # Funktion aufrufen und DataFrame erhalten
        #result_dataframe = api_to_dataframe(api_endpoint)
        
        # Überprüfen, ob ein DataFrame erstellt wurde
        #if result_dataframe is not None:
            # DataFrame anzeigen
         #   print(result_dataframe)
        """