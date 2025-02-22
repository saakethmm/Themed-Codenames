from app import create_app
import os

# Determine the environment and set the configuration class
config_class = 'config.DevelopmentConfig' if os.getenv('FLASK_ENV') == 'development' else 'config.ProductionConfig'

# Create the Flask application with the appropriate configuration
app = create_app(config_class)

if __name__ == '__main__':
    app.run(debug=True)