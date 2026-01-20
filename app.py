# app.py
from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

# Create Flask app
app = Flask(__name__)

# Load the trained model and feature list
MODEL_PATH = "model/parkinsons_rf_model.pkl"
FEATURES_PATH = "model/model_features.pkl"

if not os.path.exists(MODEL_PATH) or not os.path.exists(FEATURES_PATH):
    raise FileNotFoundError("Make sure 'parkinsons_rf_model.pkl' and 'model_features.pkl' exist in the 'model/' folder!")

model = joblib.load(MODEL_PATH)
model_features = joblib.load(FEATURES_PATH)

@app.route('/')
def home():
    return "Parkinson's Prediction API is running!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        input_json = request.get_json()
        if not input_json:
            return jsonify({"error": "No input data provided"}), 400

        # Convert JSON to DataFrame
        input_df = pd.DataFrame([input_json])

        # Reorder / fill missing columns
        input_df = input_df.reindex(columns=model_features, fill_value=0)

        # Predict probability of Parkinson's
        risk = model.predict_proba(input_df)[0][1]  # probability of class 1

        return jsonify({"parkinsons_risk": float(risk)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
