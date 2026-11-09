from enum import Enum
from pydantic import BaseModel, Field


# 1. Enums ensure the user can only pass exact expected string categories
class Sex(str, Enum):
    MALE = "male"
    FEMALE = "female"


class Region(str, Enum):
    NORTHEAST = "northeast"
    NORTHWEST = "northwest"
    SOUTHEAST = "southeast"
    SOUTHWEST = "southwest"


# 2. Input Request Schema: Enforces data types and realistic physical bounds
class InsuranceInput(BaseModel):
    age: int = Field(..., ge=18, le=120, description="Age of beneficiary (18 to 120)")
    sex: Sex = Field(..., description="Biological sex ('male' or 'female')")
    bmi: float = Field(..., ge=10.0, le=70.0, description="Body Mass Index in kg/m^2")
    children: int = Field(..., ge=0, le=20, description="Number of dependent children")
    smoker: bool = Field(..., description="Whether beneficiary is an active tobacco smoker (true/false)")
    region: Region = Field(..., description="Residential region in the US")

    # FastAPI uses this example in the interactive Swagger documentation (/docs)
    model_config = {
        "json_schema_extra": {
            "example": {
                "age": 32,
                "sex": "female",
                "bmi": 27.5,
                "children": 2,
                "smoker": False,
                "region": "northwest"
            }
        }
    }


# 3. Output Response Schema: What the client receives back
class PredictionOutput(BaseModel):
    predicted_charges: float = Field(..., description="Estimated annual medical charges in USD")
    currency: str = Field(default="USD", description="Currency code")


# 4. Health Check Schema: For uptime monitoring and Kubernetes/Render readiness checks
class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str