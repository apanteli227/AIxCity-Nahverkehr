import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
import xgboost as xgb
from sklearn.metrics import accuracy_score, f1_score, roc_curve, auc
import warnings
import logging
from sklearn.metrics import confusion_matrix
import seaborn as sns

pd.options.mode.chained_assignment = None  # Deaktiviere SettingWithCopyWarning

warnings.filterwarnings("ignore", message="No positive samples in y_true*")

def split_dataframe_by_time(df_stop_times):
    """
    Die Funktion teilt den DataFrame in mehrere DataFrames auf, sofern sich der Wert
    in der Spalte 'starting_stop_time' vom vorherigen unterscheidet.

    Parameter:
    df_stop_times: DataFrame mit den Stop-Times-Daten

    Return:
    splits: Liste von DataFrames, die nach 'starting_stop_time' sortiert und aufgeteilt sind
    """
    splits = []
    start_index = 0

    for i in range(1, len(df_stop_times)):
        if df_stop_times.loc[i, 'starting_stop_time'] != df_stop_times.loc[i-1, 'starting_stop_time']:
            splits.append(df_stop_times.iloc[start_index:i])
            start_index = i

    splits.append(df_stop_times.iloc[start_index:])
    return splits

def create_dataset_matrix(data, num_stops_bundled=5, include_previous_stop_delay=False):
    """
    Erstellt die X- und Y-Matrizen aus dem DataFrame. Für die X-Matrix werden jeweils standardmäßig
    die letzten 5 Haltestellen als Features verwendet. Optional kann die Verspätung der vorherigen Haltestelle
    mit aufgenommen werden.

    Parameter:
    data: DataFrame mit den Daten
    num_stops_bundled: Anzahl der Haltestellen, die als Features verwendet werden sollen (default=5)
    include_previous_stop_delay: Boolean-Wert, ob die Verspätung der vorherigen Haltestelle mit aufgenommen werden soll (default=False)

    Return:
    X_matrix: NumPy-Array mit den Features
    Y_matrix: NumPy-Array mit den Labels
    """
    # Konvertiere das DataFrame in eine NumPy-Array-Repräsentation
    data_array = data.to_numpy()
    
    # Anzahl der Zeilen, Spalten
    num_rows, num_features = data_array.shape

    # Anzahl der Samples in der X- und Y-Matrix
    num_samples = num_rows - num_stops_bundled
    
    # Initialisiere die X- und Y-Matrizen
    # Wenn include_previous_stop_delay=True, dann wird die letzte Spalte (arrival_delay_category) nicht entfernt
    if include_previous_stop_delay:
        X_matrix = np.zeros((num_samples, num_stops_bundled, num_features))
    else:
        X_matrix = np.zeros((num_samples, num_stops_bundled, num_features - 1))  # Exclude previous stop delay
   
    Y_matrix = np.zeros((num_samples, 1))
    
    # Fülle die X- und Y-Matrizen
    for i in range(num_samples):
        if include_previous_stop_delay:
            X_matrix[i] = data_array[i:i+num_stops_bundled]
        else:
            X_matrix[i] = data_array[i:i+num_stops_bundled, :-1]  # Exclude last column (previous stop delay)
        # Wähle jeweils immer ab der nächsten Zeile aus der Spalte 'arrival_delay_category' als Label, dann fortlaufend
        Y_matrix[i] = data_array[i+1, num_features-1]
    
    return X_matrix, Y_matrix, include_previous_stop_delay

def create_roc_curve(y_true, y_score,num_stops):
    """
    Erstellt die ROC-Kurve für die gegebenen Labels und Scores.

    Parameter:
    y_true: Die wahren Labels
    y_score: Die Scores der Vorhersagen
    num_stops: Anzahl der Haltestellen, die als Features verwendet wurden
    """
    fpr, tpr, _ = roc_curve(y_true, y_score)
    roc_auc = auc(fpr, tpr)

    plt.figure()
    plt.plot(fpr, tpr, color='darkorange', lw=2, label='ROC curve (area = %0.2f)' % roc_auc)
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f"ROC-Kurve für {num_stops} Haltestellen ")
    plt.legend(loc="lower right")
    plt.show()


def plot_feature_importance(feature_names_dict, bst):
    """
    Plottet die Feature-Importance des XGBoost-Modells.

    Parameters:
    feature_names_dict: Dictionary mit den Feature-Namen
    bst: XGBoost-Modell

    Returns:
    None
    """
    try:
        # Extrahiere die Features und deren entsprechenden Werte aus dem XGBoost-Modell
        importance = bst.get_score(importance_type='weight')

        # Kartiere die f-Werte auf ihre Feature-Namen
        mapped_importance = {feature_names_dict[f]: importance[f] for f in importance}

        # Sortiere die Feature-Importance absteigend
        sorted_importance = sorted(mapped_importance.items(), key=lambda x: x[1], reverse=True)
        features, scores = zip(*sorted_importance)

        # Plot Feature Importance
        plt.figure(figsize=(10, 6))
        plt.bar(range(len(features)), scores)
        plt.xlabel('Features')
        plt.ylabel('Importance Score')
        plt.title('Feature Importance')
        plt.xticks(range(len(features)), features) 
        plt.show()
    except ValueError as var_error:
        logging.error(f"Feature_Importance konnte nicht geplottet werden, da keine Variable für Entscheidung maßgebend war: {var_error}")



def classification_with_line_22():
    """
    Die Funktion führt die Klassifikation für die Linie 22 in Richtung Universität-Ost durch.
    Es werden die Stop-Times-Daten, Verkehrsdaten und Wetterdaten verwendet.

    Parameter:
    line: Linie (default="22")
    direction: Richtung (default="Universität-Ost")
    """
    # Lese CSV-Dateien ein
    df_stop_times = pd.read_csv("stop_times_bsag_updates.csv")
    df_traffic = pd.read_csv('traffic_data_bsag_updates.csv')
    df_weather = pd.read_csv('weather_bremen_df.csv')

    # Liste für x- und y-Matrizen erstellen
    x_matrices = []
    y_matrices = []

    # Listen für Trainings- und Testgenauigkeit sowie F1-Score
    train_accuracy_scores = []
    test_accuracy_scores = []
    f1_scores = []

    # Filtere aus df_stop_times in Spale line 22 und in direction Universität-Ost
    df_stop_times = df_stop_times[(df_stop_times["line"] == "22") & (df_stop_times["direction"] == "Universität-Ost")]

    # Merge df_stop_times und df_traffic nach den Spalten start_date, dayquarter und Haltestelle (Spalte 'stop' in df_stop_times und Spalte 'stop_name' in df_traffic)
    df_stop_times = pd.merge(df_stop_times, df_traffic, on=["current_date", "dayquarter", "stop_name"], how="inner")

    # Merge df_stop_times und df_weather nach den Spalten current_date und dayhour
    df_weather = df_weather.rename(columns={'dayhour': 'dayhour_x'})
    df_stop_times = pd.merge(df_stop_times, df_weather, on=['current_date', 'dayhour_x'])

    # Datensatz sortieren nach Datum, current_time, starting_time und stop_sequence
    df_stop_times = df_stop_times.sort_values(by=['current_date', 'current_time_x', 'starting_stop_time', 'stop_sequence'])

    # Index des DataFrames zurücksetzen nach Sortierung
    df_stop_times.reset_index(inplace=True, drop=True)

    # Aufruf der Funktion zum Aufteilen der DataFrames nach 'starting_stop_time'
    getrennte_dataframes = split_dataframe_by_time(df_stop_times)

    # Iteration über die Anzahl der Haltestellen (10 Stück)
    for num_stops in range(1, 11):
        
        # Iteration über die aufgeteilten DataFrames
        for i, df_split in enumerate(getrennte_dataframes):

            # Spalte einfügen mit Verspätung von vorheriger Haltestelle (deparure_delay_seconds um einen nach unten verschieben)
            df_split['arrival_delay_seconds_previous_stop'] = df_split['arrival_delay_seconds'].shift(1)

            # Spalte einfügen mit Verspätung von vorheriger Haltestelle (deparure_delay_category um einen nach unten verschieben)
            df_split['arrival_delay_category_previous_stop'] = df_split['arrival_delay_category'].shift(1)

            # Erste Zeile entfernen (da keine vorherige Haltestelle)
            df_split = df_split.dropna()
            
            # Spalten entfernen, die nicht für die Klassifikation benötigt werden
            df_stop_times = df_split.drop(columns=['city','current_date','starting_stop_time','stop_sequence','current_date','current_time_x','dayquarter', 'weekday','stop_name', 'line', 'direction','stop_id',"arrival_delay_seconds","stop_lat","stop_lon","departure_delay_category","departure_delay_seconds","current_time_x","arrival_delay_category_previous_stop"])

            # Reihenfolge Datensatz ändern
            df_stop_times = df_stop_times[["daytime_x","dayhour_x","is_workingday","is_holiday","number_of_stops","number_of_building_sites","current_speed","freeflow_Speed","quotient_current_freeflow_speed","temperature_celsius","humidity_percentage","weather_description","wind_speed_m_s","weather_warning","arrival_delay_seconds_previous_stop","arrival_delay_category"]]

            # Spalte daytime_x entfernen
            df_stop_times = df_stop_times.drop(columns=['daytime_x'])

            # Erstellen der X- und Y-Matrix
            x,y, knowledge_delay_pevius_stop = create_dataset_matrix(df_stop_times)

            # arrival_delay_category aus x-Matrix entfernen (ist soweit als Label in y-Matrix erfasst)
            x = x[:,:,:-1]

            # x und y-Matrix den Listen hinzufügen
            x_matrices.append(x)
            y_matrices.append(y)

        # x- und y-Matrizen zusammenführen
        x_combined = np.concatenate(x_matrices, axis=0)
        y_combined = np.concatenate(y_matrices, axis=0)

        # x-Matrix in 2D-Array umformen (notwendig für XGBoost)
        X_flattened = x_combined.reshape(x_combined.shape[0], -1)

        # Aufteilen der Daten in Trainings- und Testdaten
        X_train, X_test, y_train, y_test = train_test_split(X_flattened, y_combined, test_size=0.3, random_state=42, shuffle=False)

        # Erstellen der DMatrizen für XGBoost
        dtrain = xgb.DMatrix(X_train, label=y_train)
        dtest = xgb.DMatrix(X_test, label=y_test)

        # XGBoost-Parameter
        params = {
            'objective': 'binary:logistic',
            'eval_metric': 'logloss',
        }

        # Training des Modells
        bst = xgb.train(params, dtrain, num_boost_round=100)

        # Vorhersagen auf Trainings- und Testdaten
        y_train_pred = bst.predict(dtrain)
        y_test_pred = bst.predict(dtest)

        # Berechnung der Accuracy auf Trainings- und Testdaten
        train_accuracy = accuracy_score(y_train, y_train_pred > 0.5)
        test_accuracy = accuracy_score(y_test, y_test_pred > 0.5)

        # Hinzufügen der Accuracys zu den Listen
        train_accuracy_scores.append(train_accuracy)
        test_accuracy_scores.append(test_accuracy)

        # Umwandlung der Vorhersagen in binäre Werte
        binary_y_test_pred = (y_test_pred > 0.5).astype(int)
        binary_y_test = (y_test > 0.5).astype(int)

        # Berechnung des F1-Scores
        f1 = f1_score(binary_y_test, binary_y_test_pred)
        f1_scores.append(f1)

        # Erstellen der ROC-Kurve
        create_roc_curve(binary_y_test, y_test_pred,num_stops)

        # Berechnung der Confusion Matrix
        conf_matrix = confusion_matrix(binary_y_test, binary_y_test_pred)

        # Visualisierung der Confusion Matrix
        plt.figure(figsize=(8, 6))
        sns.heatmap(conf_matrix, annot=True, fmt="d", cmap="Blues", cbar=False)
        plt.xlabel("Prognostizierte Ankunft (0: pünktlich, 1: verspätet)")
        plt.ylabel("Tatsächliche Ankunft (0: pünktlich, 1: verspätet)")
        plt.title(f"Konfusionsmatrix der Linie 22 in Richtung Universität-Ost bei Verwendung von {num_stops} Haltestellen")
        plt.show()

    # Erstellen der Bar-Charts für Trainings-Accuracy, Test-Accuracy und F1-Score
    plt.figure(figsize=(8, 6))

    plt.bar(range(1, 11), train_accuracy_scores, color='blue')
    plt.xlabel(f"Anzahl zur Prognose verwendeter Haltestellen der Linie 22 in Richtung Universität-Ost")
    plt.ylabel('Accuracy auf Trainingsdaten')
    plt.title('Accuracy auf Trainingsdaten für verschiedene Anzahl von Haltestellen')
    plt.show()

    plt.figure(figsize=(8, 6))
    plt.bar(range(1, 11), test_accuracy_scores, color='green')
    plt.xlabel(f"Anzahl zur Prognose verwendeter Haltestellen der Linie 22 in Richtung Universität-Ost")
    plt.ylabel('Accuracy auf Testdaten')
    plt.title('Accuracy auf Testdaten für verschiedene Anzahl von Haltestellen')
    plt.show()

    plt.figure(figsize=(8, 6))
    plt.bar(range(1, 11), f1_scores, color='orange')
    plt.xlabel(f"Anzahl zur Prognose verwendeter Haltestellen der Linie 22 in Richtung Universität-Ost")
    plt.ylabel('F1-Score')
    plt.title('F1-Score für verschiedene Anzahl von Haltestellen')
    plt.show()

    if knowledge_delay_pevius_stop:
        feature_names_dict = {
    'f64': 'temperature_celsius',
    'f50': 'temperature_celsius',
    'f36': 'temperature_celsius',
    'f22': 'temperature_celsius',
    'f8': 'temperature_celsius',
    'f0': 'dayhour',
    'f14': 'dayhour',
    'f28': 'dayhour',
    'f42': 'dayhour',
    'f56': 'dayhour',
    'f1': 'is_workingday',
    'f15': 'is_workingday',
    'f29': 'is_workingday',
    'f43': 'is_workingday',
    'f57': 'is_workingday',
    'f3': 'number_of_stops',
    'f17': 'number_of_stops',
    'f31': 'number_of_stops',
    'f45': 'number_of_stops',
    'f59': 'number_of_stops',
    'f5': 'current_speed',
    'f19': 'current_speed',
    'f33': 'current_speed',
    'f47': 'current_speed',
    'f61': 'current_speed',
    'f6': 'freeflow_speed',
    'f20': 'freeflow_speed',
    'f34': 'freeflow_speed',
    'f48': 'freeflow_speed',
    'f62': 'freeflow_speed',
    'f7': 'quotient_current_freeflow_speed',
    'f21': 'quotient_current_freeflow_speed',
    'f35': 'quotient_current_freeflow_speed',
    'f49': 'quotient_current_freeflow_speed',
    'f63': 'quotient_current_freeflow_speed',
    'f11': 'wind_speed_m_s',
    'f25': 'wind_speed_m_s',
    'f39': 'wind_speed_m_s',
    'f53': 'wind_speed_m_s',
    'f67': 'wind_speed_m_s',
    'f12': 'weather_warning',
    'f26': 'weather_warning',
    'f40': 'weather_warning',
    'f54': 'weather_warning',
    'f68': 'weather_warning',
    'f9': 'humidity_percentage',
    'f23': 'humidity_percentage',
    'f37': 'humidity_percentage',
    'f51': 'humidity_percentage',
    'f65': 'humidity_percentage',
    'f2': 'is_holiday',
    'f16': 'is_holiday',
    'f30': 'is_holiday',
    'f44': 'is_holiday',
    'f58': 'is_holiday',
    'f4': 'number_of_building_sites',
    'f18': 'number_of_building_sites',
    'f32': 'number_of_building_sites',
    'f46': 'number_of_building_sites',
    'f60': 'number_of_building_sites',
    'f10': 'weather_description',
    'f24': 'weather_description',
    'f38': 'weather_description',
    'f52': 'weather_description',
    'f66': 'weather_description',
    'f13': 'arrival_delay_seconds_previous_stop',
    'f27': 'arrival_delay_seconds_previous_stop',
    'f41': 'arrival_delay_seconds_previous_stop',
    'f55': 'arrival_delay_seconds_previous_stop',
    'f69': 'arrival_delay_seconds_previous_stop'
}
    else:    
        feature_names_dict = {
        'f60': 'temperature_celsius',
        'f47': 'temperature_celsius',
        'f34': 'temperature_celsius',
        'f21': 'temperature_celsius',
        'f8': 'temperature_celsius',
        'f0': 'dayhour',
        'f13': 'dayhour',
        'f26': 'dayhour',
        'f39': 'dayhour',
        'f52': 'dayhour',
        'f1': 'is_workingday',
        'f14': 'is_workingday',
        'f27': 'is_workingday',
        'f40': 'is_workingday',
        'f53': 'is_workingday',
        'f3': 'number_of_stops',
        'f16': 'number_of_stops',
        'f29': 'number_of_stops',
        'f42': 'number_of_stops',
        'f55': 'number_of_stops',
        'f5': 'current_speed',
        'f18': 'current_speed',
        'f31': 'current_speed',
        'f44': 'current_speed',
        'f57': 'current_speed',
        'f6': 'freeflow_speed',
        'f19': 'freeflow_speed',
        'f32': 'freeflow_speed',
        'f45': 'freeflow_speed',
        'f58': 'freeflow_speed',
        'f7': 'quotient_current_freeflow_speed',
        'f20': 'quotient_current_freeflow_speed',
        'f33': 'quotient_current_freeflow_speed',
        'f46': 'quotient_current_freeflow_speed',
        'f59': 'quotient_current_freeflow_speed',
        'f11': 'wind_speed_m_s',
        'f24': 'wind_speed_m_s',
        'f37': 'wind_speed_m_s',
        'f50': 'wind_speed_m_s',
        'f63': 'wind_speed_m_s',
        'f12': 'weather_warning',
        'f25': 'weather_warning',
        'f38': 'weather_warning',
        'f51': 'weather_warning',
        'f64': 'weather_warning',
        'f9': 'humidity_percentage',
        'f21': 'humidity_percentage',
        'f34': 'humidity_percentage',
        'f47': 'humidity_percentage',
        'f60': 'humidity_percentage',
        'f2': 'is_holiday',
        'f15': 'is_holiday',
        'f28': 'is_holiday',
        'f41': 'is_holiday',
        'f54': 'is_holiday',
        'f4': 'number_of_building_sites',
        'f17': 'number_of_building_sites',
        'f30': 'number_of_building_sites',
        'f43': 'number_of_building_sites',
        'f56': 'number_of_building_sites',
        'f10': 'weather_description',
        'f23': 'weather_description',
        'f36': 'weather_description',
        'f49': 'weather_description',
        'f52': 'weather_description'
    }

    # Plot Feature Importance
    plot_feature_importance(feature_names_dict, bst)


def classification_with_line(line="6", direction="Universität"):
    """
    Diese Funktion führt die Klassifikation für eine beliebige Linie und Richtung durch.
    Es werden die Stop-Times-Daten, und Wetterdaten verwendet. Als Standard wird die Linie 6 in Richtung Universität verwendet.
    Dies kann durch die Parameter line und direction geändert werden.

    Parameter:
    line: Linie (default="6")
    direction: Richtung (default="Universität")
    """
    # Lese die CSV-Dateien ein
    df_stop_times = pd.read_csv("stop_times_bsag_updates.csv")
    df_stops_line = pd.read_csv("stops_bremen.csv", sep=";")
    df_weather = pd.read_csv('weather_bremen_df.csv')
    
    # Liste für x- und y-Matrizen erstellen
    x_matrices = []
    y_matrices = []

    # Listen für Trainings- und Testgenauigkeit sowie F1-Score
    train_accuracy_scores = []
    test_accuracy_scores = []
    f1_scores = []

    # Filtere aus df_stop_times in Spalte line und direction die entsprechende Nutzereingabe
    df_stop_times = df_stop_times[(df_stop_times["line"] == line) & (df_stop_times["direction"] == direction)]

    # Merge df_stop_times und df_weather nach den Spalten current_date und dayhour
    df_stop_times = pd.merge(df_stop_times, df_weather, on=['current_date', 'dayhour'])

    # Merge df_stop_times und df_stops_line nach der Spalte stop_name
    df_stop_times = pd.merge(df_stop_times, df_stops_line, on ="stop_name", how="inner")

    # Datensatz sortieren nach Datum, current_time, starting_time und stop_sequence
    df_stop_times = df_stop_times.sort_values(by=['current_date', 'current_time_x', 'starting_stop_time', 'stop_sequence'])

    # Index des DataFrames zurücksetzen nach Sortierung
    df_stop_times.reset_index(inplace=True, drop=True)

    # Aufruf der Funktion zum Aufteilen der DataFrames nach 'starting_stop_time'
    getrennte_dataframes = split_dataframe_by_time(df_stop_times)

    # Iteration über die Anzahl der Haltestellen (10 Stück)
    for num_stops in range(1, 11):
        
        # Iteration über die aufgeteilten DataFrames
        for i, df_split in enumerate(getrennte_dataframes):

            # Spalte einfügen mit Verspätung von vorheriger Haltestelle (deparure_delay_seconds um einen nach unten verschieben)
            df_split['arrival_delay_seconds_previous_stop'] = df_split['arrival_delay_seconds'].shift(1)

            # Spalte einfügen mit Verspätung von vorheriger Haltestelle (deparure_delay_category um einen nach unten verschieben)
            df_split['arrival_delay_category_previous_stop'] = df_split['arrival_delay_category'].shift(1)

            # Erste Zeile entfernen (da keine vorherige Haltestelle)
            df_split = df_split.dropna()

            # Spalten entfernen, die nicht für die Klassifikation benötigt werden
            df_stop_times = df_split.drop(columns=['city','current_date','starting_stop_time','stop_sequence','current_date','current_time_x','dayquarter', 'weekday','stop_name', 'line', 'direction',"stop_lat","stop_lon","arrival_delay_seconds","departure_delay_category","departure_delay_seconds","current_time_x","arrival_delay_category_previous_stop"])

            # Reihenfolge Datensatz ändern
            df_stop_times = df_stop_times[["is_workingday","is_holiday","number_of_stops","number_of_building_sites","temperature_celsius","humidity_percentage","weather_description","wind_speed_m_s","weather_warning","arrival_delay_seconds_previous_stop","arrival_delay_category"]]

            # Erstellen der X- und Y-Matrix
            x,y,knowledge_delay_pevius_stop = create_dataset_matrix(df_stop_times)

            # arrival_delay_categiry aus x-Matrix entfernen (da als Label in y-Matrix erfasst)
            x = x[:,:,:-1]

            # x- und y-Matrix den Listen hinzufügen
            x_matrices.append(x)
            y_matrices.append(y)

        # x- und y-Matrizen zusammenführen
        x_combined = np.concatenate(x_matrices, axis=0)
        y_combined = np.concatenate(y_matrices, axis=0)

        # x-Matrix in 2D-Array umformen (notwendig für XGBoost)
        X_flattened = x_combined.reshape(x_combined.shape[0], -1)

        # Aufteilen der Daten in Trainings- und Testdaten
        X_train, X_test, y_train, y_test = train_test_split(X_flattened, y_combined, test_size=0.3, random_state=42, shuffle=False)

        # Erstellen der DMatrizen für XGBoost
        dtrain = xgb.DMatrix(X_train, label=y_train)
        dtest = xgb.DMatrix(X_test, label=y_test)

        # XGBoost-Parameter
        params = {
            'objective': 'binary:logistic',
            'eval_metric': 'logloss',
        }

        # Training des Modells
        bst = xgb.train(params, dtrain, num_boost_round=100)

        # Vorhersagen auf Trainings- und Testdaten
        y_train_pred = bst.predict(dtrain)
        y_test_pred = bst.predict(dtest)

        # Berechnung der Accuracy auf Trainings- und Testdaten
        train_accuracy = accuracy_score(y_train, y_train_pred > 0.5)
        test_accuracy = accuracy_score(y_test, y_test_pred > 0.5)

        # Hinzufügen der Accuracys zu den Listen
        train_accuracy_scores.append(train_accuracy)
        test_accuracy_scores.append(test_accuracy)

        # Umwandlung der Vorhersagen in binäre Werte
        binary_y_test_pred = (y_test_pred > 0.5).astype(int)
        binary_y_test = (y_test > 0.5).astype(int)

        # Berechnung des F1-Scores
        f1 = f1_score(binary_y_test, binary_y_test_pred)
        f1_scores.append(f1)

        # Erstellen der ROC-Kurve
        create_roc_curve(binary_y_test, y_test_pred,num_stops)

        # Berechnung der Confusion Matrix
        conf_matrix = confusion_matrix(binary_y_test, binary_y_test_pred)

        # Visualisierung der Confusion Matrix
        plt.figure(figsize=(8, 6))
        sns.heatmap(conf_matrix, annot=True, fmt="d", cmap="Blues", cbar=False)
        plt.xlabel("Prognostizierte Ankunft (0: pünktlich, 1: verspätet)")
        plt.ylabel("Tatsächliche Ankunft (0: pünktlich, 1: verspätet)")
        plt.title(f"Konfusionsmatrix der Linie {line} in Richtung {direction} bei Verwendung von {num_stops} Haltestellen")
        plt.show()

    # Erstellen der Bar-Charts für Trainingsgenauigkeit, Testgenauigkeit und F1-Score
    plt.figure(figsize=(8, 6))
    plt.bar(range(1, 11), train_accuracy_scores, color='blue')
    plt.xlabel(f"Anzahl zur Prognose verwendeter Haltestellen der Linie {line} in Richtung {direction}")
    plt.ylabel('Accuracy auf Trainingsdaten')
    plt.title('Accuracy auf Trainingsdaten für verschiedene Anzahl von Haltestellen')
    plt.show()

    plt.figure(figsize=(8, 6))
    plt.bar(range(1, 11), test_accuracy_scores, color='green')
    plt.xlabel(f"Anzahl zur Prognose verwendeter Haltestellen der Linie {line} in Richtung {direction}")
    plt.ylabel('Accuracy auf Testdaten')
    plt.title('Accuracy auf Testdaten für verschiedene Anzahl von Haltestellen')
    plt.show()

    plt.figure(figsize=(8, 6))
    plt.bar(range(1, 11), f1_scores, color='orange')
    plt.xlabel(f"Anzahl zur Prognose verwendeter Haltestellen der Linie {line} in Richtung {direction}")
    plt.ylabel('F1-Score')
    plt.title('F1-Score für verschiedene Anzahl von Haltestellen')
    plt.show()

    if knowledge_delay_pevius_stop:
        feature_names_dict = {
    'f64': 'temperature_celsius',
    'f50': 'temperature_celsius',
    'f36': 'temperature_celsius',
    'f22': 'temperature_celsius',
    'f8': 'temperature_celsius',
    'f0': 'dayhour',
    'f14': 'dayhour',
    'f28': 'dayhour',
    'f42': 'dayhour',
    'f56': 'dayhour',
    'f1': 'is_workingday',
    'f15': 'is_workingday',
    'f29': 'is_workingday',
    'f43': 'is_workingday',
    'f57': 'is_workingday',
    'f3': 'number_of_stops',
    'f17': 'number_of_stops',
    'f31': 'number_of_stops',
    'f45': 'number_of_stops',
    'f59': 'number_of_stops',
    'f5': 'current_speed',
    'f19': 'current_speed',
    'f33': 'current_speed',
    'f47': 'current_speed',
    'f61': 'current_speed',
    'f6': 'freeflow_speed',
    'f20': 'freeflow_speed',
    'f34': 'freeflow_speed',
    'f48': 'freeflow_speed',
    'f62': 'freeflow_speed',
    'f7': 'quotient_current_freeflow_speed',
    'f21': 'quotient_current_freeflow_speed',
    'f35': 'quotient_current_freeflow_speed',
    'f49': 'quotient_current_freeflow_speed',
    'f63': 'quotient_current_freeflow_speed',
    'f11': 'wind_speed_m_s',
    'f25': 'wind_speed_m_s',
    'f39': 'wind_speed_m_s',
    'f53': 'wind_speed_m_s',
    'f67': 'wind_speed_m_s',
    'f12': 'weather_warning',
    'f26': 'weather_warning',
    'f40': 'weather_warning',
    'f54': 'weather_warning',
    'f68': 'weather_warning',
    'f9': 'humidity_percentage',
    'f23': 'humidity_percentage',
    'f37': 'humidity_percentage',
    'f51': 'humidity_percentage',
    'f65': 'humidity_percentage',
    'f2': 'is_holiday',
    'f16': 'is_holiday',
    'f30': 'is_holiday',
    'f44': 'is_holiday',
    'f58': 'is_holiday',
    'f4': 'number_of_building_sites',
    'f18': 'number_of_building_sites',
    'f32': 'number_of_building_sites',
    'f46': 'number_of_building_sites',
    'f60': 'number_of_building_sites',
    'f10': 'weather_description',
    'f24': 'weather_description',
    'f38': 'weather_description',
    'f52': 'weather_description',
    'f66': 'weather_description',
    'f13': 'arrival_delay_seconds_previous_stop',
    'f27': 'arrival_delay_seconds_previous_stop',
    'f41': 'arrival_delay_seconds_previous_stop',
    'f55': 'arrival_delay_seconds_previous_stop',
    'f69': 'arrival_delay_seconds_previous_stop'
}
    else:    
        feature_names_dict = {
        'f60': 'temperature_celsius',
        'f47': 'temperature_celsius',
        'f34': 'temperature_celsius',
        'f21': 'temperature_celsius',
        'f8': 'temperature_celsius',
        'f0': 'dayhour',
        'f13': 'dayhour',
        'f26': 'dayhour',
        'f39': 'dayhour',
        'f52': 'dayhour',
        'f1': 'is_workingday',
        'f14': 'is_workingday',
        'f27': 'is_workingday',
        'f40': 'is_workingday',
        'f53': 'is_workingday',
        'f3': 'number_of_stops',
        'f16': 'number_of_stops',
        'f29': 'number_of_stops',
        'f42': 'number_of_stops',
        'f55': 'number_of_stops',
        'f5': 'current_speed',
        'f18': 'current_speed',
        'f31': 'current_speed',
        'f44': 'current_speed',
        'f57': 'current_speed',
        'f6': 'freeflow_speed',
        'f19': 'freeflow_speed',
        'f32': 'freeflow_speed',
        'f45': 'freeflow_speed',
        'f58': 'freeflow_speed',
        'f7': 'quotient_current_freeflow_speed',
        'f20': 'quotient_current_freeflow_speed',
        'f33': 'quotient_current_freeflow_speed',
        'f46': 'quotient_current_freeflow_speed',
        'f59': 'quotient_current_freeflow_speed',
        'f11': 'wind_speed_m_s',
        'f24': 'wind_speed_m_s',
        'f37': 'wind_speed_m_s',
        'f50': 'wind_speed_m_s',
        'f63': 'wind_speed_m_s',
        'f12': 'weather_warning',
        'f25': 'weather_warning',
        'f38': 'weather_warning',
        'f51': 'weather_warning',
        'f64': 'weather_warning',
        'f9': 'humidity_percentage',
        'f22': 'humidity_percentage',
        'f35': 'humidity_percentage',
        'f48': 'humidity_percentage',
        'f61': 'humidity_percentage',
        'f2': 'is_holiday',
        'f15': 'is_holiday',
        'f28': 'is_holiday',
        'f41': 'is_holiday',
        'f54': 'is_holiday',
        'f4': 'number_of_building_sites',
        'f17': 'number_of_building_sites',
        'f30': 'number_of_building_sites',
        'f43': 'number_of_building_sites',
        'f56': 'number_of_building_sites',
        'f10': 'weather_description',
        'f23': 'weather_description',
        'f36': 'weather_description',
        'f49': 'weather_description',
        'f62': 'weather_description'
    }

    # Plot Feature Importance
    plot_feature_importance(feature_names_dict, bst)

# Funktionsaufruf mit gewünschten Parametern

# Prognose der Linie 22 mit Einbezug von Verkehrsdaten
classification_with_line_22()

# Prognose einer beliebigen Linie - Linie muss als String übergeben werden
classification_with_line(line="90", direction="Neuenkirchen")