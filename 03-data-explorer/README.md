# 📊 Project 03 — Medical Insurance Data Explorer & ML Baseline

> **A comprehensive exploratory data analysis (EDA) and classical machine learning laboratory exploring health demographics, actuarial risk, and medical costs.**  
> *Part of the [AI Learning Lab](../README.md) curriculum.*

---

## 📌 Executive Summary

Before jumping into deep learning and complex neural architectures, an AI engineer must master the foundations: **how to inspect raw tabular data, extract statistical insights, prepare features, and train baseline machine learning models.**

In this project, we analyzed the **Medical Cost Personal Dataset** (1,338 records). We explored how demographic variables (age, BMI, children, sex, region) and lifestyle factors (smoking) influence medical charges. We then trained and evaluated two distinct types of supervised machine learning models:
1. **Continuous Regression**: Predicting insurance expenses in dollars (`LinearRegression`).
2. **Binary Classification**: Predicting smoker status (`LogisticRegression`).
3. **Artifact Persistence**: Serializing our trained model using `joblib` so it can be deployed as an independent REST API in **Project 04 (FastAPI ML Service)**.

---

## 📁 Repository Structure

```text
03-data-explorer/
├── data/
│   └── insurance.csv              # Clean 1,338-row Kaggle medical dataset
├── data_explorer.ipynb            # Interactive Jupyter analysis & modeling notebook
├── insurance_model.joblib         # Serialized Linear Regression model for Project 4
├── pyproject.toml                 # uv dependency management configuration
├── uv.lock                        # Deterministic 46-package dependency lockfile
├── SETUP_EXPLAINED.md             # In-depth breakdown of every CLI command & rationale
└── README.md                      # Comprehensive project documentation (this file)
```

---

## 🧬 Dataset Breakdown

The dataset (`data/insurance.csv`) consists of **1,338 rows** and **7 attributes** with **zero missing values**:

| Feature | Type | Range / Values | Description |
| :--- | :--- | :--- | :--- |
| **`age`** | Integer | 18 – 64 (mean: 39.2) | Age of primary beneficiary |
| **`sex`** | Categorical | `female` (662), `male` (676) | Biological gender |
| **`bmi`** | Float | 15.96 – 53.13 (mean: 30.66) | Body Mass Index ($\text{kg} / \text{m}^2$). Normal: 18.5–24.9 |
| **`children`** | Integer | 0 – 5 (mean: 1.09) | Number of dependent children/dependents covered |
| **`smoker`** | Categorical | `yes` (274), `no` (1,064) | Active smoking status |
| **`region`** | Categorical | `southwest`, `southeast`, `northwest`, `northeast` | Beneficiary's residential area in the US |
| **`charges`** | Float | \$1,121.87 – \$63,770.43 (mean: \$13,270.42) | Individual medical costs billed by health insurance |

---

## 📈 Exploratory Data Analysis (EDA) & The 3 Visualizations

Understanding relationships in the data before touching a machine learning algorithm is critical. We used `matplotlib` and `seaborn` to render three primary plots:

### 1. Target Variable Distribution (`charges`)
* **Chart**: Histogram overlaid with Kernel Density Estimation (KDE).
* **Observation**: Strongly **right-skewed** (unimodal peak around \$2,000–\$9,000 with an extended long tail reaching \$63,000).
* **Takeaway**: The median charge is **\$9,382**, while the mean is **\$13,270**. A small minority of high-expense patients significantly pull up the national average.

### 2. The Smoking Impact (`charges` vs. `smoker`)
* **Chart**: Two-class categorical boxplot (`no` vs. `yes`).
* **Observation**: 
  * **Non-smokers**: Interquartile range (IQR) sits tightly between \$4,000 and \$11,000; charges almost never exceed \$15,000 (barring rare surgical outliers).
  * **Smokers**: The median charge jumps to over **\$34,000**, with the upper quartile reaching beyond \$45,000.
* **Takeaway**: Smoking is by far the single heaviest determinant of medical billing.

### 3. The Multi-Tier Interaction (`age` vs. `charges` by `smoker`)
* **Chart**: Multi-dimensional scatter plot displaying `age` on the X-axis, `charges` on the Y-axis, colored by `smoker`.
* **Observation**: The scatter plot reveals **three distinct, upward-sloping parallel bands**:
  1. **Bottom Band (Non-smokers)**: Costs rise steadily from \$2,000 at age 18 to ~\$12,000 at age 64.
  2. **Middle Band (Smokers with normal BMI < 30)**: Costs start around \$15,000 and climb to ~\$30,000.
  3. **Top Band (Smokers with high BMI ≥ 30)**: Compounded health risk pushes baseline charges to \$35,000–\$60,000.

---

## ⚙️ Data Preprocessing & Pipeline

Machine learning algorithms require pure numerical matrices ($X$). We prepared the data in four steps:

1. **One-Hot Encoding**:
   Converted string categoricals (`sex`, `smoker`, `region`) into binary indicator columns ($0$ or $1$) using `pd.get_dummies(df, drop_first=True)`.
   * *Why `drop_first=True`?* If `smoker_yes = 0`, the patient is unambiguously a non-smoker. Retaining both columns causes **multicollinearity** (the dummy variable trap), which destabilizes linear models.
2. **Feature/Target Separation**:
   * Features matrix ($X$): 8 predictor columns (`age`, `bmi`, `children`, `sex_male`, `smoker_yes`, `region_northwest`, `region_southeast`, `region_southwest`).
   * Target vector ($y$): Continuous `charges` (for regression) or binary `smoker_yes` (for classification).
3. **Train/Test Splitting**:
   Partitioned the data using Scikit-Learn's `train_test_split`:
   * **80% Training set** (1,070 patients) — used exclusively to fit model parameters.
   * **20% Test set** (268 patients) — unseen holdout set to test generalization.
   * `random_state=42` was specified to ensure exact deterministic reproducibility.

---

## 🤖 Models & Performance Metrics

### Model 1: Linear Regression (Predicting `charges`)

We fitted an Ordinary Least Squares (OLS) `LinearRegression` model:
$$\hat{y} = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_n x_n$$

```python
from sklearn.linear_model import LinearRegression
reg_model = LinearRegression()
reg_model.fit(X_train, y_train)
```

#### Evaluation Metrics:
* **$R^2$ Score (Coefficient of Determination)**: **`0.784` (78.4%)**
  * *Meaning*: 78.4% of the variance in patient charges is directly explained by this linear combination of features.
* **Mean Absolute Error (MAE)**: **`$4,181.19`**
  * *Meaning*: On average, our prediction is within ~\$4,181 of the patient's actual billed expense.
* **Root Mean Squared Error (RMSE)**: **`$5,796.28`**
  * *Meaning*: Penalizes large outlier misses more heavily than MAE, giving an upper threshold on expected variance.

---

### Model 2: Logistic Regression (Predicting `smoker_yes`)

We framed a classification problem: Can we predict whether a patient is a smoker based on their age, BMI, region, dependents, and medical charges?

```python
from sklearn.linear_model import LogisticRegression
clf_model = LogisticRegression(max_iter=1000)
clf_model.fit(x_cls_train, y_cls_train)
```

#### 💡 Key Engineering Lesson: Optimization Convergence
During the initial run with default parameters, Scikit-Learn raised:
```text
ConvergenceWarning: lbfgs failed to converge after 100 iterations.
```
* **Why it happened**: Logistic Regression uses an iterative numerical solver (`lbfgs`) that descends the log-loss error curve step-by-step. The default limit of 100 steps was exhausted before reaching the mathematical minimum.
* **How we resolved it**: Increased `max_iter=1000`, allowing the optimizer sufficient iterations to converge cleanly without warning.

#### Evaluation Metrics:
* **Accuracy**: **`96.6%`** (259 correct out of 268 test cases)

#### Confusion Matrix:
$$\begin{bmatrix} \text{True Negatives (208)} & \text{False Positives (6)} \\ \text{False Negatives (3)} & \text{True Positives (51)} \end{bmatrix}$$

* **208 True Negatives**: Correctly identified non-smokers.
* **51 True Positives**: Correctly identified active smokers.
* **6 False Positives**: Non-smokers mispredicted as smokers.
* **3 False Negatives**: Smokers that the model failed to detect.

#### Detailed Classification Report:
| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| **Non-Smoker (False)** | `0.99` | `0.97` | `0.98` | 214 |
| **Smoker (True)** | `0.89` | `0.94` | `0.92` | 54 |
| **Overall Weighted Avg** | **`0.97`** | **`0.97`** | **`0.97`** | **268** |

*Notice the **Recall of 0.94 (94%)** on smokers:* In healthcare and insurance actuarial work, recall (catching active smokers) is prioritized over precision to avoid underpricing catastrophic health risks.

---

## 💾 Model Serialization (`joblib`)

To bridge the gap between experimental notebooks and production software engineering, we serialized the trained regression model to disk:

```python
import joblib
joblib.dump(reg_model, "insurance_model.joblib")
```

* **File output**: `03-data-explorer/insurance_model.joblib` (1,049 bytes).
* **Why `joblib` over `pickle`?** `joblib` is optimized for Python objects containing large internal NumPy arrays and Scikit-Learn estimators, resulting in faster disk I/O and lower memory overhead.
* **The Bridge to Project 04**: In Project 4, we will build a FastAPI backend that reads `insurance_model.joblib` into memory on startup and computes instant predictions via POST requests to `/predict`.

---

## 🚀 How to Run & Reproduce This Notebook

### Prerequisites
* Python 3.11+
* `uv` package manager ([astral.sh/uv](https://docs.astral.sh/uv/))

### Step 1: Clone and Navigate
```powershell
git clone https://github.com/TheUzair/AI-Learning-Lab.git
cd AI-Learning-Lab/03-data-explorer
```

### Step 2: Install Virtual Environment
```powershell
# uv automatically creates .venv and resolves dependencies from uv.lock
uv sync
```

### Step 3: Register the Jupyter Kernel
```powershell
uv run python -m ipykernel install --user --name=03-data-explorer --display-name "Python (03-data-explorer)"
```

### Step 4: Open & Execute
1. Open the folder in VS Code or Antigravity IDE.
2. Open `data_explorer.ipynb`.
3. In the top-right corner, select the kernel **`Python (03-data-explorer)`**.
4. Click **Run All** (or run cell-by-cell with `Shift + Enter`).

---

## 🧠 Key Takeaways for Future Projects

1. **Feature Engineering trumps complex algorithms**: The massive predictive power in this dataset came from smoking status and age interactions, not complex hyperparameter tuning.
2. **Never deploy without holdout validation**: Always evaluate models against an untouched test set (`X_test`) to verify real-world generalization.
3. **Always examine Residuals and Outliers**: An $R^2$ of 0.78 is a strong linear baseline, but the non-linear "step" jumps caused by BMI > 30 and smoking show that tree-based models (like Random Forests or XGBoost) or polynomial feature terms would push accuracy even higher.
4. **Notebooks are lab notebooks, not production code**: Notebooks are built for rapid visual iteration; production services require isolated modules, type hints, and containerization (which we tackle in Project 4).
