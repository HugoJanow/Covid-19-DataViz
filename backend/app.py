from flask import Flask
from flask_cors import CORS
from src.api.routes.covid_routes import covid_routes
import config

app = Flask(__name__)
CORS(app)

app.register_blueprint(covid_routes, url_prefix='/api')

@app.route('/health')
def health():
    return {
        'status': 'healthy',
        'message': 'API is running'
    }

if __name__ == '__main__':
    config = config.Config
    app.run(debug=config.DEBUG, port=config.PORT)