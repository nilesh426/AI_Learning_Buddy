"""
AI Learning Buddy - Flask Backend Application
Supporting SDG 4: Quality Education
"""
import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from extensions import db, jwt, cors, migrate, limiter
from config.config import config

load_dotenv()


def create_app(config_name: str = None) -> Flask:
    """Application factory pattern."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['default']))

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000", "*"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    migrate.init_app(app, db)
    limiter.init_app(app)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.chat import chat_bp
    from routes.quiz import quiz_bp
    from routes.summary import summary_bp
    from routes.recommendations import recommendations_bp
    from routes.progress import progress_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(summary_bp, url_prefix='/api/summarize')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Health check
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'healthy',
            'message': 'AI Learning Buddy API is running',
            'version': '1.0.0'
        }), 200

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired', 'code': 'TOKEN_EXPIRED'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid token', 'code': 'INVALID_TOKEN'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authorization token required', 'code': 'MISSING_TOKEN'}), 401

    # Generic error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(429)
    def rate_limit_handler(e):
        return jsonify({'error': 'Rate limit exceeded. Please slow down.'}), 429

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    # Create tables and seed admin
    with app.app_context():
        db.create_all()
        _seed_admin(app)

    return app


def _seed_admin(app: Flask):
    """Create default admin user if not exists."""
    from models.models import User
    from utils.auth_utils import hash_password

    admin_email = app.config.get('ADMIN_EMAIL', 'admin@ailearningbuddy.com')
    admin_password = app.config.get('ADMIN_PASSWORD', 'Admin@123456')

    existing = User.query.filter_by(email=admin_email).first()
    if not existing:
        admin = User(
            name='Administrator',
            email=admin_email,
            password_hash=hash_password(admin_password),
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()
        print(f"✅ Admin user created: {admin_email}")


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
