# 📊 Project 03 — Data Explorer & ML Baseline

An exploratory data analysis (EDA) and classical machine learning laboratory exploring medical insurance demographics and costs.

---

## 🎯 Deliverables

1. **Exploratory Data Analysis (EDA)**: Interactive data inspection with summary statistics and correlation heatmaps.
2. **Visualizations**: Three core statistical plots detailing target distribution, demographic variance, and risk factors.
3. **Regression Model**: Linear/Ridge regression predicting insurance charges (`$`) with RMSE, MAE, and $R^2$ metrics.
4. **Classification Model**: Logistic regression classifying smoker status with confusion matrix and precision/recall analysis.
5. **Model Export**: Serialized best-performing estimator (`.joblib`) ready for deployment in **Project 04 (FastAPI ML Service)**.

---

## 📁 Project Structure

```text
03-data-explorer/
├── data/
│   └── insurance.csv         # Medical cost personal dataset (1,338 rows)
├── data_explorer.ipynb       # Interactive Jupyter analysis notebook
├── pyproject.toml            # Project dependencies and environment specs
└── README.md
```

---

## ⚡ Environment & Setup

This project uses `uv` for lightning-fast virtual environment management and package resolution:

```powershell
cd 03-data-explorer

# Synchronize dependencies
uv sync

# Run Jupyter kernel inside the virtual environment
uv run python -m ipykernel install --user --name=data-explorer-env
```
