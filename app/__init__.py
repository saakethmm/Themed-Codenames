from flask import Flask

def create_app(config_class='config.Config'):
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.config.from_object(config_class)

    # Register Blueprints
    from .routes import main
    app.register_blueprint(main)

    return app