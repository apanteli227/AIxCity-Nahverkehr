import pandas as pd
import os
import logging


def process_gtfs_data(base_path="src/data_collection/resources"):
    """
    Diese Funktion lädt die GTFS-Textdateien aus dem Ressourcen-Ordner ein
    und erstellt fünf DataFrames.
    
    Parameters:
    - base_path (str): Der Basispfad, in dem sich die GTFS-Textdateien befinden.

    Returns:
    Ein Dictionary mit fünf DataFrames:
    - stops_bremen_df: DataFrame für Haltestellen in Bremen
    - agency_bsag_df: DataFrame für Verkehrsunternehmen BSAG
    - routes_bsag_df: DataFrame für Routen der BSAG
    - trips_bsag_df: DataFrame für Trips der BSAG
    - transfer_bsag_df: DataFrame für Transfers der BSAG
    """

    # Kombiniere das aktuelle Verzeichnis mit dem relativen Pfad
    path = "C:/Users/jan10/PycharmProjects/AIxCity-Nahverkehr/src/backend/data_collection/resources"
    path1 = "/app/data_collection/resources/"
    # Liste mit den Dateinamen der GTFS-Textdateien
    gtfs_files = [
        "stops",
        "routes",
        "trips",
        "agency",
        "transfers"
    ]

    # Erstelle ein Dictionary mit den DataFrames
    gtfs_data = {}
    for file in gtfs_files:
        file_path = os.path.join(path1, f"{file}.txt")

        try:
            gtfs_data[file] = pd.read_csv(file_path, low_memory=False) #Path anpassen
        except FileNotFoundError:
            print(f"Warnung: Datei {file}.txt nicht gefunden.")

    # Zugriff auf DataFrame für Haltestellen im Dictionary
    stops_df = gtfs_data.get("stops")

    # Filtere das DataFrame, um nur Haltestellen-ID, Namen und Geo-Koordinaten zu behalten
    filtered_stops_df = stops_df[["stop_id", "stop_name", "stop_lat", "stop_lon"]]

    # Sonderhaltestellen
    sonder_linie_4 = ["Lilienthal Truperdeich", "Lilienthal Trupe", "Lilienthal Feldhäuser Straße",
                      "Lilienthal Lilienthal-Mitte", "Lilienthal Moorhauser Landstraße", "Lilienthal Timkerweg",
                      "Lilienthal Schoofmoor", "Lilienthal Auf dem Kamp", "Lilienthal Kutscher Behrens", "Lilienthal"]
    sonder_linie_27 = ["Brinkum-Nord Ochtum Park (IKEA)", "Brinkum(Stuhr) IKEA/Marktkauf"]
    sonder_linie_55 = ["Brinkum(Stuhr) Varreler Landstraße", "Brinkum(Stuhr) Moordeicher Landstraße",
                       "Brinkum(Stuhr) Schule Moordeich", "Brinkum(Stuhr) Am Hexendeich", "Brinkum(Stuhr) Hespenstraße",
                       "Brinkum(Stuhr) Zur Windhorst", "Brinkum(Stuhr) Pablo-Picasso-Straße",
                       "Brinkum(Stuhr) Rheinallee", "Brinkum(Stuhr) Moselallee", "Brinkum(Stuhr) Tannenstraße",
                       "Brinkum(Stuhr) Stuhrbaum", "Brinkum(Stuhr) Zeppelinstraße", "Brinkum(Stuhr) Magdeburger Straße",
                       "Brinkum(Stuhr) Am Bahnhof", "Brinkum(Stuhr) Schule Feldstraße", "Brinkum(Stuhr) Marktplatz",
                       "Brinkum(Stuhr) Schule Brunnenweg"]
    sonder_linie_61 = ["Delmenhorst Sandhausen"]
    sonder_linie_90 = ["Neuenkirchen(Schwanewede) Landwehr", "Neuenkirchen(Schwanewede) Marktplatz",
                       "Neuenkirchen(Schwanewede) Ahnten", "Neuenkirchen(Schwanewede) Vorbruch",
                       "Neuenkirchen(Schwanewede) Neuenkirchen(Schwanewede) Heidstraße"]
    sonder_linie_94 = ["Schwanewede Insterburger Weg", "Schwanewede Zum Marktplatz", "Schwanewede Am Markt",
                       "Schwanewede Dreienkamp", "Schwanewede Eichengrund", "Schwanewede Hospitalstraße",
                       "Schwanewede Ostlandstraße", "Schwanewede Molkereiweg", "Schwanewede Rathaus Schwanewede",
                       "Schwanewede Landhaus Schwanewede", "Schwanewede Am Spreeken", "Schwanwede Herderstraße",
                       "Schwanewede Schützenweg"]

    # Kombiniere alle Listen in eine Liste
    all_special_stops = (sonder_linie_4 +
                         sonder_linie_27 +
                         sonder_linie_55 +
                         sonder_linie_61 +
                         sonder_linie_90 +
                         sonder_linie_94)

    # Filtere nach Haltestellen, die in Bremen oder in der kombinierten Liste enthalten sind
    stops_bremen_df = filtered_stops_df[
        filtered_stops_df["stop_name"].str.startswith("Bremen") | filtered_stops_df["stop_name"].isin(
            all_special_stops)]

    # Zugriff auf DataFrame für Verkehrsunternehmen
    agency_df = gtfs_data.get("agency")

    # Filtere das DataFrame um nur die ID und Namen zu behalten
    filtered_agency_df = agency_df[["agency_id", "agency_name"]]

    # Filtern der BSAG (ID ist 326)
    agency_bsag_df = filtered_agency_df[agency_df["agency_id"] == 326]

    # Zugriff auf DataFrame für Routen
    routes_df = gtfs_data.get("routes")

    # Filtere das DataFrame um nur die Routen-ID und Agency-ID zu behalten
    filtered_routes_df = routes_df[["route_id", "agency_id", "route_short_name"]]

    # Filtern der Routen der BSAG (ID ist 326)
    routes_bsag_df = filtered_routes_df[filtered_routes_df["agency_id"] == 326]

    # Zugriff auf DataFrame für Trips
    trips_df = gtfs_data.get("trips")

    # Filtere das DataFrame um nur die Route-ID und Trip-ID zu behalten
    filtered_trips_df = trips_df[["trip_id", "route_id", "trip_headsign"]]

    # Filtern der Trips der BSAG, welche auch eine entsprechende Routen-ID in der Routen-Tabelle besitzen
    trips_bsag_df = filtered_trips_df[filtered_trips_df["route_id"].isin(routes_bsag_df["route_id"])]

    # Zugriff auf DataFrame für Transfers
    transfer_df = gtfs_data.get("transfers")

    # Filtere das DataFrame um nur die From_Stop-ID und To_Stop-ID zu behalten
    filtered_transfer_df = transfer_df[["from_stop_id", "to_stop_id"]]

    # Filtern der Transfers der BSAG, welche auch eine entsprechende Stop-ID in der Stop-Tabelle besitzen
    transfer_bsag_df = filtered_transfer_df[
        filtered_transfer_df["from_stop_id"].isin(stops_bremen_df["stop_id"]) & filtered_transfer_df["to_stop_id"].isin(
            stops_bremen_df["stop_id"])]

    # Rückgabe des Dictionarys mit den DataFrames
    return {
        "stops_bremen_df": stops_bremen_df,
        "agency_bsag_df": agency_bsag_df,
        "routes_bsag_df": routes_bsag_df,
        "trips_bsag_df": trips_bsag_df,
        "transfer_bsag_df": transfer_bsag_df
    }
