import asyncio
import logging
import time

import schedule

from data_collection.events.events_data_fetch import get_events_dataframe
from data_collection.public_transit.public_transit_data_cleaner import get_public_transit_dataframe
from data_collection.traffic.traffic_data_cleaner import get_traffic_dataframe
from data_collection.weather.weather_data_fetch import get_weather_dataframe
from persistence import database_controller as dbc


def save_transit_data(stop_times_bsag_updates):
    print(stop_times_bsag_updates)
    # Daten hochladen
    logging.info("Verspätungsdaten herunterladen...")
    time.sleep(60)
    # single_inserts(stop_times_bsag_updates, 'public.bsag_data')
    """Perform single inserts of the dataframe into the PostGIS table"""
    conn = dbc.connect(dbc.param_dic)
    logging.info("======[" + "public.bsag_data" + "]======")
    logging.info("conn: " + conn.dsn)
    logging.info("======[" + "public.bsag_data" + "]======")
    for i in stop_times_bsag_updates.index:
        vals = [stop_times_bsag_updates.at[i, col] for col in list(stop_times_bsag_updates.columns)]
        query = """INSERT INTO public.bsag_data (start_date,current_time,daytime,weekday,holiday,starting_stop_time,line,number_of_stops,direction,number_of_building_sites,stop,stop_sequence,arrival_delay_sec,departure_delay_sec)
                       VALUES ('%s', '%s', '%s', '%s', '%s', %s, %s, %s, '%s', '%s', '%s', '%s');""" % (
            vals[0],
            vals[1],
            vals[2],
            vals[3],
            vals[4],
            vals[5],
            vals[6],
            vals[7],
            vals[8],
            vals[9],
            vals[10],
            vals[11],
        )
        dbc.execute_query(conn, query)
        # print("execute_query: " + query)
    dbc.disconnect(conn)


def save_traffic_data(traffic_data_bsag_updates):
    print(traffic_data_bsag_updates)
    # Daten hochladen
    logging.info("Verkehrsdaten herunterladen...")
    time.sleep(60)
    # single_inserts(traffic_data_bsag_updates, 'public.traffic_data')
    """Perform single inserts of the dataframe into the PostGIS table"""
    conn = dbc.connect(dbc.param_dic)
    logging.info("======[" + "public.traffic_data" + "]======")
    logging.info("conn: " + conn.dsn)
    logging.info("======[" + "public.traffic_data" + "]======")
    for i in traffic_data_bsag_updates.index:
        vals = [traffic_data_bsag_updates.at[i, col] for col in list(traffic_data_bsag_updates.columns)]
        query = """INSERT INTO public.traffic_data (stop_name,stop_lat,stop_lon,current_time,current_date,daytime,current_speed,freeflow_Speed,average_traffic_load_percentage)
                       VALUES ('%s', '%s', '%s', '%s', '%s', %s);""" % (
            vals[0],
            vals[1],
            vals[2],
            vals[3],
            vals[4],
            vals[5]
        )
        dbc.execute_query(conn, query)
        # print("execute_query: " + query)
    dbc.disconnect(conn)


def save_events_data(events_bsag_updates_df):
    conn = dbc.connect(dbc.param_dic)
    for i in events_bsag_updates_df.index:
        vals = [events_bsag_updates_df.at[i, col] for col in list(events_bsag_updates_df.columns)]
        query = """INSERT INTO public.events_data (
                            begin_date,begin_time,end_date,end_time,event_type,event_classification) 
                            VALUES ('%s', '%s', '%s', '%s', '%s', %s);""" % (
            vals[0],
            vals[1],
            vals[2],
            vals[3],
            vals[4],
            vals[5]
        )
        dbc.execute_query(conn, query)
        print("execute_query: " + query)
    dbc.disconnect(conn)


def save_weather_data(dataframe):
    return dataframe


async def run_task_with_interval(task_function, interval_seconds):
    while True:
        await task_function()
        await asyncio.sleep(interval_seconds)


async def run_transit_task():
    await save_transit_data(get_public_transit_dataframe("https://gtfsr.vbn.de/gtfsr_connect.json"))


async def run_traffic_task():
    await save_traffic_data(get_traffic_dataframe(
        "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key"
        "=VogM4y4rQiI8XWQIAZJMlcqGIqGn53tr&point="))


async def run_events_task():
    await save_events_data(get_events_dataframe())


async def run_weather_task():
    await save_weather_data(
        get_weather_dataframe("http://api.openweathermap.org/data/2.5/weather", "131b00cd42bee49451a4c69d496797e1",
                              "Bremen"))


async def run_traffic_task_at_specific_times():
    schedule.every().day.at("08:00").do(run_traffic_task)
    schedule.every().day.at("12:00").do(run_traffic_task)
    schedule.every().day.at("16:00").do(run_traffic_task)
    schedule.every().day.at("20:00").do(run_traffic_task)

    while True:
        schedule.run_pending()
        await asyncio.sleep(1)


async def main():
    tasks = [
        asyncio.create_task(run_task_with_interval(run_transit_task, 60)),
        asyncio.create_task(run_task_with_interval(run_events_task, 86400)),  # 86400 seconds = 24 hours
        asyncio.create_task(run_task_with_interval(run_weather_task, 3600)),  # 3600 seconds = 1 hour
        asyncio.create_task(run_traffic_task_at_specific_times())
    ]

    await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())
