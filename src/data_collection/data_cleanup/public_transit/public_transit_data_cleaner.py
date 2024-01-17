from public_transit_fetch import get_gtfsr_data, extract_stop_time_updates, create_stop_time_updates_df


if __name__ == "__main__":
    gtfsr_url = "https://gtfsr.vbn.de/gtfsr_connect.json"
    gtfsr_data = get_gtfsr_data(gtfsr_url)

    stop_time_updates = extract_stop_time_updates(gtfsr_data)

    stop_time_updates_df = create_stop_time_updates_df(stop_time_updates)

    print(stop_time_updates_df.head())