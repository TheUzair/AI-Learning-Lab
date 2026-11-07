# 🛠️ Project 03: Complete Setup & Command Breakdown

This document provides a detailed, step-by-step breakdown of every single terminal command executed during the initialization of **Project 03 (`03-data-explorer`)**. It explains what each command did, why it was necessary, what files it generated, and what would happen if it were omitted.

---

## 🧭 Overview of Executed Commands

| #           | Command Executed                                                          | Purpose                                                   | Primary Output                          |
| ----------- | ------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------- |
| **1** | `uv init --python 3.11`                                                 | Scaffold modern Python project pinned to 3.11             | `pyproject.toml`, `.python-version` |
| **2** | `uv add pandas numpy matplotlib seaborn scikit-learn ipykernel joblib`  | Resolve & install all data science & ML dependencies      | `.venv/`, `uv.lock`                 |
| **3** | `uv run python -c "import os, urllib.request; ..."`                     | Download clean Kaggle `insurance.csv`                   | `data/insurance.csv`                  |
| **4** | `uv run python -m ipykernel install --user --name=03-data-explorer ...` | Register virtual environment into Jupyter kernel registry | Kernel spec in user app data            |

---

## Command 1: `uv init --python 3.11`

```powershell
uv init --python 3.11
```

### 1. What does it do?

Initializes a new Python project in the current directory (`03-data-explorer`) managed by `uv`, and explicitly locks the Python version to **Python 3.11**.

### 2. Why did we need it?

* In modern Python engineering, we avoid global system Python installations.
* Pinning Python to **3.11** is critical for machine learning: many pre-compiled binary packages (wheels) for `scikit-learn`, `numpy`, and `scipy` have maximum stability and compatibility on Python 3.11 (whereas bleeding-edge Python versions like 3.14+ often lack pre-built wheels and cause compilation errors on Windows).

### 3. What files were created?

* `pyproject.toml`: The standardized declarative configuration file describing the project name, version, and dependencies.
* `.python-version`: A tiny file containing `3.11`, telling `uv` to always use Python 3.11 inside this folder.

### 4. What if we didn't run it?

Without a project declaration (`pyproject.toml`), `uv` wouldn't know where project boundaries begin, and any packages installed would either bleed into your global user environment or fail to resolve reproducible lockfiles.

---

## Command 2: `uv add pandas numpy matplotlib seaborn scikit-learn ipykernel joblib`

```powershell
uv add pandas numpy matplotlib seaborn scikit-learn ipykernel joblib
```

### 1. What does it do?

Resolves compatible versions for all 7 libraries, creates an isolated virtual environment at `03-data-explorer/.venv`, downloads pre-built wheels, and generates a deterministic lockfile (`uv.lock`).

### 2. Why did we need each specific library?

| Library                    | What it does                                                             | Why it is indispensable for Project 3                                                                                                     |
| :------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **`pandas`**       | High-performance tabular data structures (`DataFrame`).                | Loads CSV files into memory, handles missing values, filters, groups, and prepares data matrices.                                         |
| **`numpy`**        | N-dimensional numerical arrays and vector math written in C.             | The foundational mathematical engine powering Pandas and Scikit-Learn behind the scenes.                                                  |
| **`matplotlib`**   | Low-level plotting and chart rendering engine.                           | Draws the actual coordinate axes, canvases, and figures.                                                                                  |
| **`seaborn`**      | High-level statistical visualization library built on top of Matplotlib. | Generates beautiful distribution plots, box plots, and correlation heatmaps with single-line commands.                                    |
| **`scikit-learn`** | The industry standard machine learning toolkit.                          | Provides `train_test_split`, `LinearRegression`, `LogisticRegression`, and evaluation metrics (`r2_score`, `confusion_matrix`). |
| **`ipykernel`**    | The IPython Kernel backend.                                              | Allows notebook frontends (like VS Code / Antigravity) to communicate with the Python `.venv` process over WebSockets/ZeroMQ.           |
| **`joblib`**       | Fast object serialization and persistence.                               | Saves our trained ML model to a binary `.joblib` file so **Project 4** can serve predictions via FastAPI without retraining.      |

### 3. What files were created?

* `03-data-explorer/.venv/`: An isolated sandbox containing Python 3.11 binaries and all installed packages.
* `uv.lock`: An exact snapshot of 46 resolved packages, ensuring identical builds across any computer.

### 4. What if we didn't run it?

Any attempt to run `import pandas` or `from sklearn...` in your code would throw `ModuleNotFoundError: No module named 'pandas'`.

---

## Command 3: Download `insurance.csv`

```powershell
uv run python -c "import os, urllib.request; os.makedirs('data', exist_ok=True); urllib.request.urlretrieve('https://raw.githubusercontent.com/stedy/Machine-Learning-with-R-datasets/master/insurance.csv', 'data/insurance.csv'); print('Success! File size:', os.path.getsize('data/insurance.csv'))"
```

### 1. What does it do?

1. Executes a one-line Python script using the `.venv` Python runtime (`uv run python -c ...`).
2. Creates the `03-data-explorer/data/` folder if it does not already exist (`os.makedirs`).
3. Downloads the official clean 1,338-row Medical Cost Personal Dataset from GitHub directly into `data/insurance.csv`.
4. Prints the file size (`54,288 bytes`) to verify data integrity.

### 2. Why did we need it?

* Project 3 requires a real tabular dataset to perform Exploratory Data Analysis (EDA) and build baseline regression/classification models.
* Automating the download ensures the exact dataset is placed in the exact directory without having to manually hunt for Kaggle download links or log in through a browser.

### 3. What files were created?

* `03-data-explorer/data/insurance.csv`: 1,338 rows with columns:
  `age`, `sex`, `bmi`, `children`, `smoker`, `region`, `charges`.

---

## Command 4: `uv run python -m ipykernel install ...`

```powershell
uv run python -m ipykernel install --user --name=03-data-explorer --display-name "Python (03-data-explorer)"
```

### 1. What does it do?

Registers the newly created virtual environment (`03-data-explorer/.venv`) into your system's global Jupyter kernel specifications directory (`AppData\Roaming\jupyter\kernels\03-data-explorer`).

### 2. Why did we need it?

* When you open a `.ipynb` notebook file inside Antigravity or VS Code, the editor needs to know **which** Python environment to use.
* By registering a named kernel spec with the friendly display name `"Python (03-data-explorer)"`, Antigravity's kernel picker dropdown can immediately discover and attach to this project's isolated environment.

### 3. What if we didn't run it?

When clicking "Select Kernel" in the notebook, your editor might default to a global system Python installation (like Python 3.14) which does not have `pandas` or `scikit-learn` installed, causing notebook cells to fail with `ImportError`.

---

## 💡 Summary: Why Not Plain `pip`?

We used `uv` instead of standard `python -m venv` and `pip install` because:

1. **Speed:** `uv` resolved and installed 46 packages in ~11 seconds (compared to 90+ seconds with standard `pip`).
2. **Determinism:** It automatically handles Python version management and generates lockfiles without manual version conflict troubleshooting.
3. **Reproducibility:** Anyone pulling this repo can run `uv sync` and reproduce the exact environment instantly.

---

## 📓 The Notebook File: `data_explorer.ipynb`

### 1. How was this file created? Was it a terminal command?

**No terminal command creates this.**

Just like you would create `index.js`, `main.py`, or `README.md`, an `.ipynb` file is simply a document you create:

* **In Antigravity / VS Code:** Right-click the folder $\rightarrow$ **New File** $\rightarrow$ name it `data_explorer.ipynb`.
* **Via Command Palette:** Press `Ctrl + Shift + P` $\rightarrow$ type `Create: New Jupyter Notebook` $\rightarrow$ save it.
* **Under the hood:** An `.ipynb` file is just a standard JSON file containing an array of `"cells"` (with types `"code"` or `"markdown"`), their source code strings, and their rendered outputs. I wrote the initial JSON template so you would have starter verification cells ready to go.

### 2. Why did we create it? (Why is it needed?)

* **It is the core deliverable of Project 3.**
  * In Project 1, your deliverable was `main.py` (CLI).
  * In Project 2, your deliverable was `web_chatbot/main.py` + `frontend/`.
  * In Project 3, your deliverable per `BATTLE_PLAN.md` is: **"Data explorer notebook — public notebook on GitHub with charts and a 200-word summary."**
* It is the interactive canvas where:
  1. The dataset is loaded and sliced in memory.
  2. Data distributions and correlation charts render right beneath your code.
  3. Machine learning models (Linear Regression & Logistic Regression) are trained.
  4. The ~200-word summary is written in Markdown alongside the actual figures.

### 3. What if we don't use it?

If you did not use a `.ipynb` notebook and instead used a plain `main.py` script:

1. **No in-memory iteration:** Changing a chart label or tweaking a line of code requires Python to re-read the CSV and re-execute everything from line 1.
2. **Blocking GUI popups:** Matplotlib plots would open in external OS windows that freeze terminal execution until you manually close them.
3. **No visual artifact on GitHub:** A `.py` file only shows raw code text. GitHub automatically renders `.ipynb` files as rich interactive reports displaying your graphs, data tables, and metrics for recruiters and collaborators to view without installing Python.
