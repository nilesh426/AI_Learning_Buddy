from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from datetime import datetime, timezone
from extensions import db
from models.models import User
from utils.auth_utils import hash_password, check_password, token_required, get_current_user
from utils.validators import validate_email, validate_password, validate_name

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new student account."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validation
    if not validate_name(name):
        return jsonify({'error': 'Name must be 2-100 characters'}), 400
    if not validate_email(email):
        return jsonify({'error': 'Invalid email address'}), 400
    is_valid_pw, pw_msg = validate_password(password)
    if not is_valid_pw:
        return jsonify({'error': pw_msg}), 400

    # Check existing user
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists'}), 409

    # Create user
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role='student'
    )
    db.session.add(user)
    db.session.commit()

    # Generate token
    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        'message': 'Account created successfully',
        'user': user.to_dict(),
        'access_token': access_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user and return JWT token."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password(password, user.password_hash):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is deactivated. Contact support.'}), 403

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token
    }), 200


@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """Get current user's profile."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user's profile."""
    user = get_current_user()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'name' in data:
        name = data['name'].strip()
        if not validate_name(name):
            return jsonify({'error': 'Name must be 2-100 characters'}), 400
        user.name = name

    if 'bio' in data:
        user.bio = data['bio'][:500] if data['bio'] else None

    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url'][:255] if data['avatar_url'] else None

    if 'password' in data and data['password']:
        is_valid_pw, pw_msg = validate_password(data['password'])
        if not is_valid_pw:
            return jsonify({'error': pw_msg}), 400
        current_pw = data.get('current_password', '')
        if not check_password(current_pw, user.password_hash):
            return jsonify({'error': 'Current password is incorrect'}), 400
        user.password_hash = hash_password(data['password'])

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200
