import public_transit_fetch as pt_fetch
import id_translation as transl
import pandas as pd
from datetime import datetime, time
import logging


def remove_non_matching_stop_time_updates(stop_time_updates_df, trips_bsag_df):
    """
    Die Funktion entfernt alle StopTime-Einträge, die nicht in der trips_bsag_df enthalten sind.
    Es wird also ein INNER JOIN zwischen den beiden DataFrames durchgeführt. Nur Fahrten die in 
    in der trips_bsag_df enthalten sind, werden behalten.

    Parameters:
    - stop_time_updates_df (DataFrame): DataFrame mit StopTimeUpdates.

    Returns:
    - merged_df (DataFrame): DataFrame mit StopTimeUpdates, die in der trips_bsag_df enthalten sind.
    """
    # Inner Join zwischen stop_time_updates_df und trips_bsag_df
    merged_df = pd.merge(stop_time_updates_df, trips_bsag_df, how='inner', left_on='TripId', right_on='trip_id',
                         validate='many_to_one')
    return merged_df


# Main Funktion
if __name__ == "__main__":

    # Konfiguriere das Logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    logging.info("Starte Prozess zur Ermittlung der GTFS-Realtime Daten...")

    # URL für die Abfrage der GTFS-Realtime Daten
    gtfsr_url = "https://gtfsr.vbn.de/gtfsr_connect.json"

    # Abrufen der GTFS-Realtime Daten
    gtfsr_data = pt_fetch.get_gtfsr_data(gtfsr_url)

    # Extrahieren der StopTimeUpdates
    stop_time_updates = pt_fetch.extract_stop_time_updates(gtfsr_data)

    # Erstellen eines DataFrames aus den StopTimeUpdates
    stop_time_updates_df = pt_fetch.create_stop_time_updates_df(stop_time_updates)

    # Erstellen der DataFrames zum späteren Filtern Bremer Linien und der Übersetzung der IDs
    result_dict_with_dataframes = transl.process_gtfs_data()
    logging.info("GTFS-Textdateien gefunden und VErarbeitungsprozess gestartet...")

    # Zugriff auf die DataFrames
    stops_bremen_df = result_dict_with_dataframes["stops_bremen_df"]
    agency_bsag_df = result_dict_with_dataframes["agency_bsag_df"]
    routes_bsag_df = result_dict_with_dataframes["routes_bsag_df"]
    trips_bsag_df = result_dict_with_dataframes["trips_bsag_df"]
    transfer_bsag_df = result_dict_with_dataframes["transfer_bsag_df"]

    # Entferne alle StopTimeUpdates, die nicht in der trips_bsag_df enthalten sind
    stop_times_bsag_updates = remove_non_matching_stop_time_updates(stop_time_updates_df, trips_bsag_df)

    # Umbenennen der Spalten in verständliche Namen
    stop_times_bsag_updates['Startzeit an der Anfangshaltestelle'] = stop_times_bsag_updates['StartTime']
    stop_times_bsag_updates['Richtung'] = stop_times_bsag_updates['trip_headsign']
    stop_times_bsag_updates['Abfahrtsverspaetung in Sek.'] = stop_times_bsag_updates['DepartureDelay']
    stop_times_bsag_updates['Ankunftsverspaetung in Sek.'] = stop_times_bsag_updates['ArrivalDelay']

    # Übersetzen der IDs zur Route und Haltestelle in lesbare Namen
    stop_times_bsag_updates['Linie'] = stop_times_bsag_updates['route_id'].map(routes_bsag_df.set_index('route_id')['route_short_name'])
    stop_times_bsag_updates['Haltestelle'] = stop_times_bsag_updates['StopId'].map(stops_bremen_df.set_index('stop_id')['stop_name'])
    
    logging.info("Filterungsprozess der GTFS-Realdaten gestartet...")

    # Entfernen der nicht benötigten Spalten
    columns_to_remove = ['TripId', 'RouteId', 'trip_id', 'route_id', 'ScheduleRelationship', 'StopId',
                         'ScheduleRelationshipStop', 'DepartureDelay', 'ArrivalDelay', 'trip_id', 'route_id',
                         'trip_headsign', 'trip_headsign', 'StartTime']
    stop_times_bsag_updates.drop(columns=columns_to_remove, inplace=True)

    # Reihenfolge der Spalten umändern
    columns_order = ['StartDate', 'Startzeit an der Anfangshaltestelle', 'Linie', 'Richtung', 'Haltestelle', 'StopSequence', 'Ankunftsverspaetung in Sek.', 'Abfahrtsverspaetung in Sek.']

    # DataFrame mit neuer Spaltenreihenfolge erstellen
    stop_times_bsag_updates = stop_times_bsag_updates[columns_order]

    # Ermittel das aktuelle Datum und die Uhrzeit
    actual_datetime = datetime.now()

    # Formatierung der Ausgabe für Datum und Uhrzeit separat
    actual_date_str = actual_datetime.strftime("%Y-%m-%d")
    actual_time_str = actual_datetime.strftime("%H:%M:%S")

    # Sicherstellen, dass 'StartDate' eine Spalte mit Datum-Strings und 'Startzeit an der Anfangshaltestelle' eine Spalte mit Zeit-Strings ist
    stop_times_bsag_updates['StartDate'] = pd.to_datetime(stop_times_bsag_updates['StartDate']).dt.strftime("%Y-%m-%d")
    stop_times_bsag_updates['Startzeit an der Anfangshaltestelle'] = pd.to_datetime(stop_times_bsag_updates['Startzeit an der Anfangshaltestelle'], format='%H:%M:%S').dt.strftime("%H:%M:%S")

    
    # Entferne alle Zeilen, deren Uhrzeit oder Datum in der Zukunft liegt
    stop_times_bsag_updates = stop_times_bsag_updates[
        ((stop_times_bsag_updates['StartDate'] <= actual_date_str) &
        (stop_times_bsag_updates['Startzeit an der Anfangshaltestelle'] <= actual_time_str))
        | ((stop_times_bsag_updates['StartDate'] < actual_date_str) &
        (stop_times_bsag_updates['Startzeit an der Anfangshaltestelle'] >= actual_time_str))
    ]
    
    logging.info("Prozess zur Ermittlung der GTFS-Realtime Daten abgeschlossen. Datei wurde generiert!")
    
    # Optional: Speichern des DataFrames als CSV-Datei
    stop_times_bsag_updates.to_csv("stop_times_bsag_updates.csv", index=False)
