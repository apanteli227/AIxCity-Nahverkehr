import axios from "axios";

// Fetches the routes and stops from the overpass API
export async function fetchRoutesAndStops() {
  return await axios.get(
    "https://overpass-api.de/api/interpreter?data=[out:json][timeout:50];(relation[network=VBN][type=route][route=tram];relation[operator=BSAG][type=route][route=bus];);out geom;"
  );
}
