import { useState } from 'react'
import AppLayout from '../components/AppLayout'
import { summaryAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import {
  FileText, BookOpen, Download, Clipboard, Check, RotateCcw,
  Sparkles, AlertCircle, FileSpreadsheet
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'

export default function SummarizerPage() {
  const [mode, setMode] = useState('topic') // 'topic' or 'text'
  const [topic, setTopic] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [result, setResult] = useState(null) // { summary: '', topic: '' }
  const [copied, setCopied] = useState(false)

  const handleSummarize = async (e) => {
    e.preventDefault()
    const content = mode === 'topic' ? topic.trim() : text.trim()
    if (!content) {
      toast.error(mode === 'topic' ? 'Please enter a topic' : 'Please enter some text')
      return
    }

    setLoading(true)
    try {
      const res = await summaryAPI.summarize({
        topic: mode === 'topic' ? topic : '',
        text: mode === 'text' ? text : ''
      })
      setResult({
        summary: res.data.summary,
        topic: res.data.topic || topic || 'Custom Text'
      })
      toast.success('Summary generated successfully!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to generate summary.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = () => {
    if (!result?.summary) return
    navigator.clipboard.writeText(result.summary)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = async () => {
    if (!result?.summary) return
    setExportingPdf(true)
    try {
      const res = await summaryAPI.exportPDF({
        summary: result.summary,
        topic: result.topic
      })
      
      // Since responseType is 'blob', we handle it as a blob download
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const sanitizedTopic = result.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      link.setAttribute('download', `study_notes_${sanitizedTopic}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('PDF download started!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to export PDF. ReportLab may not be installed on the server.')
    } finally {
      setExportingPdf(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setTopic('')
    setText('')
  }

  return (
    <AppLayout>
      {/* Page Title */}
      <div className="mb-6 animate-slide-up">
        <h1 className="page-title">AI Study Summarizer</h1>
        <p className="page-subtitle">Convert complex topics or lengthy text into structured, easy-to-read study notes.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 glass rounded-2xl border border-dark-800 animate-fade-in">
          <LoadingSpinner size="lg" text="Analyzing content and composing study summary..." />
          <p className="text-xs text-gray-500 mt-4 max-w-sm text-center">
            Our AI is distilling key definitions, structured bullet points, and essential highlights into a cohesive outline...
          </p>
        </div>
      ) : result ? (
        /* Result/Summary View */
        <div className="max-w-4xl mx-auto animate-slide-up">
          {/* Header toolbar */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary">Study Notes</span>
              <h2 className="text-white font-bold text-lg font-display truncate max-w-md">
                {result.topic}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyToClipboard}
                className="btn-ghost text-xs py-2 px-3.5 flex items-center gap-1.5"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Clipboard className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exportingPdf}
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 shadow-glow-secondary disabled:opacity-50"
              >
                {exportingPdf ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exportingPdf ? 'Exporting...' : 'Export PDF'}
              </button>
              <button
                onClick={handleReset}
                className="btn-ghost text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Notes display */}
          <div className="card border border-dark-850 p-6 md:p-8">
            <article className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.summary}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      ) : (
        /* Setup Form View */
        <div className="max-w-3xl mx-auto card animate-slide-up">
          {/* Tabs */}
          <div className="flex border-b border-dark-800 mb-6">
            <button
              onClick={() => setMode('topic')}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                mode === 'topic'
                  ? 'border-primary-500 text-white font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-400'
              }`}
            >
              <BookOpen className="w-4.5 h-4.5" />
              Summarize Topic
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                mode === 'text'
                  ? 'border-primary-500 text-white font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-400'
              }`}
            >
              <FileText className="w-4.5 h-4.5" />
              Summarize Custom Text
            </button>
          </div>

          <form onSubmit={handleSummarize} className="space-y-5">
            {mode === 'topic' ? (
              <div className="animate-fade-in">
                <label className="input-label" htmlFor="topicInput">Topic Name</label>
                <div className="relative">
                  <input
                    type="text"
                    id="topicInput"
                    placeholder="e.g. Mitochondria structure and function, Binary Search Trees, French Revolution"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="input pr-10"
                    maxLength={150}
                    required
                  />
                  <div className="absolute right-3.5 top-3.5 text-primary-400">
                    <Sparkles className="w-5 h-5 animate-pulse-slow" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  AI will write structured notes covering definitions, main points, and key concepts.
                </p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <label className="input-label" htmlFor="textInput">Paste Long Text</label>
                <textarea
                  id="textInput"
                  placeholder="Paste article, textbook paragraph, or lecture notes here (up to 5000 characters)..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="input h-64 resize-none"
                  maxLength={5000}
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Max 5000 characters. Paste raw content.
                  </span>
                  <span className={`text-xs ${text.length >= 4800 ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>
                    {text.length} / 5000
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-2 justify-center shadow-glow-primary">
              <Sparkles className="w-4.5 h-4.5" />
              Generate Study Summary
            </button>
          </form>
        </div>
      )}
    </AppLayout>
  )
}
