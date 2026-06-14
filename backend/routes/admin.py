from flask import Blueprint, request, jsonify
from utils.auth_utils import admin_required, get_current_user
from models.models import User, Chat, Quiz, LearningHistory
from extensions import db
from datetime import datetime, timedelta, timezone

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """Get all registered users."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')

    query = User.query
    if search:
        query = query.filter(
            (User.name.ilike(f'%{search}%')) | (User.email.ilike(f'%{search}%'))
        )

    users = query.order_by(User.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    users_data = []
    for u in users.items:
        quiz_count = Quiz.query.filter_by(user_id=u.id, completed=True).count()
        chat_count = Chat.query.filter_by(user_id=u.id).count()
        user_dict = u.to_dict()
        user_dict['quiz_count'] = quiz_count
        user_dict['chat_count'] = chat_count
        users_data.append(user_dict)

    return jsonify({
        'users': users_data,
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    }), 200


@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    """Get platform-wide usage statistics."""
    total_users = User.query.filter_by(role='student').count()
    total_quizzes = Quiz.query.filter_by(completed=True).count()
    total_chats = Chat.query.count()
    total_topics = LearningHistory.query.count()

    # New users this week
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    new_users_week = User.query.filter(User.created_at >= week_ago).count()
    new_quizzes_week = Quiz.query.filter(Quiz.created_at >= week_ago, Quiz.completed == True).count()

    # Top topics
    from sqlalchemy import func
    top_topics = db.session.query(
        Quiz.topic,
        func.count(Quiz.id).label('count')
    ).filter(Quiz.completed == True)\
     .group_by(Quiz.topic)\
     .order_by(func.count(Quiz.id).desc())\
     .limit(10).all()

    # Average scores
    all_quizzes = Quiz.query.filter_by(completed=True).all()
    avg_score = 0
    if all_quizzes:
        scores = [(q.score / q.total_questions * 100) if q.total_questions > 0 else 0 for q in all_quizzes]
        avg_score = sum(scores) / len(scores)

    # Daily registrations last 7 days
    daily_stats = []
    for i in range(6, -1, -1):
        day = datetime.now(timezone.utc).date() - timedelta(days=i)
        start = datetime.combine(day, datetime.min.time()).replace(tzinfo=timezone.utc)
        end = datetime.combine(day, datetime.max.time()).replace(tzinfo=timezone.utc)
        count = User.query.filter(User.created_at.between(start, end)).count()
        daily_stats.append({'date': day.strftime('%a'), 'users': count})

    return jsonify({
        'overview': {
            'total_users': total_users,
            'total_quizzes': total_quizzes,
            'total_chats': total_chats,
            'total_topics': total_topics,
            'new_users_week': new_users_week,
            'new_quizzes_week': new_quizzes_week,
            'avg_score': round(avg_score, 1)
        },
        'top_topics': [{'topic': t, 'count': c} for t, c in top_topics],
        'daily_registrations': daily_stats
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_detail(user_id):
    """Get detailed info for a specific user."""
    user = User.query.get_or_404(user_id)
    quizzes = Quiz.query.filter_by(user_id=user_id, completed=True).all()
    scores = [(q.score / q.total_questions * 100) if q.total_questions > 0 else 0 for q in quizzes]

    return jsonify({
        'user': user.to_dict(),
        'stats': {
            'quiz_count': len(quizzes),
            'avg_score': round(sum(scores) / len(scores), 1) if scores else 0,
            'chat_count': Chat.query.filter_by(user_id=user_id).count(),
            'topics_studied': LearningHistory.query.filter_by(user_id=user_id).count()
        }
    }), 200


@admin_bp.route('/users/<int:user_id>/toggle-active', methods=['PATCH'])
@admin_required
def toggle_user_active(user_id):
    """Activate or deactivate a user account."""
    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        return jsonify({'error': 'Cannot deactivate admin accounts'}), 403
    user.is_active = not user.is_active
    db.session.commit()
    status = 'activated' if user.is_active else 'deactivated'
    return jsonify({'message': f'User {status} successfully', 'is_active': user.is_active}), 200
