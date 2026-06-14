import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { quizAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import {
  Brain, Timer, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  HelpCircle, RotateCcw, LayoutDashboard, Award, Calendar, BarChart3, BookOpen
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function QuizPage() {
  const navigate = useNavigate()
  const [viewState, setViewState] = useState('select') // 'select', 'loading', 'active', 'result'
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'medium',
    num_questions: 5,
  })
  
  // Active Quiz State
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({}) // { questionId: selectedOption }
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeTaken, setTimeTaken] = useState(0)
  const timerRef = useRef(null)

  // Results State
  const [results, setResults] = useState(null)

  // History State
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Load past quizzes
  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await quizAPI.getHistory()
      setHistory(res.data.quizzes || [])
    } catch (err) {
      console.error('Failed to load quiz history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (viewState === 'select') {
      loadHistory()
    }
  }, [viewState])

  // Timer logic
  useEffect(() => {
    if (viewState === 'active') {
      setTimeTaken(0)
      timerRef.current = setInterval(() => {
        setTimeTaken(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [viewState])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setViewState('loading')
    try {
      const res = await quizAPI.generate({
        topic: formData.topic.trim(),
        difficulty: formData.difficulty,
        num_questions: parseInt(formData.num_questions),
      })
      setQuiz(res.data.quiz)
      setQuestions(res.data.questions)
      setAnswers({})
      setCurrentIdx(0)
      setViewState('active')
      toast.success('Quiz generated successfully!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to generate quiz. Please try again.')
      setViewState('select')
    }
  }

  const handleOptionSelect = (questionId, optionKey) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }))
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = questions.length - Object.keys(answers).length
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
      )
      if (!confirmSubmit) return
    }

    setViewState('loading')
    try {
      const res = await quizAPI.submit({
        quiz_id: quiz.id,
        answers: answers,
        time_taken: timeTaken
      })
      setResults(res.data)
      setViewState('result')
      toast.success('Quiz graded!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to submit quiz.')
      setViewState('active')
    }
  }

  const handleReviewPastQuiz = async (quizId) => {
    setViewState('loading')
    try {
      const res = await quizAPI.getQuiz(quizId)
      // Since it's completed, backend will return correct_answer and explanation.
      // We format it like submit response so we can reuse the result view.
      const formattedResults = {
        quiz: res.data.quiz,
        score: res.data.quiz.score,
        total: res.data.quiz.total_questions,
        percentage: Math.round((res.data.quiz.score / res.data.quiz.total_questions) * 100),
        time_taken: res.data.quiz.time_taken,
        results: res.data.questions.map(q => ({
          question_id: q.id,
          question: q.question,
          user_answer: q.user_answer,
          correct_answer: q.correct_answer,
          is_correct: q.is_correct,
          explanation: q.explanation,
          options: q.options
        }))
      }
      setResults(formattedResults)
      setViewState('result')
    } catch (err) {
      console.error(err)
      toast.error('Failed to load quiz details.')
      setViewState('select')
    }
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Helper to get option letter index
  const getOptionLetter = (idx) => String.fromCharCode(65 + idx) // 0 -> A, 1 -> B ...

  return (
    <AppLayout>
      {/* Page Title */}
      <div className="mb-6 animate-slide-up">
        <h1 className="page-title">AI Quiz Generator</h1>
        <p className="page-subtitle">Test your knowledge and get immediate feedback on any topic.</p>
      </div>

      {/* ── STATE: SELECT/FORM ────────────────────────────────── */}
      {viewState === 'select' && (
        <div className="grid lg:grid-cols-3 gap-6 items-start animate-slide-up">
          {/* Quiz Generator Form */}
          <div className="lg:col-span-1 card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400">
                <Brain className="w-5 h-5" />
              </div>
              <h2 className="text-white font-bold text-lg font-display">Create a Quiz</h2>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="input-label" htmlFor="topic">Topic</label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  placeholder="e.g. Quantum Mechanics, Javascript Arrays, World War II"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="input-label" htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="input cursor-pointer"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="input-label" htmlFor="num_questions">Number of Questions</label>
                <select
                  id="num_questions"
                  name="num_questions"
                  value={formData.num_questions}
                  onChange={handleInputChange}
                  className="input cursor-pointer"
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                  <option value="20">20 Questions</option>
                </select>
              </div>

              <button type="submit" className="btn-primary w-full mt-2 justify-center">
                <Brain className="w-5 h-5" />
                Generate Quiz
              </button>
            </form>
          </div>

          {/* Past Quiz History */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-secondary-500/10 flex items-center justify-center text-secondary-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-white font-bold text-lg font-display">Quiz History</h2>
            </div>

            {historyLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner text="Fetching past quizzes..." />
              </div>
            ) : history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-700 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Topic</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {history.map((item) => {
                      const pct = item.total_questions > 0 ? Math.round((item.score / item.total_questions) * 100) : 0
                      return (
                        <tr key={item.id} className="hover:bg-dark-800/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-200 truncate max-w-[200px]" title={item.topic}>
                            {item.topic}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge text-[10px] ${
                              item.difficulty === 'easy' ? 'badge-success' : 
                              item.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'
                            }`}>
                              {item.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-300">
                            {item.completed ? (
                              <span className={pct >= 75 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                                {item.score}/{item.total_questions} ({pct}%)
                              </span>
                            ) : (
                              <span className="text-gray-500 italic text-xs">Uncompleted</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {item.completed ? (
                              <button
                                onClick={() => handleReviewPastQuiz(item.id)}
                                className="text-primary-400 hover:text-primary-300 text-xs font-semibold hover:underline"
                              >
                                Review Results
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  setViewState('loading')
                                  try {
                                    const res = await quizAPI.getQuiz(item.id)
                                    setQuiz(res.data.quiz)
                                    setQuestions(res.data.questions)
                                    setAnswers({})
                                    setCurrentIdx(0)
                                    setViewState('active')
                                  } catch (err) {
                                    toast.error('Failed to resume quiz')
                                    setViewState('select')
                                  }
                                }}
                                className="text-secondary-400 hover:text-secondary-300 text-xs font-semibold hover:underline"
                              >
                                Resume
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                <Brain className="w-12 h-12 mb-3 opacity-30 text-gray-400" />
                <p className="text-sm">You haven't taken any quizzes yet.</p>
                <p className="text-xs mt-1 text-gray-600">Enter a topic above to generate your first AI learning assessment!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STATE: LOADING ───────────────────────────────────── */}
      {viewState === 'loading' && (
        <div className="flex flex-col items-center justify-center py-24 glass rounded-2xl border border-dark-800 animate-fade-in">
          <LoadingSpinner size="lg" text="Generating personalized quiz questions via AI..." />
          <p className="text-xs text-gray-500 mt-4 max-w-sm text-center">
            Our AI engine is scanning the topic and generating contextual, curriculum-aligned multiple choice questions...
          </p>
        </div>
      )}

      {/* ── STATE: ACTIVE QUIZ WIZARD ────────────────────────── */}
      {viewState === 'active' && questions.length > 0 && (
        <div className="max-w-3xl mx-auto animate-slide-up">
          {/* Header Panel */}
          <div className="card mb-6">
            <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
              <div>
                <span className="badge badge-primary uppercase text-[10px] tracking-wider mb-1">
                  Topic: {quiz?.topic}
                </span>
                <h2 className="text-white font-bold text-lg truncate max-w-lg">
                  Question {currentIdx + 1} of {questions.length}
                </h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-800 border border-dark-700 text-primary-400 font-mono text-sm font-semibold">
                <Timer className="w-4 h-4" />
                {formatTime(timeTaken)}
              </div>
            </div>

            {/* Progress bar */}
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="card mb-6">
            <h3 className="text-white text-lg font-medium mb-6 font-display leading-relaxed">
              {questions[currentIdx].question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentIdx].options.map((option, idx) => {
                const letter = getOptionLetter(idx)
                const isSelected = answers[questions[currentIdx].id] === letter
                return (
                  <div
                    key={idx}
                    onClick={() => handleOptionSelect(questions[currentIdx].id, letter)}
                    className={`quiz-option ${isSelected ? 'selected' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border transition-all ${
                      isSelected 
                        ? 'bg-primary-500 border-primary-400 text-white shadow-glow-primary' 
                        : 'bg-dark-800 border-dark-700 text-gray-400 group-hover:border-primary-500/50'
                    }`}>
                      {letter}
                    </div>
                    <span className="text-gray-200 text-sm md:text-base pt-0.5 leading-relaxed">
                      {option}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Wizard Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="btn-ghost disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="btn-primary"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn-secondary px-8 font-bold shadow-glow-secondary"
              >
                Submit Quiz
                <CheckCircle2 className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── STATE: RESULT VIEW ───────────────────────────────── */}
      {viewState === 'result' && results && (
        <div className="max-w-3xl mx-auto animate-slide-up">
          {/* Summary Score Card */}
          <div className="card mb-8 text-center relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col items-center py-6">
              <div className="w-20 h-20 rounded-2xl bg-primary-gradient flex items-center justify-center text-white shadow-glow-primary mb-4">
                <Award className="w-10 h-10" />
              </div>
              <h2 className="text-white text-2xl font-bold font-display">Quiz Complete!</h2>
              <p className="text-gray-400 text-sm max-w-sm mt-1">
                You've completed the quiz on <strong>{results.quiz.topic}</strong>. Here is your performance overview:
              </p>

              {/* Score Display */}
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-black text-white font-display">
                  {results.score}
                </span>
                <span className="text-xl text-gray-500 font-medium">
                  / {results.total}
                </span>
              </div>

              {/* Percentage Badge & Grade Message */}
              <div className="mt-2">
                <span className={`badge text-sm px-4 py-1 font-bold ${
                  results.percentage >= 80 ? 'badge-success' :
                  results.percentage >= 60 ? 'badge-warning' : 'badge-danger'
                }`}>
                  {results.percentage}% Score
                </span>
              </div>

              <p className="text-gray-300 text-sm mt-4 italic">
                {results.percentage >= 90 ? '"Incredible! Master status achieved!"' :
                 results.percentage >= 70 ? '"Great job! You have a solid grasp of this topic!"' :
                 results.percentage >= 50 ? '"Good effort! Study the explanations below to improve." ' :
                 '"Keep practicing! Reviewing mistakes is where the learning happens."'}
              </p>

              {/* Quick stats row */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-6 border-t border-dark-800 pt-6">
                <div>
                  <div className="text-gray-500 text-xs">Time Spent</div>
                  <div className="text-white font-semibold font-mono mt-0.5">{formatTime(results.time_taken)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs font-medium">Difficulty</div>
                  <div className="text-white font-semibold capitalize mt-0.5">{results.quiz.difficulty}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-4 items-center justify-between mb-8 flex-wrap">
            <h3 className="text-white font-bold text-lg font-display">Question Breakdown</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setViewState('select')}
                className="btn-ghost text-sm py-2 px-4"
              >
                <RotateCcw className="w-4 h-4" />
                New Quiz
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-sm py-2 px-4"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            </div>
          </div>

          {/* Review list */}
          <div className="space-y-6">
            {results.results?.map((res, index) => {
              const userOpt = res.user_answer;
              const correctOpt = res.correct_answer;
              const isCorrect = res.is_correct;

              return (
                <div key={res.question_id || index} className="card border-l-4 overflow-hidden" style={{
                  borderLeftColor: isCorrect ? '#14b895' : '#ef4444'
                }}>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Question {index + 1}
                    </span>
                    <span className={`badge text-[10px] ${isCorrect ? 'badge-success' : 'badge-danger'}`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-white font-medium mb-5 text-sm md:text-base leading-relaxed">
                    {res.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2.5 mb-5">
                    {res.options ? res.options.map((optText, optIdx) => {
                      const letter = getOptionLetter(optIdx)
                      const isUserChoice = userOpt === letter
                      const isCorrectChoice = correctOpt === letter
                      
                      let optionClass = ''
                      if (isCorrectChoice) optionClass = 'correct'
                      else if (isUserChoice && !isCorrect) optionClass = 'incorrect'

                      return (
                        <div key={optIdx} className={`quiz-option cursor-default pointer-events-none ${optionClass}`}>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                            isCorrectChoice ? 'bg-green-500 border-green-400 text-white' :
                            isUserChoice && !isCorrect ? 'bg-red-500 border-red-400 text-white' :
                            'bg-dark-800 border-dark-700 text-gray-400'
                          }`}>
                            {letter}
                          </div>
                          <span className={`text-xs md:text-sm pt-0.5 leading-relaxed ${
                            isCorrectChoice ? 'text-green-300 font-medium' :
                            isUserChoice && !isCorrect ? 'text-red-300' : 'text-gray-300'
                          }`}>
                            {optText}
                          </span>
                        </div>
                      )
                    }) : (
                      <div className="text-xs text-gray-500">
                        <p>User Answer: <span className="text-white font-mono">{userOpt || 'None'}</span></p>
                        <p>Correct Answer: <span className="text-green-400 font-mono">{correctOpt}</span></p>
                      </div>
                    )}
                  </div>

                  {/* Explanation box */}
                  {res.explanation && (
                    <div className="p-4 rounded-xl bg-dark-800/40 border border-dark-800/80 mt-4">
                      <div className="flex gap-2 items-start">
                        <HelpCircle className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-1">
                            AI Explanation
                          </div>
                          <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                            {res.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
