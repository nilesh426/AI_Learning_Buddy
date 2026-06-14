import re


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    Returns (is_valid, message).
    """
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    if not re.search(r'\d', password):
        return False, 'Password must contain at least one number'
    return True, 'Password is valid'


def validate_name(name: str) -> bool:
    """Validate name (non-empty, 2-100 chars)."""
    return bool(name and 2 <= len(name.strip()) <= 100)


def sanitize_string(text: str, max_length: int = 5000) -> str:
    """Sanitize and truncate a string."""
    if not text:
        return ''
    return text.strip()[:max_length]


def validate_quiz_params(data: dict) -> tuple[bool, str]:
    """Validate quiz generation parameters."""
    topic = data.get('topic', '')
    difficulty = data.get('difficulty', 'medium')
    num_questions = data.get('num_questions', 5)

    if not topic or len(topic.strip()) < 2:
        return False, 'Topic must be at least 2 characters'
    if difficulty not in ['easy', 'medium', 'hard']:
        return False, 'Difficulty must be easy, medium, or hard'
    if not isinstance(num_questions, int) or not (1 <= num_questions <= 20):
        return False, 'Number of questions must be between 1 and 20'
    return True, 'Valid'
