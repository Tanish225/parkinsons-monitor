import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score

df = pd.read_csv("data/neuro_dataset.csv")

X = df[["tremor", "grip", "tapping", "alternation"]]
y = (df["severity"] >= 50).astype(int)

# Noise to prevent 100% accuracy
X = X + np.random.normal(0, 0.015, X.shape)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

model = RandomForestClassifier(
    n_estimators=120,
    max_depth=7,
    min_samples_split=5,
    random_state=42
)

model.fit(X_train, y_train)

pred = model.predict(X_test)
acc = accuracy_score(y_test, pred)

print(f"Accuracy: {acc*100:.2f}%")

joblib.dump(model, "model/neuro_model.pkl")
joblib.dump(scaler, "model/neuro_scaler.pkl")

print("Model saved")
