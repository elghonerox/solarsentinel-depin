from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from models.isolation_forest import IsolationForestModel

"""
SolarSentinel AI Server

Provides ML-based anomaly detection for solar panel sensor data.
Uses Isolation Forest algorithm (unsupervised learning) to detect
failure patterns 48 hours before they occur.

IMPORTANT: Model is trained on SYNTHETIC data based on documented
African solar panel conditions. Real-world validation required.
"""

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s]: %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize ML model
try:
    model = IsolationForestModel()
    logger.info("✅ Isolation Forest model initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize model: {e}")
    model = None


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    Returns model status and readiness
    """
    return jsonify({
        'status': 'ok' if model and model.is_trained else 'error',
        'model_trained': model.is_trained if model else False,
        'model_version': 'v1.0-isolation-forest',
        'training_samples': model.training_samples if model else 0
    }), 200


@app.route('/predict', methods=['POST'])
def predict():
    """
    Prediction endpoint
    
    Accepts sensor data and returns anomaly prediction
    
    Request body:
    {
        "voltage": float (9-13V expected),
        "temperature": float (20-45°C expected),
        "power_output": float (50-250W expected)
    }
    
    Returns:
    {
        "prediction": "Normal" | "Failure Likely",
        "confidence": float (0-1),
        "model_version": string
    }
    """
    try:
        # Validate request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract features
        voltage = data.get('voltage')
        temperature = data.get('temperature')
        power_output = data.get('power_output')
        
        # Validate required fields
        if voltage is None or temperature is None or power_output is None:
            return jsonify({
                'error': 'Missing required fields: voltage, temperature, power_output'
            }), 400
        
        # Validate ranges (warn but don't reject)
        if not (8 <= voltage <= 14):
            logger.warning(f"Voltage out of expected range: {voltage}V")
        if not (15 <= temperature <= 50):
            logger.warning(f"Temperature out of expected range: {temperature}°C")
        if not (0 <= power_output <= 300):
            logger.warning(f"Power output out of expected range: {power_output}W")
        
        # Make prediction
        if not model or not model.is_trained:
            return jsonify({
                'error': 'Model not trained. Run training first.'
            }), 500
        
        prediction_result = model.predict(voltage, temperature, power_output)
        
        logger.info(f"Prediction: {prediction_result['prediction']} "
                   f"(confidence: {prediction_result['confidence']:.3f})")
        
        return jsonify(prediction_result), 200
        
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500


@app.route('/retrain', methods=['POST'])
def retrain():
    """
    Retrain model endpoint
    
    Accepts new training data and retrains the model
    Useful for incorporating real-world field data
    
    Request body:
    {
        "training_data": [
            {"voltage": float, "temperature": float, "power_output": float},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        training_data = data.get('training_data')
        
        if not training_data or len(training_data) < 100:
            return jsonify({
                'error': 'Need at least 100 training samples'
            }), 400
        
        # Retrain model
        model.train(training_data)
        
        logger.info(f"Model retrained with {len(training_data)} samples")
        
        return jsonify({
            'status': 'success',
            'training_samples': len(training_data),
            'message': 'Model retrained successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Retraining failed: {e}")
        return jsonify({
            'error': 'Retraining failed',
            'message': str(e)
        }), 500


@app.route('/model/info', methods=['GET'])
def model_info():
    """
    Get model information
    Returns training metadata and performance metrics
    """
    if not model:
        return jsonify({'error': 'Model not initialized'}), 500
    
    return jsonify(model.get_info()), 200


if __name__ == '__main__':
    logger.info("🚀 Starting SolarSentinel AI Server...")
    logger.info("📊 Training model on synthetic data...")
    
    # Train model on startup (using synthetic data)
    if model:
        try:
            from data.generate_training_data import generate_synthetic_data
            training_data = generate_synthetic_data(num_samples=10000)
            model.train(training_data)
            logger.info(f"✅ Model trained on {len(training_data)} synthetic samples")
        except Exception as e:
            logger.error(f"❌ Training failed: {e}")
    
    # Start server
    app.run(host='0.0.0.0', port=5000, debug=False)