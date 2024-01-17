import public_transit_fetch as pt_fetch
import id_translation as transl
import pandas as pd

def remove_non_matching_stop_time_updates(stop_time_updates_df, trips_bsag_df):
    # Inner Join zwischen stop_time_updates_df und trips_bsag_df
    merged_df = pd.merge(stop_time_updates_df, trips_bsag_df, how='inner', left_on='TripId', right_on='trip_id')


    return merged_df


if __name__ == "__main__":
    gtfsr_url = "https://gtfsr.vbn.de/gtfsr_connect.json"
    
    gtfsr_data = pt_fetch.get_gtfsr_data(gtfsr_url)

    stop_time_updates = pt_fetch.extract_stop_time_updates(gtfsr_data)

    stop_time_updates_df = pt_fetch.create_stop_time_updates_df(stop_time_updates)


    result_dataframes = transl.process_gtfs_data()

    # Zugriff auf die DataFrames
    stops_bremen_df = result_dataframes["stops_bremen_df"]
    agency_bsag_df = result_dataframes["agency_bsag_df"]
    routes_bsag_df = result_dataframes["routes_bsag_df"]
    trips_bsag_df = result_dataframes["trips_bsag_df"]
    transfer_bsag_df = result_dataframes["transfer_bsag_df"]


    stop_times_bsag_updates = remove_non_matching_stop_time_updates(stop_time_updates_df, trips_bsag_df)

    stop_times_bsag_updates['Startzeit (Anfanghaltestelle)'] = stop_times_bsag_updates['StartTime']
    stop_times_bsag_updates['Linie'] = stop_times_bsag_updates['route_id'].map(routes_bsag_df.set_index('route_id')['route_short_name'])
    stop_times_bsag_updates['Haltestelle'] = stop_times_bsag_updates['StopId'].map(stops_bremen_df.set_index('stop_id')['stop_name'])
    stop_times_bsag_updates['Richtung'] = stop_times_bsag_updates['trip_headsign']
    stop_times_bsag_updates['Abfahrtsverspaetung in Sek.'] = stop_times_bsag_updates['DepartureDelay']
    stop_times_bsag_updates['Ankunftsverspaetung in Sek.'] = stop_times_bsag_updates['ArrivalDelay']
   
    

    columns_to_remove = ['TripId', 'RouteId', 'trip_id','route_id','ScheduleRelationship', 'StopId', 'ScheduleRelationshipStop', 'DepartureDelay', 'ArrivalDelay', 'trip_id', 'route_id', 'trip_headsign','trip_headsign', 'StartTime']
    stop_times_bsag_updates.drop(columns=columns_to_remove, inplace=True)

    # Reihenfolge der Spalten
    columns_order = ['StartDate', 'Startzeit (Anfanghaltestelle)', 'Linie', 'Richtung', 'Haltestelle', 'StopSequence', 'Ankunftsverspaetung in Sek.', 'Abfahrtsverspaetung in Sek.']

    # DataFrame mit neuer Spaltenreihenfolge erstellen
    stop_times_bsag_updates = stop_times_bsag_updates[columns_order]

    #print(stop_times_bsag_updates.head())

    stop_times_bsag_updates.to_csv("stop_times_bsag_updates.csv", index=False)

    