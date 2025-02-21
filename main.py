from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.react import react_bp
from routes.api import api_bp
from dotenv import load_dotenv
from routes.remote_device_wv import remotecdm_wv_bp
from routes.login import login_bp
import os

app = Flask(__name__, static_folder='react/build/static', template_folder='react/build', static_url_path='/static')
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
CORS(app, resources={r"/*": {"origins": "https://cdrm-project.com"}}, supports_credentials=True)

# Register the blueprint
app.register_blueprint(react_bp)
app.register_blueprint(api_bp)
app.register_blueprint(remotecdm_wv_bp)
app.register_blueprint(login_bp)

if __name__ == '__main__':
    load_dotenv()
    app.run()
