from .assistant import assistant_bp
from .budget import budget_bp
from .calculators import calculators_bp
from .health import health_bp
from .insights import insights_bp
from .learning import learning_bp
from .state import state_bp


def register_blueprints(app):
    for blueprint in (health_bp, state_bp, budget_bp, calculators_bp, insights_bp, assistant_bp, learning_bp):
        app.register_blueprint(blueprint)
