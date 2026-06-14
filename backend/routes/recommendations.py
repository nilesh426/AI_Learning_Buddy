from flask import Blueprint, request, jsonify
from utils.auth_utils import token_required, get_current_user
from services.recommendation_service import RecommendationService
from models.models import Recommendation
from extensions import db

recommendations_bp = Blueprint('recommendations', __name__)


@recommendations_bp.route('', methods=['GET'])
@token_required
def get_recommendations():
    """Get personalized recommendations for current user."""
    user = get_current_user()

    recs = Recommendation.query.filter_by(user_id=user.id)\
        .order_by(Recommendation.priority, Recommendation.timestamp.desc()).all()

    if not recs:
        # Generate new recommendations
        try:
            recs = RecommendationService.generate_and_save(user.id)
        except Exception as e:
            return jsonify({'error': f'Failed to generate recommendations: {str(e)}'}), 500

    return jsonify({
        'recommendations': [r.to_dict() for r in recs],
        'total': len(recs)
    }), 200


@recommendations_bp.route('/refresh', methods=['POST'])
@token_required
def refresh_recommendations():
    """Force refresh personalized recommendations."""
    user = get_current_user()
    try:
        recs = RecommendationService.generate_and_save(user.id)
        return jsonify({
            'message': 'Recommendations refreshed',
            'recommendations': [r.to_dict() for r in recs],
            'total': len(recs)
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to refresh recommendations: {str(e)}'}), 500


@recommendations_bp.route('/<int:rec_id>/read', methods=['PATCH'])
@token_required
def mark_read(rec_id):
    """Mark a recommendation as read."""
    user = get_current_user()
    rec = Recommendation.query.filter_by(id=rec_id, user_id=user.id).first()
    if not rec:
        return jsonify({'error': 'Recommendation not found'}), 404
    rec.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'}), 200
