from flask import Blueprint, jsonify
from utils.auth_utils import token_required, get_current_user
from models.models import Quiz, Chat, LearningHistory
from datetime import datetime, timedelta, timezone
from sqlalchemy import func

progress_bp = Blueprint('progress', __name__)


@progress_bp.route('', methods=['GET'])
@token_required
def get_progress():
    """Get comprehensive progress analytics for current user."""
    user = get_current_user()
    user_id = user.id

    # Quiz statistics
    total_quizzes = Quiz.query.filter_by(user_id=user_id, completed=True).count()
    quizzes = Quiz.query.filter_by(user_id=user_id, completed=True).all()

    avg_score = 0
    if quizzes:
        scores = [(q.score / q.total_questions * 100) if q.total_questions > 0 else 0 for q in quizzes]
        avg_score = sum(scores) / len(scores)

    # Topic performance
    topic_performance = {}
    for quiz in quizzes:
        topic = quiz.topic
        pct = (quiz.score / quiz.total_questions * 100) if quiz.total_questions > 0 else 0
        if topic not in topic_performance:
            topic_performance[topic] = []
        topic_performance[topic].append(pct)

    topic_averages = {
        topic: round(sum(scores) / len(scores), 1)
        for topic, scores in topic_performance.items()
    }

    # Chat statistics
    total_chats = Chat.query.filter_by(user_id=user_id).count()

    # Learning history
    topics_studied = LearningHistory.query.filter_by(user_id=user_id).count()
    completed_topics = LearningHistory.query.filter_by(user_id=user_id, completion_status='completed').count()

    # Learning streak (consecutive days with activity)
    streak = _calculate_streak(user_id)

    # Recent quiz scores (last 10)
    recent_quizzes = Quiz.query.filter_by(user_id=user_id, completed=True)\
        .order_by(Quiz.created_at.desc()).limit(10).all()

    recent_scores = [
        {
            'topic': q.topic,
            'score': round((q.score / q.total_questions * 100), 1) if q.total_questions > 0 else 0,
            'difficulty': q.difficulty,
            'date': q.completed_at.isoformat() if q.completed_at else q.created_at.isoformat()
        }
        for q in reversed(recent_quizzes)
    ]

    # Difficulty breakdown
    difficulty_stats = {}
    for diff in ['easy', 'medium', 'hard']:
        diff_quizzes = [q for q in quizzes if q.difficulty == diff]
        if diff_quizzes:
            avg = sum([(q.score / q.total_questions * 100) if q.total_questions > 0 else 0 for q in diff_quizzes]) / len(diff_quizzes)
            difficulty_stats[diff] = {'count': len(diff_quizzes), 'avg_score': round(avg, 1)}
        else:
            difficulty_stats[diff] = {'count': 0, 'avg_score': 0}

    # Weekly activity (last 7 days)
    weekly = _get_weekly_activity(user_id)

    return jsonify({
        'overview': {
            'total_quizzes': total_quizzes,
            'avg_score': round(avg_score, 1),
            'total_chats': total_chats,
            'topics_studied': topics_studied,
            'completed_topics': completed_topics,
            'learning_streak': streak
        },
        'topic_performance': topic_averages,
        'recent_scores': recent_scores,
        'difficulty_stats': difficulty_stats,
        'weekly_activity': weekly
    }), 200


def _calculate_streak(user_id: int) -> int:
    """Calculate current learning streak in days."""
    today = datetime.now(timezone.utc).date()
    streak = 0
    current_date = today

    for _ in range(365):
        start = datetime.combine(current_date, datetime.min.time()).replace(tzinfo=timezone.utc)
        end = datetime.combine(current_date, datetime.max.time()).replace(tzinfo=timezone.utc)

        has_activity = (
            Quiz.query.filter(Quiz.user_id == user_id, Quiz.created_at.between(start, end)).first() or
            Chat.query.filter(Chat.user_id == user_id, Chat.timestamp.between(start, end)).first()
        )

        if has_activity:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            if current_date == today:
                current_date -= timedelta(days=1)
                continue
            break

    return streak


def _get_weekly_activity(user_id: int) -> list:
    """Get activity count per day for last 7 days."""
    result = []
    today = datetime.now(timezone.utc).date()

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        start = datetime.combine(day, datetime.min.time()).replace(tzinfo=timezone.utc)
        end = datetime.combine(day, datetime.max.time()).replace(tzinfo=timezone.utc)

        quiz_count = Quiz.query.filter(Quiz.user_id == user_id, Quiz.created_at.between(start, end)).count()
        chat_count = Chat.query.filter(Chat.user_id == user_id, Chat.timestamp.between(start, end)).count()

        result.append({
            'date': day.strftime('%a'),
            'quizzes': quiz_count,
            'chats': chat_count,
            'total': quiz_count + chat_count
        })

    return result
