from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load model and scaler
model = joblib.load("model/neuro_model.pkl")
scaler = joblib.load("model/neuro_scaler.pkl")

@app.route("/")
def home():
    return "Neuro Motor Assessment API is running"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    try:
        tremor = float(data["tremor"])
        grip = float(data["grip"])
        tapping = float(data["tapping"])
        alternation = float(data["alternation"])
    except:
        return jsonify({"error": "Invalid or missing input values"}), 400

    input_data = np.array([[tremor, grip, tapping, alternation]])
    input_scaled = scaler.transform(input_data)

    risk = model.predict_proba(input_scaled)[0][1]

    if risk < 0.3:
        level = "Low"
    elif risk < 0.6:
        level = "Moderate"
    else:
        level = "High"

    return jsonify({
        "risk_probability": round(float(risk), 3),
        "severity_level": level
    })

if __name__ == "__main__":
    app.run(debug=True)
