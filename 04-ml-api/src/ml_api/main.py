
import logging
import colorlog
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from ml_api.inference import model_service
from ml_api.schemas import HealthResponse, InsuranceInput, PredictionOutput


# ---------------------------------------------------------
# 1. Configure application logging
# ---------------------------------------------------------

# Configure colored logging for better readability in the terminal.
handler = colorlog.StreamHandler()

handler.setFormatter(
    colorlog.ColoredFormatter(
        "%(log_color)s%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        log_colors={
            "DEBUG": "cyan",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "bold_red",
        },
    )
)

# Configure the root logger to use the colored handler.
logging.basicConfig(
    level=logging.INFO,
    handlers=[handler],
)

# Create a logger specifically for this module.
logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# 2. Configure allowed frontend origins
# ---------------------------------------------------------

# Read frontend URLs from an environment variable.
# Multiple origins should be separated by commas.
#
# Example:
# FRONTEND_ORIGINS=http://localhost:3000,https://myapp.com
#
# If the environment variable is not provided, use local
# development origins as the default.
ALLOWED_ORIGINS = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173",
).split(",")

# Remove accidental whitespace from configured URLs.
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS]


# ---------------------------------------------------------
# 3. Manage model lifecycle
# ---------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage resources during the FastAPI application lifecycle.

    Code before yield executes once during application startup.
    Code after yield executes during application shutdown.
    """

    try:
        # Load the trained Scikit-Learn model into memory.
        # This happens only once when the application starts,
        # rather than loading the model for every prediction request.
        model_service.load()

        logger.info(
            "Scikit-Learn Insurance Model loaded successfully into memory."
        )

    except Exception:
        # Log the complete internal exception for debugging.
        logger.exception("Failed to load the ML model during startup.")

        # Re-raise the exception so the application does not
        # start in a state where prediction requests cannot work.
        raise

    # Application startup is complete.
    # FastAPI can now start accepting incoming requests.
    yield

    # This section executes when the application shuts down.
    logger.info("FastAPI server shutting down...")


# ---------------------------------------------------------
# 4. Initialize FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="Medical Insurance Cost Prediction API",
    description=(
        "A production-ready machine learning microservice "
        "serving a Scikit-Learn regression model."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------
# 5. Configure CORS middleware
# ---------------------------------------------------------

# CORS (Cross-Origin Resource Sharing) controls which frontend
# origins are allowed to communicate with this backend.
#
# Only the origins configured in ALLOWED_ORIGINS are permitted.
# Avoid allow_origins=["*"] in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# ---------------------------------------------------------
# 6. Root endpoint
# ---------------------------------------------------------

@app.get("/", tags=["General"])
def root():
    """Welcome endpoint providing useful API navigation links."""

    return {
        "message": "Welcome to the Medical Insurance Prediction API",
        "docs_url": "/docs",
        "health_url": "/health",
        "liveness_url": "/health/live",
        "readiness_url": "/health/ready",
        "predict_url": "/predict",
    }


# ---------------------------------------------------------
# 7. Liveness health check
# ---------------------------------------------------------

@app.get("/health/live", tags=["Health"])
def liveness_check():
    """
    Check whether the FastAPI application process is running.

    This endpoint does not check whether the ML model is loaded.
    It simply confirms that the application can respond to requests.
    """

    return {
        "status": "alive"
    }


# ---------------------------------------------------------
# 8. Readiness health check
# ---------------------------------------------------------

@app.get(
    "/health/ready",
    response_model=HealthResponse,
    tags=["Health"],
)
def readiness_check():
    """
    Check whether the application is ready to handle predictions.

    Unlike liveness, readiness also checks whether the trained
    ML model has been successfully loaded into memory.
    """

    is_ready = model_service.is_loaded

    return HealthResponse(
        status="healthy" if is_ready else "degraded",
        model_loaded=is_ready,
        model_version="1.0.0",
    )


# ---------------------------------------------------------
# 9. Backward-compatible health endpoint
# ---------------------------------------------------------

@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
)
def health_check():
    """
    Keep the original /health endpoint available.

    It behaves like the readiness check, allowing existing
    clients and monitoring systems to continue using /health.
    """

    return readiness_check()


# ---------------------------------------------------------
# 10. Insurance prediction endpoint
# ---------------------------------------------------------

@app.post(
    "/predict",
    response_model=PredictionOutput,
    status_code=status.HTTP_200_OK,
    tags=["Machine Learning"],
)
def predict_insurance_cost(data: InsuranceInput):
    """
    Calculate estimated annual medical insurance charges in USD.

    FastAPI first validates the incoming request using the
    InsuranceInput Pydantic schema.

    The validated data is then passed to the ML inference service.
    """

    # Step 1: Check whether the trained model is available.
    # Return HTTP 503 if the model is not ready for predictions.
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not ready for inference.",
        )

    try:
        # Step 2: Pass validated input to the ModelService.
        # Internally, it preprocesses features and calls model.predict().
        charge = model_service.predict(data)

        # Step 3: Wrap the prediction in the expected response schema.
        # FastAPI serializes this Pydantic object into JSON.
        return PredictionOutput(
            predicted_charges=charge,
            currency="USD",
        )

    except Exception:
        # Log the complete exception and traceback internally.
        # This helps developers identify the actual cause of failure.
        logger.exception("An error occurred during model inference.")

        # Return a generic error message to the client.
        # Avoid exposing internal paths, implementation details,
        # stack traces, or other potentially sensitive information.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while generating the prediction.",
        )
