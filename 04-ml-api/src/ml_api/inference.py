from pathlib import Path
import joblib
import numpy as np

from ml_api.schemas import InsuranceInput, Region, Sex

# Path to 04-ml-api/model/insurance_model.joblib
# Path(__file__) # This converts the file path into a Python Path object.
# resolve() converts the path to an absolute path, normalizes "." and "..", and resolves symbolic links where possible.
# In pathlib, the / operator joins path components correctly, regardless of the operating system (Windows/Linux).
# self refers to the current object of the class.
DEFAULT_MODEL_PATH = Path(__file__).resolve().parent.parent.parent / "model" / "insurance_model.joblib"

class ModelService:

    def __init__(self, model_path: Path = DEFAULT_MODEL_PATH):
        # Store the model file location. This also allows a custom model
        # path to be provided instead of using the default location.
        self.model_path = model_path

        # Initially, no trained model is loaded into memory.
        self.model = None

        # Example: A custom model path can be passed when creating the instance:
        # ModelService(Path("custom_models/insurance_model.joblib"))
        # If no custom path is provided, DEFAULT_MODEL_PATH is used.

    def load(self) -> None:
        """Load the trained Scikit-Learn model into memory."""

        # Verify that the model file actually exists before attempting
        # to load it. Raise an error if the path is incorrect.
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model file not found at: {self.model_path}"
            )

        # Deserialize the saved model (.joblib) and store the trained
        # estimator in memory so it can be reused for predictions.
        self.model = joblib.load(self.model_path)

    @property
    def is_loaded(self) -> bool:
        """Check whether the trained model is available in memory."""

        # Return True if load() has successfully assigned a model;
        # otherwise, return False.
        return self.model is not None

    def preprocess(self, data: InsuranceInput) -> np.ndarray:
        """
        Transform validated user input into the numerical feature format
        expected by the trained regression model.
        """

        # Convert categorical sex into a binary numerical feature:
        # Male = 1, Female = 0.
        sex_male = 1.0 if data.sex == Sex.MALE else 0.0

        # Convert the smoker status into a binary numerical feature:
        # Smoker = 1, Non-smoker = 0.
        smoker_yes = 1.0 if data.smoker else 0.0

        # Apply one-hot encoding to the region.
        # Northeast is the baseline category, represented by all zeros.
        region_northwest = (
            1.0 if data.region == Region.NORTHWEST else 0.0
        )
        region_southeast = (
            1.0 if data.region == Region.SOUTHEAST else 0.0
        )
        region_southwest = (
            1.0 if data.region == Region.SOUTHWEST else 0.0
        )

        # Combine all eight features in exactly the same order
        # used when training the regression model.
        feature_vector = [
            float(data.age),
            float(data.bmi),
            float(data.children),
            sex_male,
            smoker_yes,
            region_northwest,
            region_southeast,
            region_southwest,
        ]

        # Scikit-Learn expects a 2D array:
        # (1, 8) means 1 prediction sample containing 8 features.
        # The outer list adds the required sample dimension.
        return np.array([feature_vector])

    def predict(self, data: InsuranceInput) -> float:
        """Generate predicted insurance charges."""

        # Ensure the trained model has been loaded before prediction.
        # Prevents calling predict() on an uninitialized model.
        if not self.is_loaded:
            raise RuntimeError(
                "Model is not loaded. Call .load() first."
            )

        # Step 1: Convert the validated input into numerical features.
        features = self.preprocess(data)

        # Step 2: Pass the feature array to the trained model.
        # predict() returns an array of predictions; [0] extracts
        # the prediction for our single input sample.
        raw_prediction = self.model.predict(features)[0]

        # Step 3: Insurance charges cannot be negative.
        # Clamp any negative prediction to zero.
        prediction = max(0.0, float(raw_prediction))

        # Step 4: Round the final predicted amount to two decimal places
        # and return it as a Python float.
        return round(prediction, 2)


# Create one shared ModelService instance for the FastAPI application.
# This allows the loaded model to be reused across API requests
# instead of loading the model separately for every prediction.
model_service = ModelService()
