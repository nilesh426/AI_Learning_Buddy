from datetime import datetime, timezone
from extensions import db


class User(db.Model):
    """User model for students and admins."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='student')  # 'student' or 'admin'
    avatar_url = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    chats = db.relationship('Chat', backref='user', lazy=True, cascade='all, delete-orphan')
    quizzes = db.relationship('Quiz', backref='user', lazy=True, cascade='all, delete-orphan')
    learning_history = db.relationship('LearningHistory', backref='user', lazy=True, cascade='all, delete-orphan')
    recommendations = db.relationship('Recommendation', backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active
        }

    def __repr__(self):
        return f'<User {self.email}>'


class Chat(db.Model):
    """Chat session model."""
    __tablename__ = 'chats'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    mode = db.Column(db.String(20), default='intermediate')  # beginner, intermediate, advanced
    subject = db.Column(db.String(100), nullable=True)
    tokens_used = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'question': self.question,
            'answer': self.answer,
            'mode': self.mode,
            'subject': self.subject,
            'tokens_used': self.tokens_used,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


class Quiz(db.Model):
    """Quiz session model."""
    __tablename__ = 'quizzes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100), nullable=True)
    difficulty = db.Column(db.String(20), default='medium')  # easy, medium, hard
    num_questions = db.Column(db.Integer, default=5)
    score = db.Column(db.Float, default=0.0)
    total_questions = db.Column(db.Integer, default=0)
    time_taken = db.Column(db.Integer, default=0)  # seconds
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    questions = db.relationship('QuizQuestion', backref='quiz', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'topic': self.topic,
            'subject': self.subject,
            'difficulty': self.difficulty,
            'num_questions': self.num_questions,
            'score': self.score,
            'total_questions': self.total_questions,
            'time_taken': self.time_taken,
            'completed': self.completed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class QuizQuestion(db.Model):
    """Individual quiz question model."""
    __tablename__ = 'quiz_questions'

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    options = db.Column(db.Text, nullable=False)  # JSON string of options list
    correct_answer = db.Column(db.String(10), nullable=False)  # 'A', 'B', 'C', 'D'
    explanation = db.Column(db.Text, nullable=True)
    user_answer = db.Column(db.String(10), nullable=True)
    is_correct = db.Column(db.Boolean, nullable=True)

    def to_dict(self):
        import json
        try:
            options = json.loads(self.options) if self.options else []
        except Exception:
            options = []
        return {
            'id': self.id,
            'quiz_id': self.quiz_id,
            'question': self.question,
            'options': options,
            'correct_answer': self.correct_answer,
            'explanation': self.explanation,
            'user_answer': self.user_answer,
            'is_correct': self.is_correct
        }


class LearningHistory(db.Model):
    """Learning history/topics studied model."""
    __tablename__ = 'learning_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100), nullable=True)
    completion_status = db.Column(db.String(20), default='in_progress')  # in_progress, completed
    proficiency = db.Column(db.Float, default=0.0)  # 0-100
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'topic': self.topic,
            'subject': self.subject,
            'completion_status': self.completion_status,
            'proficiency': self.proficiency,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


class Recommendation(db.Model):
    """Personalized recommendation model."""
    __tablename__ = 'recommendations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recommendation_text = db.Column(db.Text, nullable=False)
    topic = db.Column(db.String(200), nullable=True)
    resource_type = db.Column(db.String(50), nullable=True)  # article, video, book, doc
    resource_url = db.Column(db.String(500), nullable=True)
    priority = db.Column(db.Integer, default=1)  # 1=high, 2=medium, 3=low
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'recommendation_text': self.recommendation_text,
            'topic': self.topic,
            'resource_type': self.resource_type,
            'resource_url': self.resource_url,
            'priority': self.priority,
            'is_read': self.is_read,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
