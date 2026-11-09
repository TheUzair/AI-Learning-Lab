# 🏥 Project 04 — Medical Insurance Prediction API

A production-grade machine learning microservice serving a Scikit-Learn linear regression model via FastAPI, containerized with Docker, and managed with `uv`.

---

## 📌 Features

- **In-Memory Lifespan Inference**: Trained estimator (`insurance_model.joblib`) loaded once at startup for sub-millisecond predictions.
- **Strict Validation**: Pydantic v2 schemas validating demographic and actuarial ranges with informative HTTP 422 error payloads.
- **Automated Feature Preprocessing**: On-the-fly one-hot encoding for categorical variables (`sex`, `smoker`, `region`).
- **Health Probes**: Liveness (`/health/live`) and readiness (`/health/ready`) endpoints.
- **Interactive Documentation**: Swagger UI at `/docs` and ReDoc at `/redoc`.
- **Automated Testing**: Comprehensive Pytest suite covering positive paths, risk spreads, and validation boundaries.

---

## 🚀 Quick Start (Local)

### 1. Install Dependencies

```bash
uv sync
```

### 2. Run Tests

```bash
uv run pytest
```

### 3. Start Development Server

```bash
uv run uvicorn ml_api.main:app --reload
```

Visit the interactive documentation at `http://127.0.0.1:8000/docs`.

---

## 📡 Sample cURL Request

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "age": 32,
       "sex": "female",
       "bmi": 27.5,
       "children": 2,
       "smoker": false,
       "region": "northwest"
     }'
```

### Expected Response:

```json
{
  "predicted_charges": 6041.93,
  "currency": "USD"
}
```

---

## 🐳 Docker

### Build Image

```bash
docker build -t insurance-ml-api .
```

### Run Container

```bash
docker run -p 8000:8000 insurance-ml-api
```
