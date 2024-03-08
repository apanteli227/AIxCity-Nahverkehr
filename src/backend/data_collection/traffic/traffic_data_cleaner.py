import logging
import os
import pandas as pd
from datetime import datetime
from ..traffic import traffic_data_fetch as td_fetch
from ..public_transit import public_transit_data_cleaner as pt_cleaner


def get_traffic_dataframe(base_api_url) -> pd.DataFrame:
    """
    Diese Funktion ruft die Verkehrsdaten ab und bereitet diese durch 
    unterschiedliche Hilfsdateien auf. Das Ergebnis ist ein DataFrame,
    welches relevanten Verkehrsdaten in Nähe von Haltestellen enthält.
    Dieses DataFrame kann direkt in eine entsprechende Datenbank gespeichert werden.

    Parameters:
    - base_api_url (str): Basis-URL zur Abfrage der Verkehrsdaten.

    Returns:
    - traffic_data_bsag_updates (DataFrame): DataFrame mit den Verkehrsdaten und relevanten Attributen.
    """
    logging.info("Starte Prozess zur Ermittlung der Verkehrsdaten...")

    # Kombiniere das aktuelle Verzeichnis mit dem relativen Pfad
    full_path = os.path.join(os.path.dirname(__file__), "../resources")

    # Pfad zur Datei stops.txt mit den Haltestellenkoordinaten
    file_path = os.path.join(full_path, "stops.txt")

    # Pfad zur Datei stops_bremen.csv mit den Haltestellen in Bremen
    stops_bremen = os.path.join(full_path, "stops_bremen.csv")

    # Pfad zur Datei not_used_stops.txt mit den Haltestellen, die nicht relevant für den Verkehr sind
    not_used_stops = os.path.join(full_path, "not_used_stops.csv")

    # DataFrame aus der Datei stops_bremen.csv erstellen
    stops_bremen_df = pd.read_csv(stops_bremen)

    # DataFrame aus der Datei stops.txt erstellen
    coordinates_df = pd.read_csv(file_path)

    # DataFrame aus der Datei not_used_stops.txt erstellen
    not_used_stops_df = pd.read_csv(not_used_stops)

    # Führe einen Inner Join zwischen stops.txt und stop_times_bsag_updates durch. Join auf die Spalte "Haltestelle"
    # und "stop_name"
    coordinates_df = pd.merge(coordinates_df, stops_bremen_df, left_on="stop_name", right_on="stop_name",
                              how="inner")

    # Aus DataFrame alle Spalten löschen außer der stop_name, stop_lat und stop_lon
    coordinates_df = coordinates_df.drop(
        columns=["stop_id_x","stop_code", "stop_desc", "location_type", "parent_station", "wheelchair_boarding",
                 "platform_code", "zone_id", "stop_id_y", "stop_lat_y", "stop_lon_y",])
    
    # Spalte stop_id_x in stop_id, stop_lat_x in stop_lat und stop_lon_x in stop_lon umbenennen
    coordinates_df = coordinates_df.rename(columns={"stop_id_x": "stop_id", "stop_lat_x": "stop_lat", "stop_lon_x": "stop_lon"})

    # Duplikate aus dem DataFrame in stop_names entfernen
    coordinates_df = coordinates_df.drop_duplicates(subset=["stop_name"])

    # Entferne alle Haltestellen aus coordinates_df, die in der Spalte "Nicht relevante Haltestellen" in
    # not_used_stops_df vorkommen
    traffic_data_bsag_updates = coordinates_df[~coordinates_df.stop_name.isin(not_used_stops_df["Nicht relevante Haltestellen"])]

    # Ignoriere alle SettingWithCopyWarnings
    pd.set_option('mode.chained_assignment', None)

    # Aktuelle Uhrzeit
    traffic_data_bsag_updates["current_time"] = datetime.now().time().strftime("%H:%M:%S")

    # Aktuelles Datum
    traffic_data_bsag_updates["current_date"] = datetime.now().date().strftime("%Y-%m-%d")

    # Konvertiere die Spalte 'current_time' in ein datetime-Format zur Bestimmung der Tageszeit
    traffic_data_bsag_updates['current_time_for_daytime'] = pd.to_datetime(traffic_data_bsag_updates['current_time'], format='%H:%M:%S')

    # Füge die Spalte 'daytime' hinzu (Tageszeit)
    traffic_data_bsag_updates['daytime'] = traffic_data_bsag_updates['current_time_for_daytime'].dt.hour.apply(pt_cleaner.map_daytime)

    # Entferne die Spalte 'current_time_for_daytime'
    traffic_data_bsag_updates.drop(columns=["current_time_for_daytime"], inplace=True)

    logging.info("Relevante Haltestellen wurden für die Verkehrsdaten ermittelt.")
    logging.info("Starte nun Prozess zur Ermittlung der Verkehrsdaten an den jeweiligen Haltestellen...")
    logging.info("Dieser Prozess kann bis zu 10 Minuten dauern...")

    # Iteriere durch die Zeilen des DataFrames und rufe die API für jede Koordinate auf
    for index, row in traffic_data_bsag_updates.iterrows():
        latitude = row['stop_lat']
        longitude = row['stop_lon']

        # Füge die Koordinaten zur Basis-URL hinzu
        api_endpoint = f"{base_api_url}{latitude},{longitude}"

        # Funktion aufrufen und DataFrame erhalten
        result_dataframe = td_fetch.get_traffic_dataframe(api_endpoint)

        # Aus DataFrame currentSpeed und freeFlowSpeed entnehmen
        current_speed = result_dataframe["flowSegmentData"]["currentSpeed"]
        free_flow_speed = result_dataframe["flowSegmentData"]["freeFlowSpeed"]

        # In coordinates_df die Spalten currentSpeed und freeFlowSpeed sowie den ermittelten Wert für aktuelle
        # Koordianten eintragen
        traffic_data_bsag_updates.loc[index, "current_speed"] = current_speed
        traffic_data_bsag_updates.loc[index, "freeflow_Speed"] = free_flow_speed

        # Neue Spalte "Verkehrsauslastung" erstellen und Verkehrsauslastung berechnen
        traffic_data_bsag_updates.loc[index, "average_traffic_load_percentage"] = abs(
            ((traffic_data_bsag_updates.loc[index, "current_speed"] / traffic_data_bsag_updates.loc[index, "freeflow_Speed"]) - 1).round(4))*100

        # Gebe mir die aktuelle Zeile aus (Zur Übersicht über Zwischenstand)
        print(traffic_data_bsag_updates.loc[index])

    # Setze das Optionssystem zurück
    pd.reset_option('mode.chained_assignment')       

    logging.info("Verkehrsdaten wurden ermittelt.")

    # Speichere das DataFrame in eine CSV-Datei
    #traffic_data_bsag_updates.to_csv("traffic_data_bsag_updates.csv", index=False)
    return traffic_data_bsag_updates
