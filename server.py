from flask import Flask, request, jsonify
from flask_cors import CORS
import util

app = Flask(__name__)
CORS(app)

@app.route('/classify_image', methods=['GET', 'POST'])
def classify_image():
    if request.method == 'POST':
        print("Received POST request")
        print("Form data keys:", request.form.keys())
        
        image_data = request.form.get('image_data')
        if not image_data:
            print("No image data found in request")
            return jsonify({'error': 'No image data received'}), 400
            
        print("Image data received, length:", len(str(image_data)))
        
        try:
            val = util.classify_image(image_data)
            print("Classification result:", val)
            return jsonify(val)
        except Exception as e:
            print("Error during classification:", str(e))
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Method not allowed'}), 405

if __name__ == "__main__":
    print("Loading Flask server...")
    util.load_model()
    app.run(port=5000, debug=True)