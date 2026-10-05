from flask import Blueprint, jsonify, request

from ..services.assistant import ask

assistant_bp = Blueprint("assistant", __name__, url_prefix="/api/assistant")


@assistant_bp.post("/ask")
def ask_assistant():
    payload = request.get_json(silent=True) or {}
    question = payload.get("question", "")
    if not str(question).strip():
        return jsonify({"error": "question is required"}), 400

    state = payload.get("state") if isinstance(payload.get("state"), dict) else {}
    return jsonify(ask(question, state))
