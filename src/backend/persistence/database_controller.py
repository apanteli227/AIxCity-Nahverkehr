import sys

import psycopg2

# DB connection parameters
param_dic = {
    "host": "134.102.23.195",
    "port": "5434",
    "dbname": "aixcity_nahverkehr",
    "user": "aixcity-user",
    "password": "password"
}


def connect(params_dic):
    """ Connect to the PostgreSQL persistence server """
    conn = None
    try:
        # connect to the PostgreSQL server
        #print('PostgreSQL-Datenbank: Verbindung aufbauen...')
        conn = psycopg2.connect(**params_dic)
    except Exception as error:
        print(error)
        sys.exit(1)
    #print("PostgreSQL-Datenbank: Verbindung erfolgreich!")
    return conn


def disconnect(conn):
    """ Disconnect from the PostgreSQL """
    if conn is not None:
        conn.close()
        #print('PostgreSQL-Datenbank: Verbindung getrennt!')


def execute_query(conn, query):
    """ Execute a single query """
    ret = 0  # Return value
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        conn.commit()
    except Exception as error:
        print("Error: %s" % error)
        conn.rollback()
        cursor.close()
        return 1
    # If this was a select query, return the result
    if 'select' in query.lower():
        ret = cursor.fetchall()
    cursor.close()
    return ret


def single_inserts(df, table):
    """Perform single inserts of the dataframe into the PostGIS table"""
    conn = connect(param_dic)
    print("======[" + table + "]======")
    print("conn: " + conn.dsn)
    dataframe = pt_fetch.create_stop_time_updates_df(df)
    print("2: " + dataframe)

    print("======[" + table + "]======")
    for i in df.index:
        vals = [dataframe.at[i, col] for col in list(dataframe.columns)]
        query = """INSERT INTO deine_tabelle (
                        startdate,
                        startzeit_an_der_anfangshaltestelle,
                        linie,
                        richtung,
                        haltestelle,
                        stopsequence,
                        ankunfsverspatung_sek,
                        abfahrtsverspatung_sek
                   ) VALUES (
                        '%s', '%s', '%s', '%s', '%s', %s, %s, %s
                   );""" % (
            vals[0],
            vals[1],
            vals[2],
            vals[3],
            vals[4],
            vals[5],
            vals[6],
            vals[7]
        )
        execute_query(conn, query)
        print("execute_query: " + query)
    disconnect(conn)
