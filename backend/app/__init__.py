from flask import Flask
from flask_cors import CORS

from .config import Config
from .store import Store


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    CORS(app, origins=app.config.get("CORS_ORIGINS", "*"))
    app.extensions["store"] = Store(app.config["DATABASE_PATH"])

    from .routes import register_blueprints

    register_blueprints(app)

    @app.errorhandler(404)
    def not_found(_error):
        return {"error": "Not found"}, 404

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return {"error": "Method not allowed"}, 405

    return app
