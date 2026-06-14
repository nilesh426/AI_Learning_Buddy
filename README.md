# AI Learning Buddy — Personalized Learning Assistant

AI Learning Buddy is a complete production-ready full-stack web application designed to support **United Nations Sustainable Development Goal 4 (SDG 4): Quality Education**. The platform leverages AI to provide students with a personalized tutor, custom assessment quiz generation, automated study notes summarization, progress analytics, and customized study pathways.

---

## Key Features

1. **User Authentication & Profiles**:
   - Secure Student registration, login, and token-based session persistence.
   - Customizable profile cards with bio statements and premium avatar presets.
   - Admin account access for system oversight.

2. **AI Study Tutor (Chat)**:
   - Dynamic conversational AI tutor to explain academic concepts.
   - 3 Cognitive modes: Beginner (simplified, analogies), Intermediate (standard explanations), and Advanced (deep-dive, technical).
   - Chat history tracking.

3. **AI Quiz Generator**:
   - Custom quiz constructor: generate multiple-choice assessments by entering any topic.
   - Selectable parameters: number of questions (5–20) and difficulty levels (Easy, Medium, Hard).
   - Real-time stopwatch timer and card-based question-answering interface.
   - Instant grading feedback showing chosen answer, correct choice, and detailed AI explanation.
   - Historic attempts log with the ability to review past quiz results.

4. **AI Study Summarizer**:
   - Mode 1 (Topic Summarization): Enter a topic name, and the AI generates structured study notes.
   - Mode 2 (Text Summarization): Paste raw textbook sections (up to 5,000 characters) to extract key highlights.
   - Clipboard integration (one-click copy) and reportlab-based PDF download function.

5. **Personalized Recommendations**:
   - Dynamic study pathways generated based on student performance.
   - Highlight priority tasks (High, Medium, Low) and link to external references.

6. **Progress & Telemetry Dashboard**:
   - KPIs: streak counters, averages, unique topics, and chat sessions.
   - Recharts visual metrics: Weekly activity bars, score progression curves, topic proficiency bars, and difficulty success rates.

7. **Admin Control Panel**:
   - System monitoring showing platform-wide user registrations, total quizzes generated, and popular topics.
   - User account activation and deactivation toggle.
   - Detailed individual student performance modals.

---

## Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Recharts, Axios, Lucide Icons, React Markdown.
- **Backend**: Python Flask, SQLite (Development) / MySQL (Production support), SQLAlchemy ORM, JWT Authentication.
- **AI Integrations**: OpenAI GPT-3.5 API with fallbacks to Hugging Face Inference API.
- **DevOps**: Docker, Docker Compose, Nginx (Reverse Proxy and static server).

---

## Project Structure

```
ai-learning-buddy/
├── backend/
│   ├── config/              # Environment configurations
│   ├── models/              # Database schema definition
│   ├── routes/              # API endpoints blueprints
│   ├── services/            # OpenAI GPT / Hugging Face wrappers
│   ├── utils/               # Auth decors & input validators
│   ├── app.py               # Application entrypoint
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend docker configuration
├── frontend/
│   ├── src/
│   │   ├── components/      # Navigation, Layout, cards
│   │   ├── context/         # Auth & theme context states
│   │   ├── hooks/           # useApi & useAuth hooks
│   │   ├── pages/           # Pages (Dashboard, Quiz, Chat...)
│   │   ├── services/        # Axios API instances
│   │   ├── App.jsx          # Route definitions
│   │   └── main.jsx         # App DOM mounting
│   ├── nginx.conf           # SPA client routing config
│   ├── tailwind.config.js   # Style design system token config
│   ├── index.html           # Document template
│   └── Dockerfile           # Client build Docker config
└── docker-compose.yml       # Production docker-compose compose orchestration
```

---

## Installation & Setup

### Environment Configurations

Create a `.env` file inside the `backend` directory based on `.env.example`:

```env
FLASK_ENV=development
SECRET_KEY=enter-any-session-key
JWT_SECRET_KEY=enter-any-jwt-key
OPENAI_API_KEY=your-openai-api-key-here
HUGGINGFACE_API_KEY=your-huggingface-token-here
USE_HUGGINGFACE_FALLBACK=true
```

---

### Local Setup (For Development)

#### 1. Backend Flask API Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows (CMD)
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the database migrations and create admin defaults:
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```
   *(Note: The server auto-generates the database schemas and standard Admin seeds upon launch if migrations are bypassed)*
5. Run the dev server:
   ```bash
   python app.py
   ```
   The backend API will run on `http://127.5.0.1:5000`.

#### 2. Frontend React Client Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The client application will run on `http://localhost:5173`. Any requests directed to `/api` are automatically proxied to the Flask server (port 5000) as configured in `vite.config.js`.

---

### Run with Docker (For Production)

To spin up the entire application inside Docker container pods with an Nginx web server serving the static build and acting as a reverse proxy:

1. Make sure Docker and Docker Compose are installed on your machine.
2. In the root directory (where `docker-compose.yml` resides), run:
   ```bash
   docker-compose up --build
   ```
3. Docker will build the frontend client static bundle, download dependencies for Python, host the Flask API, and serve the application on:
   - **Frontend UI & API Gateway**: `http://localhost` (Port 80)
   - **Backend direct API access**: `http://localhost:5000`

The SQLite database file will be saved securely inside a named Docker volume (`backend-data`) so that your learning history and profiles persist even if you bring down the containers.

---

## Seed Accounts (Credentials)

- **Admin Account**:
  - Email: `admin@ailearningbuddy.com`
  - Password: `Admin@123456`
- **Student Account (Demo)**:
  - Register a new account on the register page, or login using credentials created during tests.

---

## License

This project is licensed under the MIT License.
