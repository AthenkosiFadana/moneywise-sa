"""SQLite storage for the MoneyWise SA demo state.

Phase 5 of the roadmap moves this to Firebase/Firestore; the repository
interface below is the seam that swap happens behind.
"""

import json
import sqlite3
from datetime import datetime, timezone

DEFAULT_STATE = {
    "profile": {"name": "Thando", "income": 8000, "source": "Salary", "month": "Current month"},
    "expenses": [],
    "budget": [],
    "goals": [],
    "debts": [],
    "learning": {"completed": [], "total": 7, "quizBest": None},
    "challenges": {"active": [], "completed": [], "streak": 0},
    "assistant": [],
}


class Store:
    def __init__(self, database_path):
        self.database_path = database_path
        self._init_db()

    def _connect(self):
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _init_db(self):
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS app_state (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    payload TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )

    def get_state(self):
        with self._connect() as connection:
            row = connection.execute("SELECT payload FROM app_state WHERE id = 1").fetchone()

        if not row:
            return dict(DEFAULT_STATE)

        try:
            stored = json.loads(row["payload"])
        except (TypeError, ValueError):
            return dict(DEFAULT_STATE)

        return {**DEFAULT_STATE, **stored}

    def save_state(self, state):
        payload = json.dumps({**DEFAULT_STATE, **(state or {})}, default=str)
        updated_at = datetime.now(timezone.utc).isoformat()

        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO app_state (id, payload, updated_at) VALUES (1, ?, ?)
                ON CONFLICT(id) DO UPDATE SET payload = excluded.payload,
                                              updated_at = excluded.updated_at
                """,
                (payload, updated_at),
            )

        return {"updated_at": updated_at}
