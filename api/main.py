from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import logging
import base64

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS - FIXED VERSION with extremely permissive settings for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins - important for debugging
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
    max_age=86400,  # Cache preflight requests for 24 hours
)

# Configuration model
class GeoServerConfig(BaseModel):
    url: str = os.getenv("GEOSERVER_URL", "http://localhost:3000/geoserver/rest/about/system-status.json")
    username: str = os.getenv("GEOSERVER_USERNAME", "admin")
    password: str = os.getenv("GEOSERVER_PASSWORD", "geoserver")
    timeout: int = int(os.getenv("GEOSERVER_TIMEOUT", "5"))

# Dependency to provide configuration
def get_geoserver_config() -> GeoServerConfig:
    return GeoServerConfig()

# Add a custom response function to ensure CORS headers are set
def create_cors_response(content, status_code=200):
    response = JSONResponse(content=content, status_code=status_code)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.options("/geoserver-status")
async def options_geoserver_status():
    # Handle preflight requests explicitly
    return create_cors_response({"detail": "OK"})

@app.get("/geoserver-status")
async def get_geoserver_status(config: GeoServerConfig = Depends(get_geoserver_config)):
    # Fix Basic Auth header
    auth_string = f"{config.username}:{config.password}"
    b64_auth = base64.b64encode(auth_string.encode()).decode()
    
    headers = {
        "User-Agent": "FastAPI/GeoServerClient",
        "Accept": "application/json",
        "Authorization": f"Basic {b64_auth}",
    }
    
    try:
        logger.info(f"Making request to GeoServer: {config.url}")
        response = requests.get(config.url, headers=headers, timeout=config.timeout)
        response.raise_for_status()
        
        content_type = response.headers.get("Content-Type", "")
        logger.info(f"Response received with Content-Type: {content_type}")
        
        # More tolerant content type checking
        if "json" not in content_type.lower():
            logger.warning(f"Response might not be JSON: {content_type}")
            # Try to parse it anyway, it might still be JSON with incorrect Content-Type
            try:
                data = response.json()
                logger.info("Successfully parsed JSON despite content type")
                return create_cors_response(data)
            except ValueError:
                logger.error(f"Response is not valid JSON: {response.text[:200]}")
                raise HTTPException(status_code=500, detail="GeoServer returned non-JSON response")
        
        return create_cors_response(response.json())
        
    except requests.Timeout:
        logger.error("Request to GeoServer timed out")
        raise HTTPException(status_code=504, detail="GeoServer request timed out")
    except requests.ConnectionError:
        logger.error("Failed to connect to GeoServer")
        raise HTTPException(status_code=503, detail="Failed to connect to GeoServer")
    except requests.HTTPError as e:
        logger.error(f"HTTP error from GeoServer: {str(e)}")
        status_code = e.response.status_code if hasattr(e, 'response') else 500
        raise HTTPException(status_code=status_code, detail=f"GeoServer error: {str(e)}")
    except requests.RequestException as e:
        logger.error(f"Error fetching GeoServer status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching GeoServer status: {str(e)}")
    except ValueError as e:
        logger.error(f"Failed to parse GeoServer response: {str(e)}")
        raise HTTPException(status_code=500, detail="Invalid JSON response from GeoServer")

# Health check endpoint - helps with debugging
@app.get("/health")
async def health_check():
    return {"status": "ok"}