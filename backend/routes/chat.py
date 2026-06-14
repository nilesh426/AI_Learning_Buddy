from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from extensions import db
from models.models import Chat, LearningHistory
from utils.auth_utils import token_required, get_current_user
from services.ai_service import ai_service
from datetime import datetime, timezone

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('', methods=['POST'])
@token_required
def send_message():
    """Send a message to the AI tutor and get a response."""
    user = get_current_user()
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    question = data.get('question', '').strip()
    mode = data.get('mode', 'intermediate')
    subject = data.get('subject', '').strip()

    if not question:
        return jsonify({'error': 'Question cannot be empty'}), 400
    if len(question) > 2000:
        return jsonify({'error': 'Question too long (max 2000 characters)'}), 400
    if mode not in ['beginner', 'intermediate', 'advanced']:
        mode = 'intermediate'

    # Get recent chat history for context
    history = Chat.query.filter_by(user_id=user.id)\
        .order_by(Chat.timestamp.desc()).limit(5).all()
    history_list = [{'question': c.question, 'answer': c.answer} for c in reversed(history)]

    # Call AI service
    result = ai_service.chat_tutor(
        question=question,
        mode=mode,
        subject=subject,
        history=history_list
    )

    # Save to database
    chat = Chat(
        user_id=user.id,
        question=question,
        answer=result['content'],
        mode=mode,
        subject=subject if subject else None,
        tokens_used=result.get('tokens', 0),
        timestamp=datetime.now(timezone.utc)
    )
    db.session.add(chat)

    # Track learning history
    if subject:
        existing = LearningHistory.query.filter_by(user_id=user.id, topic=subject).first()
        if not existing:
            hist = LearningHistory(
                user_id=user.id,
                topic=subject,
                subject=subject,
                completion_status='in_progress',
                timestamp=datetime.now(timezone.utc)
            )
            db.session.add(hist)

    db.session.commit()

    return jsonify({
        'answer': result['content'],
        'chat_id': chat.id,
        'tokens_used': result.get('tokens', 0)
    }), 200


@chat_bp.route('/history', methods=['GET'])
@token_required
def get_history():
    """Get chat history for current user."""
    user = get_current_user()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    subject = request.args.get('subject', '')

    query = Chat.query.filter_by(user_id=user.id)
    if subject:
        query = query.filter(Chat.subject.ilike(f'%{subject}%'))

    chats = query.order_by(Chat.timestamp.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'chats': [c.to_dict() for c in chats.items],
        'total': chats.total,
        'pages': chats.pages,
        'current_page': page
    }), 200


@chat_bp.route('/history/<int:chat_id>', methods=['DELETE'])
@token_required
def delete_chat(chat_id):
    """Delete a specific chat."""
    user = get_current_user()
    chat = Chat.query.filter_by(id=chat_id, user_id=user.id).first()
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    db.session.delete(chat)
    db.session.commit()
    return jsonify({'message': 'Chat deleted successfully'}), 200
