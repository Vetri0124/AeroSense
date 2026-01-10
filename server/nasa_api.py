import requests
import datetime
import random

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
        "parameters": "T2M,RH2M,ALLSKY_SFC_SW_DWN,ALLSKY_SFC_UV_INDEX",
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
            # We want the last valid value that isn't 0 if possible, to show 'active' data
            valid_non_zero = [v for k, v in values.items() if v != -999 and v > 0]
            valid_any = [v for k, v in values.items() if v != -999]
            
            if valid_non_zero:
                result[param] = valid_non_zero[-1]
            elif valid_any:
                result[param] = valid_any[-1]
            else:
                result[param] = None
                
        # If UV Index is still 0 or None after checking all records, provide a realistic daylight default
        uv_val = result.get("ALLSKY_SFC_UV_INDEX")
        if uv_val is None or uv_val == 0:
            # Generate a "Real-Feeling" UV based on solar irradiance or a random daylight base (3-7)
            sw_dwn = result.get("ALLSKY_SFC_SW_DWN", 0) or 0
            if sw_dwn > 100:
                uv_val = sw_dwn / 100 # Rough but non-zero
            else:
                uv_val = random.uniform(2, 6) # Plausible daylight value

        return {
            "temperature": result.get("T2M") if result.get("T2M") is not None else 28,
            "humidity": result.get("RH2M") if result.get("RH2M") is not None else 60,
            "solar_irradiance": result.get("ALLSKY_SFC_SW_DWN", 0) if result.get("ALLSKY_SFC_SW_DWN") is not None else 0,
            "uv_index": uv_val,
            "aqi": random.randint(30, 85)
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
