import logging
from datetime import datetime
import pandas as pd
from ..public_transit import id_translation as transl
from ..public_transit import public_transit_data_fetch as pt_fetch


def get_public_transit_dataframe(gtfsr_url: str) -> pd.DataFrame:
    """
    Diese Funktion ruft die GTFS-Realtime-Daten (Verspätungsdaten) ab,
    und bereitet diese durch unterschiedliche Unterfunktionen, Hilfsdateien 
    und Filterungsprozessen auf. Das Ergebnis ist ein DataFrame, welche alle relevanten 
    Attribute zu einer Verspätung einer Linie enthält und welche direkt in eine entsprechende
    Datenbank gespeichert werden kann.

    Parameters:
    - gtfsr_url (str): URL zum Abruf der GTFSR-Daten auf der VBN-Website.

    Returns:
    - stop_times_bsag_updates (DataFrame): DataFrame mit den Verspätungsdaten und relevanten Attributen.
    """
    # Konfiguriere das Logging
    CORANGE = '\033[33m'
    CEND = '\033[0m'
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    logging.info(CORANGE + "[TRANSIT] " + CEND + "Starte Prozess zur Ermittlung der GTFS-Realtime Daten...")

    # Abrufen der GTFS-Realtime Daten
    gtfsr_data = pt_fetch.get_gtfsr_data(gtfsr_url)

    # Extrahieren der StopTimeUpdates
    stop_time_updates = pt_fetch.extract_stop_time_updates(gtfsr_data)

    # Erstellen eines DataFrames aus den StopTimeUpdates
    stop_time_updates_df = pt_fetch.create_stop_time_updates_df(stop_time_updates)

    # Erstellen der DataFrames zum späteren Filtern Bremer Linien und der Übersetzung der IDs
    result_dict_with_dataframes = transl.process_gtfs_data()
    #logging.info("GTFS-Textdateien gefunden und Verarbeitungsprozess gestartet...")

    # Zugriff auf die benötigten DataFrames
    stops_bremen_df = result_dict_with_dataframes["stops_bremen_df"]
    routes_bsag_df = result_dict_with_dataframes["routes_bsag_df"]
    trips_bsag_df = result_dict_with_dataframes["trips_bsag_df"]

    # Entferne alle StopTimeUpdates, die nicht in der trips_bsag_df enthalten sind
    stop_times_bsag_updates = remove_non_matching_stop_time_updates(stop_time_updates_df, trips_bsag_df)

    # Datei mit Anzahl der Haltestellen pro Linie einlesen
    relevant_routes_stops_bsag = pd.read_csv("data_collection/resources/relevant_routes_stops_bsag.csv", delimiter=';')

    # Datei mit den Feiertagen einlesen
    holidays_bremen_df = pd.read_csv("data_collection/resources/holidays.csv", delimiter=';')

    # Anpassen der Angabe des Feiertages als Integer und Umbennnenung zu holiday
    holidays_bremen_df["holiday"] = holidays_bremen_df["Feiertag"].astype(int)

    # Anpassen der Datumsformat der Spalte Datum_Feiertag in holidays_bremen_df
    holidays_bremen_df["holiday_date"] = pd.to_datetime(holidays_bremen_df["Datum_Feiertag"],
                                                          format="%d.%m.%Y").dt.strftime("%Y-%m-%d")

    # Merge von stop_times_bsag_updates und relevant_routes_stops_bsag, um die Anzahl der Haltestellen zu erhalten
    stop_times_bsag_updates = pd.merge(stop_times_bsag_updates, relevant_routes_stops_bsag, how='inner',
                                       left_on='route_id', right_on='route_id', validate='many_to_one')

    # Anpassen des Datumsformats der Spalte StartDate in stop_times_bsag_uodates
    stop_times_bsag_updates["start_date"] = pd.to_datetime(stop_times_bsag_updates["StartDate"]).dt.strftime("%Y-%m-%d")

    # Merge von stop_times_bsag_updates und holidays_bremen_df, um die Feiertage zu erhalten
    stop_times_bsag_updates = pd.merge(stop_times_bsag_updates, holidays_bremen_df, how='left', left_on='start_date',
                                       right_on='holiday_date', validate='many_to_one')
    
    # Umbenennen der Spalten in verständliche Namen
    stop_times_bsag_updates["starting_stop_time"] = stop_times_bsag_updates['StartTime']
    stop_times_bsag_updates["direction"] = stop_times_bsag_updates['trip_headsign']
    stop_times_bsag_updates["departure_delay_sec"] = stop_times_bsag_updates['DepartureDelay']
    stop_times_bsag_updates["arrival_delay_sec"] = stop_times_bsag_updates['ArrivalDelay']
    stop_times_bsag_updates["number_of_stops"] = stop_times_bsag_updates['number_stops']
    stop_times_bsag_updates["number_of_building_sites"] = stop_times_bsag_updates['number_building_sites']
    stop_times_bsag_updates["stop_sequence"] = stop_times_bsag_updates['StopSequence']

    # Wandle die Spalte Anzahl an Baustellen und Anzahl an Haltestellen in Integer um
    stop_times_bsag_updates["number_of_stops"] = stop_times_bsag_updates["number_of_stops"].fillna(0).astype(int)
    stop_times_bsag_updates["number_of_building_sites"] = stop_times_bsag_updates["number_of_building_sites"].fillna(0).astype(int)

    # Fehlende Werte in stop_sequence mit 0 ersetzen und Werte in int umwandeln
    stop_times_bsag_updates["stop_sequence"] = stop_times_bsag_updates["stop_sequence"].fillna(0).astype(int)

    # Wandle die Werte in Spalte arrival_delay_sec und departure_delay_sec in 1 um, enn Wert größer als 60 ist, sonst in 0 umwandeln (Klassifikation)
    stop_times_bsag_updates["arrival_delay_sec"] = stop_times_bsag_updates["arrival_delay_sec"].apply(lambda x: 1 if x >= 60 else 0)
    stop_times_bsag_updates["departure_delay_sec"] = stop_times_bsag_updates["departure_delay_sec"].apply(lambda x: 1 if x >= 60 else 0)

    # Aktuelle Uhrzeit
    stop_times_bsag_updates["current_time"] = datetime.now().time().strftime("%H:%M:%S")

    # Aktueller Wochentag
    stop_times_bsag_updates["weekday"] = datetime.now().strftime("%A")

    # Konvertiere die Spalte 'current_time' in ein datetime-Format zur Bestimmung der Tageszeit
    stop_times_bsag_updates['current_time_for_daytime'] = pd.to_datetime(stop_times_bsag_updates['current_time'], format='%H:%M:%S')

    # Füge die Spalte 'daytime' hinzu (Tageszeit)
    stop_times_bsag_updates['daytime'] = stop_times_bsag_updates['current_time_for_daytime'].dt.hour.apply(map_daytime)

    # Übersetzen der IDs zur Route und Haltestelle in lesbare Namen
    stop_times_bsag_updates["line"] = stop_times_bsag_updates['route_id'].map(
        routes_bsag_df.set_index('route_id')['route_short_name'])
    stop_times_bsag_updates["stop"] = stop_times_bsag_updates['StopId'].map(
        stops_bremen_df.set_index('stop_id')['stop_name'])

    #logging.info("Filterungsprozess der GTFS-Realdaten gestartet...")

    # Entfernen der nicht benötigten Spalten
    columns_to_remove = ['TripId', 'RouteId', 'trip_id', 'route_id', 'ScheduleRelationship', 'StopId',
                         'ScheduleRelationshipStop', 'DepartureDelay', 'ArrivalDelay', 'trip_id', 'route_id',
                         'trip_headsign', 'trip_headsign', 'StartTime', 'Datum_Feiertag', 'current_time_for_daytime']
    stop_times_bsag_updates.drop(columns=columns_to_remove, inplace=True)

    # Reihenfolge der Spalten umändern
    columns_order = ['start_date', 'current_time', 'daytime', 'weekday', 'holiday', 'starting_stop_time',
                     'line', 'number_of_stops', 'direction', 'number_of_building_sites', 'stop', 'stop_sequence',
                     'arrival_delay_sec', 'departure_delay_sec']

    # DataFrame mit neuer Spaltenreihenfolge erstellen
    stop_times_bsag_updates = stop_times_bsag_updates[columns_order]

    # Ermittel das aktuelle Datum und die Uhrzeit
    actual_datetime = datetime.now()

    # Formatierung der Ausgabe für Datum und Uhrzeit separat
    actual_date_str = actual_datetime.strftime("%Y-%m-%d")
    actual_time_str = actual_datetime.strftime("%H:%M:%S")

    # Sicherstellen, dass 'StartDate' eine Spalte mit Datum-Strings und 'Startzeit an der Anfangshaltestelle' eine
    # Spalte mit Zeit-Strings ist
    stop_times_bsag_updates["starting_stop_time"] = pd.to_datetime(
        stop_times_bsag_updates["starting_stop_time"], format='%H:%M:%S').dt.strftime("%H:%M:%S")

    # Entferne alle Zeilen, deren Uhrzeit oder Datum in der Zukunft liegt
    stop_times_bsag_updates = stop_times_bsag_updates[
        ((stop_times_bsag_updates["start_date"] <= actual_date_str) &
         (stop_times_bsag_updates["starting_stop_time"] <= actual_time_str))
        | ((stop_times_bsag_updates["start_date"] < actual_date_str) &
           (stop_times_bsag_updates["starting_stop_time"] >= actual_time_str))
        ]
    logging.info(CORANGE + "[TRANSIT] " + CEND + "Daten erfolgreich ermittelt!")

    # Optional: Speichern des DataFrames als CSV-Datei
    #stop_times_bsag_updates.to_csv("stop_times_bsag_updates.csv", index=False)
    return stop_times_bsag_updates


def remove_non_matching_stop_time_updates(stop_time_updates_df, trips_bsag_df):
    """
    Die Funktion entfernt alle StopTime-Einträge, die nicht in der trips_bsag_df enthalten sind.
    Es wird also ein INNER JOIN zwischen den beiden DataFrames durchgeführt. Nur Fahrten die
    in der trips_bsag_df enthalten sind, werden behalten.

    Parameters:
    - stop_time_updates_df (DataFrame): DataFrame mit StopTimeUpdates.

    Returns:
    - merged_df (DataFrame): DataFrame mit StopTimeUpdates, die in der trips_bsag_df enthalten sind.
    """
    # Inner Join zwischen stop_time_updates_df und trips_bsag_df
    merged_df = pd.merge(stop_time_updates_df, trips_bsag_df, how='inner', left_on='TripId', right_on='trip_id', validate='many_to_many')
    return merged_df

def map_daytime(hour):
    """
    Diese Funktion ordnet die aktuelle Uhrzeit einer Tageszeit zu.
    
    Parameters:
    - hour (int): Stunde der aktuellen Uhrzeit.

    Returns:
    - daytime (str): Tageszeit.
    """
    if 6 <= hour < 10:
        return "morning"
    elif 10 <= hour < 12:
        return "forenoon"
    elif 12 <= hour < 14:
        return "noon"
    elif 14 <= hour < 17:
        return "afternoon"
    elif 17 <= hour < 21:
        return "evening"
    else:
        return 'night'
