import asyncio
import logging
import multiprocessing
import subprocess
import threading
import time

import schedule

from data_collection.events.events_data_fetch import get_events_dataframe
from data_collection.public_transit.public_transit_data_cleaner import get_public_transit_dataframe
from data_collection.traffic.traffic_data_cleaner import get_traffic_dataframe
from data_collection.weather.weather_data_fetch import get_weather_dataframe
from persistence import database_controller as dbc

lock = threading.Lock


def save_transit_data(stop_times_bsag_updates):
    # print(stop_times_bsag_updates)
    # Daten hochladen
    prefix = '\033[33m' + "[TRANSIT] " + '\033[0m'
    logging.info(prefix + f"Daten ({len(stop_times_bsag_updates.index)}) hochladen...")
    """Perform single inserts of the dataframe into the PostGIS table"""
    tic = time.perf_counter()
    conn = dbc.connect(dbc.param_dic)
    max = 0
    for i in stop_times_bsag_updates.index:
        vals = [stop_times_bsag_updates.at[i, col] for col in list(stop_times_bsag_updates.columns)]
        query = """INSERT INTO public.bsag_data (current_date,"current_time","daytime",daytime_class,dayhour,dayquarter,weekday,is_workingday,is_holiday,starting_stop_time,"line",number_of_stops,direction,StopId,stop,stop_sequence,arrival_delay_category,departure_delay_category,arrival_delay_seconds,departure_delay_seconds)
                                    VALUES ('%s', '%s', '%s',%s ,%s ,%s,'%s',%s ,%s, '%s', '%s', %s, '%s', %s,'%s', '%s', '%s', '%s', '%s', '%s');""" % (
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
            vals[12],
            vals[13],
            vals[14],
            vals[15],
            vals[16],
            vals[17],
            vals[18],
            vals[19]
        )
        dbc.execute_query(conn, query)
        max = i
        # print("execute_query: " + query)
    dbc.disconnect(conn)
    toc = time.perf_counter()
    print(prefix + f"Verspätungsdaten ({max}) erfolgreich in {toc - tic:0.2f} Sekunden hochgeladen...")


def save_traffic_data(traffic_data_bsag_updates):
    prefix = '\033[031m' + "[TRAFFIC] " + '\033[0m'
    if traffic_data_bsag_updates is None:
        logging.warning(prefix + "Traffic data is None. Skipping save_traffic_data.")
        return

    # Daten hochladen
    logging.info(prefix + f"Daten ({len(traffic_data_bsag_updates.index)}) hochladen...")
    # single_inserts(traffic_data_bsag_updates, 'public.traffic_data')
    """Perform single inserts of the dataframe into the PostGIS table"""
    tic = time.perf_counter()
    conn = dbc.connect(dbc.param_dic)
    max = 0
    for i in traffic_data_bsag_updates.index:
        vals = [traffic_data_bsag_updates.at[i, col] for col in list(traffic_data_bsag_updates.columns)]
        query = """INSERT INTO public.traffic_data (stop_name,stop_lat,stop_lon,"current_time","current_date",daytime,dayhour,dayquarter"current_speed","freeflow_Speed","quotient_current_freeflow_speed")
                       VALUES ('%s', %s, %s, '%s', '%s', '%s', %s, %s ,'%s', '%s', '%s');""" % (
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
            vals[10]
        )
        dbc.execute_query(conn, query)
        # print("execute_query: " + query)
        max = i
    dbc.disconnect(conn)
    toc = time.perf_counter()
    print(prefix + f"Daten ({max}) erfolgreich in {toc - tic:0.2f} Sekunden hochgeladen...")


def save_events_data(events_bsag_updates_df):
    prefix = '\033[32m' + "[EVENTS] " + '\033[0m'
    logging.info(prefix + f"Daten ({len(events_bsag_updates_df.index)}) hochladen...")
    tic = time.perf_counter()
    conn = dbc.connect(dbc.param_dic)
    max = 0
    for i in events_bsag_updates_df.index:
        vals = [events_bsag_updates_df.at[i, col] for col in list(events_bsag_updates_df.columns)]
        query = """INSERT INTO public.events_data (begin_date,begin_time,end_date,end_time,event_type,event_classification,frequently_visited_stop,stop_id,current_time,current_date) 
                            VALUES ('%s', '%s', '%s', '%s', '%s', %s, '%s', '%s', '%s', '%s');""" % (
            vals[0],
            vals[1],
            vals[2],
            vals[3],
            vals[4],
            vals[5],
            vals[6],
            vals[7],
            vals[8],
            vals[9]
        )
        dbc.execute_query(conn, query)
        # print("execute_query: " + query)
        max = i
    dbc.disconnect(conn)
    toc = time.perf_counter()
    print(prefix + f"Daten ({max}) erfolgreich in {toc - tic:0.2f} Sekunden hochgeladen...")


def save_weather_data(weather_bremen_df):
    prefix = '\033[36m' + "[WEATHER] " + '\033[0m'
    logging.info(prefix + f"Daten ({len(weather_bremen_df.index)}) hochladen...")
    tic = time.perf_counter()
    conn = dbc.connect(dbc.param_dic)
    max = 0
    for i in weather_bremen_df.index:
        vals = [weather_bremen_df.at[i, col] for col in list(weather_bremen_df.columns)]
        query = """INSERT INTO public.weather_data (city,current_date,current_time,daytime,temperature_celsius,humidity_percentage,weather_description,wind_speed_m_s,weather_warning) 
                            VALUES ('%s', '%s', '%s', %s ,%s, %s, '%s', %s, '%s');""" % (
            vals[0],
            vals[1],
            vals[2],
            vals[3],
            vals[4],
            vals[5],
            vals[6],
            vals[7],
            vals[8]
        )
        dbc.execute_query(conn, query)
        # print("execute_query: " + query)
        max = i
    dbc.disconnect(conn)
    toc = time.perf_counter()
    print(prefix + f"Daten ({max}) erfolgreich in {toc - tic:0.2f} Sekunden hochgeladen...")


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
    # Alle Viertelstunde die Verkehrsdaten aktualisieren
    schedule.every(15).minutes.do(run_traffic_task)

    # !!!!Sollte obige Anpassung stimmen, bitte diese 4 Befehle entfernen!!!!!
    #schedule.every().day.at("08:00").do(run_traffic_task)
    #schedule.every().day.at("12:00").do(run_traffic_task)
    #schedule.every().day.at("16:00").do(run_traffic_task)
    #schedule.every().day.at("20:00").do(run_traffic_task)

    while True:
        schedule.run_pending()
        await asyncio.sleep(1)


async def main():
    tasks = [
        asyncio.create_task(run_task_with_interval(run_transit_task, 600)),
        #asyncio.create_task(run_task_with_interval(run_events_task, 86400)),  # 86400 seconds = 24 hours
        #asyncio.create_task(run_task_with_interval(run_weather_task, 3600)),  # 3600 seconds = 1 hour
        #asyncio.create_task(run_task_with_interval(run_traffic_task, 900)), # 900 seconds = 15 minutes

        #!!!!Entfernen wenn dies nicht mehr benötigt wird!!!!
        #asyncio.create_task(run_task_with_interval(run_traffic_task, 3600)),  # 3600 seconds = 1 hour
    ]

    await asyncio.gather(*tasks)


def run_fastapi():
    # Run FastAPI application with Uvicorn
    subprocess.run(["uvicorn", "rest_controller:app", "--host", "134.102.23.195", "--port", "8079"])


def run_data_collection():
    asyncio.run(main())


if __name__ == "__main__":
    # Create separate processes for running FastAPI and another script
    fastapi_process = multiprocessing.Process(target=run_fastapi)
    other_script_process = multiprocessing.Process(target=run_data_collection)

    # Start both processes
    fastapi_process.start()
    other_script_process.start()

    # Wait for both processes to finish
    fastapi_process.join()
    other_script_process.join()
