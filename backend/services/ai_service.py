import os
import json
import re
from click import prompt
import requests
from flask import current_app


class AIService:
    """
    AI service supporting Gemini with Hugging Face fallback.
    Provides chat tutoring, quiz generation, and topic summarization.
    """

    def __init__(self):
        self.gemini_key = None
        self.hf_key = None
        self.model = 'gemini-1.5-flash'
        self.use_hf_fallback = False

    def _init_from_app(self):
        """Initialize from Flask app context."""
        self.gemini_key = current_app.config.get('GEMINI_API_KEY', '')
        self.hf_key = current_app.config.get('HUGGINGFACE_API_KEY', '')
        self.model = current_app.config.get('GEMINI_MODEL', 'gemini-1.5-flash')
        self.use_hf_fallback = current_app.config.get('USE_HUGGINGFACE_FALLBACK', False)

    def _call_gemini(self, prompt: str, max_tokens: int = 1000) -> dict:
     import google.generativeai as genai

     genai.configure(api_key=self.gemini_key)

     try:
         model = genai.GenerativeModel(self.model)
         response = model.generate_content(prompt)

         return{
                'content': response.text,
                'tokens': 0
         }
     
     except Exception as e:
         print("Gemini API call error:", str(e))
         raise

    
    def _call_huggingface(self, prompt: str) -> dict:
        """Fallback: Call Hugging Face Inference API."""
        api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
        headers = {"Authorization": f"Bearer {self.hf_key}"}
        payload = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": 800, "temperature": 0.7}
        }
        response = requests.post(api_url, headers=headers, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and result:
                return {'content': result[0].get('generated_text', ''), 'tokens': 0}
        return {'content': 'I am unable to provide a response at this time. Please try again later.', 'tokens': 0}

    def _get_mock_response(self, prompt_type: str, context: str = '') -> dict:
        """Mock response when no API key is configured."""
        responses = {
            'chat': f"""Great question! Here's an explanation of **{context}**:

This is a foundational concept in the subject area. Let me break it down for you:

1. **Core Concept**: The fundamental idea revolves around understanding the relationship between cause and effect in this domain.

2. **Key Principles**:
   - First, consider the basic building blocks
   - Then, understand how they interact
   - Finally, apply the concept to real-world scenarios

3. **Practical Application**: You can use this knowledge in everyday situations by observing patterns and making connections.

**Example**: Think of it like building blocks — each piece supports the next, creating a stable structure of understanding.

Would you like me to explain any specific part in more detail? 🎓""",

            'summary': f"""## Summary: {context}

### Key Concepts
- **Main Idea**: The core topic revolves around understanding fundamental principles
- **Supporting Points**: Several key factors contribute to this concept
- **Applications**: This knowledge applies to real-world scenarios

### Bullet Points
• First major concept — understanding the foundation
• Second major concept — building upon the basics
• Third major concept — advanced applications
• Fourth major concept — practical implications

### Key Takeaways
1. Always start with the fundamentals
2. Build knowledge progressively
3. Apply concepts through practice
4. Connect theory to real-world examples

### Further Study
Consider exploring related topics to deepen your understanding.""",

            'quiz': json.dumps([
                {
                    "question": f"What is the primary purpose of studying {context}?",
                    "options": ["A) To memorize facts", "B) To develop critical thinking and understanding", "C) To pass examinations only", "D) To satisfy curriculum requirements"],
                    "correct_answer": "B",
                    "explanation": "The primary purpose of education is to develop critical thinking and deep understanding, not just memorization."
                },
                {
                    "question": f"Which approach is most effective for learning {context}?",
                    "options": ["A) Reading alone", "B) Practice and application", "C) Listening to lectures", "D) Copying notes"],
                    "correct_answer": "B",
                    "explanation": "Active practice and application of concepts leads to better retention and understanding."
                },
                {
                    "question": f"How does {context} connect to real-world applications?",
                    "options": ["A) It doesn't have real-world applications", "B) Only in academic settings", "C) Through practical problem-solving scenarios", "D) Only in professional environments"],
                    "correct_answer": "C",
                    "explanation": "Most academic concepts have practical applications through problem-solving in everyday life."
                }
            ])
        }
        return {'content': responses.get(prompt_type, 'Response not available.'), 'tokens': 0}

    def chat_tutor(self, question: str, mode: str = 'intermediate', subject: str = '', history: list = None) -> dict:
        """
        Generate an AI tutoring response.
        mode: beginner | intermediate | advanced
        """
        self._init_from_app()

        mode_instructions = {
            'beginner': 'Explain in very simple terms, use analogies, avoid jargon, and use lots of examples. Assume the student has no prior knowledge.',
            'intermediate': 'Explain clearly with some technical detail. Use examples and provide context. Assume basic familiarity with the subject.',
            'advanced': 'Provide in-depth technical explanation with nuances, edge cases, and advanced concepts. Assume strong foundational knowledge.'
        }

        system_prompt = f"""You are an expert AI Learning Tutor specializing in helping students understand complex topics.
Your teaching style: {mode_instructions.get(mode, mode_instructions['intermediate'])}
{f'Subject area: {subject}' if subject else ''}
Format your responses with:
- Clear structure using headers and bullet points
- Examples and analogies
- Key takeaways
- Follow-up suggestions
Always be encouraging and supportive. End with a question or suggestion to keep the student engaged."""

        messages = [{"role": "system", "content": system_prompt}]

        # Add chat history for context (last 5 exchanges)
        if history:
            for h in history[-5:]:
                messages.append({"role": "user", "content": h.get('question', '')})
                messages.append({"role": "assistant", "content": h.get('answer', '')})

        messages.append({"role": "user", "content": question})

        print("GEMINI KEY =", self.gemini_key)

        if not self.gemini_key:
            if self.use_hf_fallback and self.hf_key:
                return self._call_huggingface(question)
            return self._get_mock_response('chat', question[:50])

        try:
            return self._call_gemini("\n".join([m["content"] for m in messages]), max_tokens=1200)
        except Exception as e:
            print("Gemini error:",str(e))
            current_app.logger.error(f"Gemini API error: {e}")
            if self.use_hf_fallback and self.hf_key:
                return self._call_huggingface(question)
            return self._get_mock_response('chat', question[:50])

    def generate_quiz(self, topic: str, subject: str = '', difficulty: str = 'medium', num_questions: int = 5) -> list:
        """
        Generate MCQ quiz questions for a given topic.
        Returns list of question dicts.
        """
        self._init_from_app()

        difficulty_desc = {
            'easy': 'straightforward, basic recall and understanding',
            'medium': 'moderate complexity requiring analysis and application',
            'hard': 'advanced, requiring synthesis and evaluation of complex concepts'
        }

        system_prompt = """You are an expert educational quiz creator. Generate high-quality multiple choice questions.
IMPORTANT: Respond ONLY with valid JSON array. No other text."""

        user_prompt = f"""Generate exactly {num_questions} multiple choice questions about "{topic}"{f' in {subject}' if subject else ''}.
Difficulty: {difficulty_desc.get(difficulty, difficulty_desc['medium'])}

Return a JSON array with this exact structure:
[
  {{
    "question": "Question text here?",
    "options": ["A) Option one", "B) Option two", "C) Option three", "D) Option four"],
    "correct_answer": "A",
    "explanation": "Brief explanation of why this answer is correct"
  }}
]

Generate exactly {num_questions} questions. Ensure variety in question types and difficulty within the {difficulty} level."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        if not self.gemini_key:
            if self.use_hf_fallback and self.hf_key:
                result = self._call_huggingface(user_prompt)
                return self._parse_quiz_json(result['content'], topic, num_questions)
            mock = self._get_mock_response('quiz', topic)
            return json.loads(mock['content'])

        try:
            result = self._call_gemini(system_prompt + "\n\n" + user_prompt, max_tokens=2000)
            return self._parse_quiz_json(result['content'], topic, num_questions)
        except Exception as e:
            current_app.logger.error(f"Quiz generation error: {e}")
            mock = self._get_mock_response('quiz', topic)
            return json.loads(mock['content'])

    def _parse_quiz_json(self, content: str, topic: str, num_questions: int) -> list:
        """Parse quiz JSON from AI response."""
        try:
            # Try direct parse
            return json.loads(content)
        except json.JSONDecodeError:
            # Try extracting JSON array from text
            match = re.search(r'\[.*\]', content, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except Exception:
                    pass
        # Return mock on failure
        mock = self._get_mock_response('quiz', topic)
        return json.loads(mock['content'])

    def summarize_topic(self, topic_or_text: str, output_format: str = 'structured') -> dict:
        """
        Generate a concise summary of a topic or text.
        Returns structured summary with key concepts.
        """
        self._init_from_app()

        system_prompt = """You are an expert study notes creator. Create comprehensive, well-structured summaries.
Format using markdown with headers, bullet points, and emphasis."""

        user_prompt = f"""Create comprehensive study notes for: "{topic_or_text}"

Include:
1. ## Overview (2-3 sentences)
2. ## Key Concepts (bullet points)
3. ## Detailed Explanation (structured breakdown)
4. ## Important Formulas/Rules (if applicable)
5. ## Examples (2-3 practical examples)
6. ## Summary Points (5-7 key takeaways)
7. ## Further Study Topics

Make it concise yet comprehensive for student studying."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        if not self.gemini_key:
            if self.use_hf_fallback and self.hf_key:
                result = self._call_huggingface(user_prompt)
                return {'summary': result['content'], 'tokens': result['tokens']}
            mock = self._get_mock_response('summary', topic_or_text[:50])
            return {'summary': mock['content'], 'tokens': 0}

        try:
            result = self._call_gemini(system_prompt + "\n\n" + user_prompt, max_tokens=1500)
            return {'summary': result['content'], 'tokens': result['tokens']}
        except Exception as e:
            current_app.logger.error(f"Summarization error: {e}")
            mock = self._get_mock_response('summary', topic_or_text[:50])
            return {'summary': mock['content'], 'tokens': 0}

    def generate_recommendations(self, weak_topics: list, strong_topics: list, recent_quiz_scores: list) -> str:
        """
        Generate personalized learning recommendations.
        """
        self._init_from_app()

        avg_score = sum(recent_quiz_scores) / len(recent_quiz_scores) if recent_quiz_scores else 0

        system_prompt = "You are an expert educational advisor. Provide personalized, actionable learning recommendations."

        user_prompt = f"""Based on this student's performance, generate personalized recommendations:

Weak Areas: {', '.join(weak_topics) if weak_topics else 'None identified'}
Strong Areas: {', '.join(strong_topics) if strong_topics else 'None identified'}
Recent Quiz Average: {avg_score:.1f}%

Provide:
1. Priority topics to study next
2. Specific resources (articles, YouTube channels, documentation)
3. Study strategies for weak areas
4. Next learning milestones
5. Encouragement and motivation

Format as structured recommendations with resource links."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        if not self.gemini_key:
            return f"""## Your Personalized Learning Path

### Priority Focus Areas
{chr(10).join(f'- **{t}**: Review fundamentals and practice problems' for t in (weak_topics[:3] if weak_topics else ['General Review']))}

### Recommended Resources
- **Khan Academy**: Free comprehensive courses on most subjects
- **Coursera / edX**: University-level courses with certificates
- **YouTube**: Search for "{weak_topics[0] if weak_topics else 'your topic'} tutorial" for video explanations
- **MIT OpenCourseWare**: Free university lecture notes and materials

### Study Strategy
1. Review weak areas for 30 minutes daily
2. Practice with quizzes after each session
3. Connect new concepts to what you already know
4. Teach concepts to others to reinforce learning

Keep going — you're making great progress! 🌟"""

        try:
            result = self._call_gemini(system_prompt + '\n\n' + user_prompt, max_tokens=1000)
            return result['content']
        except Exception as e:
            current_app.logger.error(f"Recommendation generation error: {e}")
            return "Continue reviewing your weak areas and practice with quizzes regularly."


ai_service = AIService()
