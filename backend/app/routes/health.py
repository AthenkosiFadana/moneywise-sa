from flask import Blueprint, current_app

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.get("/health")
def health():
    store = current_app.extensions["store"]
    store.get_state()
    return {"status": "ok", "service": "moneywise-sa-api", "version": "1.0.0"}
