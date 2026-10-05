from flask import Blueprint, jsonify, request

from ..services.confidence import calculate_confidence

insights_bp = Blueprint("insights", __name__, url_prefix="/api/insights")


@insights_bp.post("/confidence")
def confidence():
    payload = request.get_json(silent=True) or {}
    state = payload.get("state", payload)
    if not isinstance(state, dict):
        return jsonify({"error": "state must be an object"}), 400

    return jsonify(calculate_confidence(state))
