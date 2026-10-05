from flask import Blueprint, current_app, jsonify, request

from ..services.calculations import analyse_cashflow, summarise_budget

budget_bp = Blueprint("budget", __name__, url_prefix="/api")


def _store():
    return current_app.extensions["store"]


@budget_bp.get("/budget")
def get_budget():
    state = _store().get_state()
    return jsonify(
        {
            "income": (state.get("profile") or {}).get("income", 0),
            "categories": summarise_budget(state.get("budget")),
            "budget": state.get("budget") or [],
        }
    )


@budget_bp.post("/budget")
def save_budget():
    payload = request.get_json(silent=True) or {}
    categories = payload.get("budget", payload.get("categories"))
    if not isinstance(categories, list):
        return jsonify({"error": "budget must be a list of categories"}), 400

    state = _store().get_state()
    state["budget"] = categories
    _store().save_state(state)

    return jsonify({"ok": True, "categories": summarise_budget(categories)})


@budget_bp.get("/expenses")
def get_expenses():
    state = _store().get_state()
    cashflow = analyse_cashflow((state.get("profile") or {}).get("income", 0), state.get("expenses") or [])
    return jsonify({"expenses": state.get("expenses") or [], "cashflow": cashflow})


@budget_bp.post("/expenses")
def save_expenses():
    payload = request.get_json(silent=True) or {}
    expenses = payload.get("expenses")
    if not isinstance(expenses, list):
        return jsonify({"error": "expenses must be a list"}), 400

    state = _store().get_state()
    state["expenses"] = expenses
    _store().save_state(state)

    cashflow = analyse_cashflow((state.get("profile") or {}).get("income", 0), expenses)
    return jsonify({"ok": True, "cashflow": cashflow})
