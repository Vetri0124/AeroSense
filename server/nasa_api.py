import requests
import datetime

NASA_POWER_API_URL = "https://power.larc.nasa.gov/api/temporal/hourly/point"

def get_live_data(lat: float, lon: float):
    # NASA Power API is not truly "live" (usually some delay), but we can query for the "latest available"
    # Or for a specific recent range.
    # For "Hourly" data, it provides typically up to a few days ago or sometimes near real-time depending on the product.
    # We will request the last 2 days to ensure we get *some* data points.
    
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=7) # Get last 7 days to ensure data availability
    
    start_str = start_str = start_date.strftime("%Y%m%d")
    end_str = end_date.strftime("%Y%m%d")

    params = {
        "parameters": "T2M,RH2M,ALLSKY_SFC_SW_DWN",
        "community": "RE",
        "longitude": lon,
        "latitude": lat,
        "start": start_str,
        "end": end_str,
        "format": "JSON"
    }

    try:
        response = requests.get(NASA_POWER_API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Extract the latest non-null value for each parameter
        parameter_data = data.get("properties", {}).get("parameter", {})
        
        result = {}
        for param, values in parameter_data.items():
            # values is a dict like {"YYYYMMDDHH": value, ...}
            # We want the last valid value
            valid_values = [v for k, v in values.items() if v != -999] # -999 is No Data
            if valid_values:
                result[param] = valid_values[-1]
            else:
                result[param] = None # Mark as missing
                
        return {
            "temperature": result.get("T2M") if result.get("T2M") is not None else 28,
            "humidity": result.get("RH2M") if result.get("RH2M") is not None else 60,
            "solar_irradiance": result.get("ALLSKY_SFC_SW_DWN", 0),
            "uv_index": result.get("ALLSKY_SFC_SW_DWN", 0) / 25, # Rough approx if UV not available directly
            "aqi": 50 # NASA Power doesn't give AQI, we might keep this mocked or find another source later
        }

    except Exception as e:
        print(f"Error fetching NASA data: {e}")
        # Fallback mock data
        return {
            "temperature": 28,
            "humidity": 60,
            "solar_irradiance": 500,
            "uv_index": 5,
            "aqi": 75
        }
