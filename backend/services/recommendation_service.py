from models.models import Quiz, LearningHistory, Recommendation
from extensions import db
from services.ai_service import ai_service
from datetime import datetime, timezone


class RecommendationService:
    """Service to generate personalized learning recommendations based on performance."""

    @staticmethod
    def analyze_performance(user_id: int) -> dict:
        """Analyze user's quiz performance and learning history."""
        quizzes = Quiz.query.filter_by(user_id=user_id, completed=True).order_by(Quiz.created_at.desc()).limit(20).all()
        history = LearningHistory.query.filter_by(user_id=user_id).all()

        # Calculate topic performance
        topic_scores = {}
        for quiz in quizzes:
            topic = quiz.topic.lower()
            if topic not in topic_scores:
                topic_scores[topic] = []
            pct = (quiz.score / quiz.total_questions * 100) if quiz.total_questions > 0 else 0
            topic_scores[topic].append(pct)

        # Identify weak and strong areas
        weak_topics = []
        strong_topics = []
        avg_by_topic = {}

        for topic, scores in topic_scores.items():
            avg = sum(scores) / len(scores)
            avg_by_topic[topic] = avg
            if avg < 60:
                weak_topics.append(topic)
            elif avg >= 80:
                strong_topics.append(topic)

        # Recent scores
        recent_scores = [(q.score / q.total_questions * 100) if q.total_questions > 0 else 0 for q in quizzes[:5]]

        # Topics studied
        topics_studied = [h.topic for h in history]

        return {
            'weak_topics': weak_topics,
            'strong_topics': strong_topics,
            'avg_by_topic': avg_by_topic,
            'recent_scores': recent_scores,
            'topics_studied': topics_studied,
            'total_quizzes': len(quizzes),
            'overall_average': sum(recent_scores) / len(recent_scores) if recent_scores else 0
        }

    @staticmethod
    def generate_and_save(user_id: int) -> list:
        """Generate AI recommendations and save to database."""
        analysis = RecommendationService.analyze_performance(user_id)

        # Clear old recommendations
        Recommendation.query.filter_by(user_id=user_id).delete()

        ai_text = ai_service.generate_recommendations(
            weak_topics=analysis['weak_topics'],
            strong_topics=analysis['strong_topics'],
            recent_quiz_scores=analysis['recent_scores']
        )

        # Parse and store as structured recommendations
        recommendations = []

        # Main AI recommendation
        main_rec = Recommendation(
            user_id=user_id,
            recommendation_text=ai_text,
            topic='General Learning Path',
            resource_type='ai_generated',
            priority=1,
            timestamp=datetime.now(timezone.utc)
        )
        db.session.add(main_rec)
        recommendations.append(main_rec)

        # Add specific topic recommendations for weak areas
        resource_map = {
            'mathematics': ('https://www.khanacademy.org/math', 'article'),
            'science': ('https://www.coursera.org/browse/physical-science-and-engineering', 'article'),
            'programming': ('https://developer.mozilla.org/en-US/', 'documentation'),
            'history': ('https://www.khanacademy.org/humanities/world-history', 'article'),
            'english': ('https://www.grammarly.com/blog/category/handbook/', 'article'),
            'physics': ('https://www.youtube.com/c/ScienceMom', 'video'),
            'chemistry': ('https://www.youtube.com/c/TheOrganicChemistryTutor', 'video'),
        }

        for i, topic in enumerate(analysis['weak_topics'][:3]):
            url, rtype = resource_map.get(topic.lower(), ('https://www.khanacademy.org', 'article'))
            rec = Recommendation(
                user_id=user_id,
                recommendation_text=f"Focus on improving your understanding of **{topic}**. Your average score in this area is below 60%. Review the fundamentals and practice more quizzes.",
                topic=topic,
                resource_type=rtype,
                resource_url=url,
                priority=2,
                timestamp=datetime.now(timezone.utc)
            )
            db.session.add(rec)
            recommendations.append(rec)

        db.session.commit()
        return recommendations
