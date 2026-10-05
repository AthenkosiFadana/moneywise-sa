import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "moneywise-dev-key")
    DATABASE_PATH = os.environ.get(
        "MONEYWISE_DB",
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "moneywise.db"),
    )
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
    JSON_SORT_KEYS = False
