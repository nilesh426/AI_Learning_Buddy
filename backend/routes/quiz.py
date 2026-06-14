import json
from flask import Blueprint, request, jsonify
from extensions import db
from models.models import Quiz, QuizQuestion, LearningHistory
from utils.auth_utils import token_required, get_current_user
from utils.validators import validate_quiz_params
from services.ai_service import ai_service
from datetime import datetime, timezone

quiz_bp = Blueprint('quiz', __name__)


@quiz_bp.route('/generate', methods=['POST'])
@token_required
def generate_quiz():
    """Generate a new quiz on a given topic."""
    user = get_current_user()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    topic = data.get('topic', '').strip()
    subject = data.get('subject', '').strip()
    difficulty = data.get('difficulty', 'medium')
    num_questions = data.get('num_questions', 5)

    # Validate
    is_valid, msg = validate_quiz_params({'topic': topic, 'difficulty': difficulty, 'num_questions': num_questions})
    if not is_valid:
        return jsonify({'error': msg}), 400

    # Generate questions using AI
    questions_data = ai_service.generate_quiz(
        topic=topic,
        subject=subject,
        difficulty=difficulty,
        num_questions=num_questions
    )

    # Create quiz record
    quiz = Quiz(
        user_id=user.id,
        topic=topic,
        subject=subject if subject else None,
        difficulty=difficulty,
        num_questions=len(questions_data),
        total_questions=len(questions_data),
        completed=False,
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(quiz)
    db.session.flush()  # Get quiz.id

    # Create question records
    for q_data in questions_data:
        options = q_data.get('options', [])
        question = QuizQuestion(
            quiz_id=quiz.id,
            question=q_data.get('question', ''),
            options=json.dumps(options),
            correct_answer=q_data.get('correct_answer', 'A'),
            explanation=q_data.get('explanation', '')
        )
        db.session.add(question)

    db.session.commit()

    return jsonify({
        'message': 'Quiz generated successfully',
        'quiz': quiz.to_dict(),
        'questions': [q.to_dict() for q in quiz.questions]
    }), 201


@quiz_bp.route('/submit', methods=['POST'])
@token_required
def submit_quiz():
    """Submit quiz answers and calculate score."""
    user = get_current_user()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    quiz_id = data.get('quiz_id')
    answers = data.get('answers', {})  # {question_id: 'A'/'B'/'C'/'D'}
    time_taken = data.get('time_taken', 0)

    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user.id).first()
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    if quiz.completed:
        return jsonify({'error': 'Quiz already submitted'}), 400

    # Score the quiz
    correct_count = 0
    results = []
    for question in quiz.questions:
        user_answer = answers.get(str(question.id), '').upper()
        is_correct = user_answer == question.correct_answer.upper()
        if is_correct:
            correct_count += 1
        question.user_answer = user_answer
        question.is_correct = is_correct
        results.append({
            'question_id': question.id,
            'question': question.question,
            'user_answer': user_answer,
            'correct_answer': question.correct_answer,
            'is_correct': is_correct,
            'explanation': question.explanation
        })

    score_pct = (correct_count / len(quiz.questions) * 100) if quiz.questions else 0

    quiz.score = correct_count
    quiz.time_taken = time_taken
    quiz.completed = True
    quiz.completed_at = datetime.now(timezone.utc)

    # Update learning history
    topic = quiz.topic
    existing = LearningHistory.query.filter_by(user_id=user.id, topic=topic).first()
    if existing:
        existing.proficiency = min(100, (existing.proficiency + score_pct) / 2)
        if score_pct >= 70:
            existing.completion_status = 'completed'
    else:
        hist = LearningHistory(
            user_id=user.id,
            topic=topic,
            subject=quiz.subject,
            completion_status='completed' if score_pct >= 70 else 'in_progress',
            proficiency=score_pct,
            timestamp=datetime.now(timezone.utc)
        )
        db.session.add(hist)

    db.session.commit()

    return jsonify({
        'message': 'Quiz submitted successfully',
        'score': correct_count,
        'total': len(quiz.questions),
        'percentage': round(score_pct, 1),
        'time_taken': time_taken,
        'results': results,
        'quiz': quiz.to_dict()
    }), 200


@quiz_bp.route('/history', methods=['GET'])
@token_required
def get_quiz_history():
    """Get quiz history for current user."""
    user = get_current_user()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    quizzes = Quiz.query.filter_by(user_id=user.id)\
        .order_by(Quiz.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'quizzes': [q.to_dict() for q in quizzes.items],
        'total': quizzes.total,
        'pages': quizzes.pages,
        'current_page': page
    }), 200


@quiz_bp.route('/<int:quiz_id>', methods=['GET'])
@token_required
def get_quiz(quiz_id):
    """Get a specific quiz with questions."""
    user = get_current_user()
    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user.id).first()
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404

    questions = [q.to_dict() for q in quiz.questions]
    # Hide correct answers if not completed
    if not quiz.completed:
        for q in questions:
            q.pop('correct_answer', None)
            q.pop('explanation', None)

    return jsonify({
        'quiz': quiz.to_dict(),
        'questions': questions
    }), 200
