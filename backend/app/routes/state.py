from flask import Blueprint, current_app, jsonify, request

state_bp = Blueprint("state", __name__, url_prefix="/api")


@state_bp.get("/state")
def get_state():
    return jsonify(current_app.extensions["store"].get_state())


@state_bp.post("/state")
def save_state():
    payload = request.get_json(silent=True) or {}
    state = payload.get("state", payload)
    if not isinstance(state, dict):
        return jsonify({"error": "state must be an object"}), 400

    result = current_app.extensions["store"].save_state(state)
    return jsonify({"ok": True, **result})
