from flask import Blueprint, jsonify, request

from ..services.calculations import (
    debt_repayment,
    emergency_fund_target,
    fifty_thirty_twenty,
    savings_projection,
)

calculators_bp = Blueprint("calculators", __name__, url_prefix="/api/calculators")


def _body():
    return request.get_json(silent=True) or {}


@calculators_bp.post("/savings")
def savings():
    body = _body()
    return jsonify(
        savings_projection(
            target=body.get("target", 0),
            current=body.get("current", 0),
            monthly=body.get("monthly", 0),
        )
    )


@calculators_bp.post("/emergency")
def emergency():
    body = _body()
    return jsonify(
        emergency_fund_target(
            essentials=body.get("essentials", 0),
            months=body.get("months", 3),
        )
    )


@calculators_bp.post("/debt")
def debt():
    body = _body()
    return jsonify(
        debt_repayment(
            principal=body.get("principal", 0),
            monthly=body.get("monthly", 0),
            annual_rate=body.get("annualRate", body.get("rate", 0)),
        )
    )


@calculators_bp.post("/split")
def split():
    body = _body()
    return jsonify(fifty_thirty_twenty(body.get("income", 0)))
