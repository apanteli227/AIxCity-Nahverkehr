from persistence import database_controller as dbc


def read_data(query):
    try:
        conn = dbc.connect(dbc.param_dic)
        cursor = conn.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        dbc.disconnect(conn)
        return result

    except Exception as e:
        print(e)


def read_all_line_with_direction(line: int, direction: str):
    query = "SELECT * FROM public.bsag_data WHERE line = '" + str(line) + "' AND direction = '" + direction + "'"
    return read_data(query)


def read_all_line(line: int):
    query = "SELECT * FROM public.bsag_data WHERE line = '" + str(line) + "'"
    return read_data(query)


def read_all_direction(direction: str):
    query = "SELECT * FROM public.bsag_data WHERE direction = '" + direction + "'"
    return read_data(query)


def read_all_workdays():
    query = ("SELECT * FROM public.bsag_data WHERE holiday = 0 AND weekday IN ('Montag', 'Dienstag', 'Mittwoch', "
             "'Donnerstag', 'Freitag')")
    return read_data(query)
