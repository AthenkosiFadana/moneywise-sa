from flask import Blueprint, jsonify

learning_bp = Blueprint("learning", __name__, url_prefix="/api")

LESSONS = [
    {"slug": "budgeting-101", "title": "Budgeting basics", "tag": "Budgeting", "emoji": "💵", "readTime": "4 min"},
    {"slug": "banking-basics", "title": "Banking and fees", "tag": "Banking", "emoji": "🏦", "readTime": "4 min"},
    {"slug": "credit-and-interest", "title": "Credit and interest", "tag": "Credit", "emoji": "💳", "readTime": "5 min"},
    {"slug": "saving-essentials", "title": "Saving and emergency funds", "tag": "Saving", "emoji": "💰", "readTime": "4 min"},
    {"slug": "investing-101", "title": "Investing basics", "tag": "Investing", "emoji": "📈", "readTime": "5 min"},
    {"slug": "spotting-scams", "title": "Spotting financial scams", "tag": "Scams", "emoji": "🚨", "readTime": "4 min"},
    {"slug": "loans-and-repayments", "title": "Loans and repayments", "tag": "Loans", "emoji": "🏠", "readTime": "4 min"},
]

QUIZ_LENGTH = 6


@learning_bp.get("/learning")
def learning():
    return jsonify({"lessons": LESSONS, "count": len(LESSONS), "quizQuestions": QUIZ_LENGTH})
