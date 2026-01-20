import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  BarChart3, 
  History as historyicon, 
  Settings as Settingsicon, 
  Download,
  ChevronRight,
  Loader2,
  MessageCircle,
  Palette,
  Edit3,
  CheckCircle,
  Play,
  Sparkles,
  Menu,
  X,
  AlertCircle,
  Clock
} from 'lucide-react';

// API Configuration
const API_BASE = "http://localhost:5000";

async function api(path, body = {}) {
  try {
    const res = await fetch(`${API_BASE}/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error: ${res.status} - ${errorText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`API call failed for ${path}:`, error);
    throw error;
  }
}

// Utility Components
function LoadingSpinner({ size = "sm", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };
  
  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{message}</span>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// Layout Components
function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', color: 'text-blue-400' },
    { icon: FileText, label: 'Resume', path: '/resume', color: 'text-green-400' },
    { icon: BarChart3, label: 'Analysis', path: '/analysis', color: 'text-purple-400' },
    { icon: historyicon, label: 'History', path: '/history', color: 'text-yellow-400' },
    { icon: Settingsicon, label: 'Settings', path: '/settings', color: 'text-gray-400' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-40 transform transition-transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">ResumeAI</h1>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? item.color : 'group-hover:text-white'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 text-center">
              <p>ResumeAI v1.0</p>
              <p>Backend: {API_BASE}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

function TopNav({ title = "Dashboard" }) {
  return (
    <header className="lg:ml-64 bg-gray-900/50 backdrop-blur border-b border-gray-800 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg lg:text-xl font-semibold text-white ml-12 lg:ml-0">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Download PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// Page Components
function DashboardHome() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setHealth({ status: 'online', data });
      } else {
        setHealth({ status: 'error', error: `HTTP ${res.status}` });
      }
    } catch (error) {
      setHealth({ status: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create Resume',
      description: 'Build a professional resume with AI assistance',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/resume'),
      available: true
    },
    {
      title: 'Create PPT',
      description: 'Generate presentation slides',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      available: false
    },
    {
      title: 'Job Application',
      description: 'Apply to jobs with tailored resumes',
      icon: Settingsicon,
      color: 'from-green-500 to-green-600',
      available: false
    },
    {
      title: 'Notice Generator', 
      description: 'Create professional notices',
      icon: History,
      color: 'from-orange-500 to-orange-600',
      available: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Welcome to ResumeAI</h3>
        <p className="text-gray-300">Create professional documents with AI assistance</p>
      </div>

      {/* System Status */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">System Status</h4>
        {loading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <LoadingSpinner />
            <span>Checking backend connection...</span>
          </div>
        ) : health?.status === 'error' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Backend Offline - {health.error}</span>
            </div>
            <button 
              onClick={checkHealth}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-green-400">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>Backend Online</span>
            <span className="text-gray-500 text-sm">({health?.data?.timestamp})</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.available ? action.action : undefined}
            disabled={!action.available}
            className={`p-6 rounded-xl border text-left transition-all ${
              action.available 
                ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70 cursor-pointer' 
                : 'bg-gray-800/20 border-gray-700/50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h5 className="text-lg font-semibold text-white mb-2">{action.title}</h5>
            <p className="text-gray-400 text-sm mb-3">{action.description}</p>
            {action.available ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">Coming Soon</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResumeBuilder() {
  const [step, setStep] = useState('start');
  const [interviewState, setInterviewState] = useState({
    level: 'standard',
    currentQuestion: null,
    progress: { current: 0, max: 0 },
    loading: false,
    error: null
  });
  const [resumeData, setResumeData] = useState(null);

  const startInterview = async () => {
    setInterviewState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await api("/startInterview", { level: interviewState.level });
      
      setInterviewState(prev => ({
        ...prev,
        loading: false,
        progress: { current: 0, max: response.maxQuestions || 10 }
      }));
      
      setStep('interview');
      await fetchNextQuestion();
      
    } catch (error) {
      setInterviewState(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Failed to start interview: ${error.message}` 
      }));
    }
  };

  const fetchNextQuestion = async (answer = undefined) => {
    setInterviewState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await api("/getInterview", answer !== undefined ? { answer } : {});
      
      if (response.done) {
        setStep('summary');
        await generateSummary();
      } else {
        setInterviewState(prev => ({
          ...prev,
          loading: false,
          currentQuestion: {
            question: response.question,
            type: response.type || 'text',
            options: response.options || [],
            category: response.category || 'general',
          },
          progress: {
            current: response.currentCount || prev.progress.current + 1,
            max: response.maxQuestions || prev.progress.max
          }
        }));
      }
    } catch (error) {
      setInterviewState(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Failed to get question: ${error.message}` 
      }));
    }
  };

  const generateSummary = async () => {
    try {
      const response = await api("/generateResume", { method: "star", industry: "ai" });
      setResumeData(response.resume || response);
    } catch (error) {
      console.error("Failed to generate resume:", error);
      setResumeData({ 
        name: "Sample User", 
        summaryText: "Professional summary will be generated based on your interview responses.",
        skills: ["JavaScript", "React", "Node.js"]
      });
    }
  };

  const renderStep = () => {
    switch(step) {
      case 'start':
        return (
          <InterviewStart 
            level={interviewState.level}
            setLevel={(level) => setInterviewState(prev => ({ ...prev, level }))}
            onStart={startInterview}
            loading={interviewState.loading}
            error={interviewState.error}
          />
        );
      case 'interview':
        return (
          <InterviewPage 
            data={interviewState}
            onAnswer={fetchNextQuestion}
          />
        );
      case 'summary':
        return (
          <SummaryPage 
            resumeData={resumeData}
            onNext={() => setStep('editor')}
          />
        );
      case 'editor':
        return <ResumeEditor resumeData={resumeData} />;
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {renderStep()}
    </div>
  );
}

function InterviewStart({ level, setLevel, onStart, loading, error }) {
  const levels = [
    { id: "basic", label: "Basic", desc: "5 questions", time: "2-3 min", icon: "🚀" },
    { id: "standard", label: "Standard", desc: "10 questions", time: "5-7 min", icon: "⭐" },
    { id: "advanced", label: "Advanced", desc: "20 questions", time: "10-15 min", icon: "💎" },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Start Resume Interview</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Choose your interview level. Our AI will ask you targeted questions to build your perfect resume.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {levels.map((l) => (
          <button
            key={l.id}
            onClick={() => setLevel(l.id)}
            className={`p-6 rounded-xl border transition-all text-center ${
              level === l.id 
                ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20" 
                : "border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70"
            }`}
          >
            <div className="text-3xl mb-3">{l.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{l.label}</h3>
            <p className="text-gray-400 text-sm mb-1">{l.desc}</p>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{l.time}</span>
            </div>
            {level === l.id && (
              <div className="mt-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mx-auto" />
              </div>
            )}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="flex justify-center">
        <button
          onClick={onStart}
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all shadow-lg"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              <span>Starting Interview...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Start Interview</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function InterviewPage({ data, onAnswer }) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (value = undefined) => {
    const submitValue = value !== undefined ? value : answer;
    onAnswer(submitValue);
    setAnswer("");
  };

  const progress = data.progress.max > 0 
    ? Math.min(100, Math.round((data.progress.current / data.progress.max) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Interview Progress</span>
          <span className="text-sm text-white font-medium">
            {data.progress.current} / {data.progress.max}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          {progress}% Complete
        </div>
      </div>

      {/* Loading State */}
      {data.loading && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4 text-blue-400" />
          <p className="text-gray-300 font-medium">AI is preparing your next question...</p>
          <p className="text-gray-500 text-sm mt-1">This may take a few moments</p>
        </div>
      )}

      {/* Error State */}
      {data.error && (
        <ErrorMessage 
          message={data.error} 
          onRetry={() => onAnswer()} 
        />
      )}

      {/* Question */}
      {!data.loading && !data.error && data.currentQuestion && (
        <QuestionCard 
          question={data.currentQuestion}
          answer={answer}
          setAnswer={setAnswer}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function QuestionCard({ question, answer, setAnswer, onSubmit }) {
  const renderInput = () => {
    switch(question.type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onSubmit(option)}
                className="w-full p-4 text-left rounded-lg border border-gray-700 hover:border-blue-500 bg-gray-800/50 hover:bg-blue-500/10 text-white transition-all"
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
              </button>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onSubmit(true)}
              className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors"
            >
              ✓ Yes
            </button>
            <button
              onClick={() => onSubmit(false)}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors"
            >
              ✗ No
            </button>
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="px-2">
              <input
                type="range"
                min="1"
                max="5"
                value={answer || 3}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400 px-2">
              <span>1 (Poor)</span>
              <span>2</span>
              <span>3 (Average)</span>
              <span>4</span>
              <span>5 (Excellent)</span>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300">
                Selected: <strong className="ml-1">{answer || 3}</strong>
              </span>
            </div>
            <button
              onClick={() => onSubmit(answer || 3)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
            >
              Submit Rating
            </button>
          </div>
        );

      default: // text
        return (
          <div className="space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your detailed answer here..."
              className="w-full h-32 p-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
              rows={4}
            />
            <button
              onClick={() => onSubmit()}
              disabled={!answer.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
            >
              Submit Answer
            </button>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 text-xs font-medium">
            {question.category}
          </span>
          <span className="px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-gray-300 text-xs">
            {question.type.toUpperCase()}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-white leading-relaxed">
          {question.question}
        </h3>
      </div>
      
      {renderInput()}
    </div>
  );
}

function SummaryPage({ resumeData, onNext }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Interview Complete! 🎉</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Great job! Our AI has analyzed your responses and generated insights for your resume.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Professional Summary
          </h3>
          <div className="prose prose-sm text-gray-300 leading-relaxed">
            {resumeData?.summaryText || "Your professional summary is being generated based on your interview responses. This will highlight your key strengths and career objectives."}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Key Skills Identified
          </h3>
          <div className="flex flex-wrap gap-2">
            {(resumeData?.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'Problem Solving']).map((skill, i) => (
              <span 
                key={i} 
                className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-300 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-400" />
          Resume Insights
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-300">Completeness Score</span>
              <span className="text-green-400 font-semibold">85%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-300">ATS Compatibility</span>
              <span className="text-blue-400 font-semibold">Very High</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-300">Industry Alignment</span>
              <span className="text-purple-400 font-semibold">Excellent</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-300">Keyword Optimization</span>
              <span className="text-yellow-400 font-semibold">Good</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl text-white font-semibold transition-all shadow-lg"
        >
          <span>Continue to Resume Editor</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ResumeEditor({ resumeData }) {
  const [selectedSection, setSelectedSection] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [colorScheme, setColorScheme] = useState('blue');
  const [editText, setEditText] = useState('');

  const colorSchemes = {
    blue: { 
      primary: 'from-blue-500 to-blue-600', 
      accent: 'border-blue-500/30 bg-blue-600/20',
      text: 'text-blue-600'
    },
    purple: { 
      primary: 'from-purple-500 to-purple-600', 
      accent: 'border-purple-500/30 bg-purple-600/20',
      text: 'text-purple-600'
    },
    green: { 
      primary: 'from-green-500 to-green-600', 
      accent: 'border-green-500/30 bg-green-600/20',
      text: 'text-green-600'
    },
    orange: { 
      primary: 'from-orange-500 to-orange-600', 
      accent: 'border-orange-500/30 bg-orange-600/20',
      text: 'text-orange-600'
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Resume Preview */}
        <div className="flex-1">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-4 bg-gray-900/50 border-b border-gray-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume Preview
              </h3>
            </div>
            <div className="p-6 max-h-[800px] overflow-y-auto">
              <ResumePreview 
                data={resumeData} 
                colorScheme={colorSchemes[colorScheme]}
                onSectionClick={setSelectedSection}
                selectedSection={selectedSection}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar Controls */}
        <div className="lg:w-80 space-y-4">
          {/* Color Scheme Selector */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color Theme
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(colorSchemes).map(([scheme, colors]) => (
                <button
                  key={scheme}
                  onClick={() => setColorScheme(scheme)}
                  className={`relative h-12 rounded-lg bg-gradient-to-r ${colors.primary} transition-all ${
                    colorScheme === scheme ? 'ring-2 ring-white/50 scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium capitalize">{scheme}</span>
                  </div>
                  {colorScheme === scheme && (
                    <CheckCircle className="absolute -top-2 -right-2 w-5 h-5 text-white bg-green-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* AI Chat Assistant */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="w-full p-4 flex items-center justify-between text-white hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">AI Assistant</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${chatOpen ? 'rotate-90' : ''}`} />
            </button>
            
            {chatOpen && (
              <div className="border-t border-gray-700">
                <div className="p-4 space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-3 text-sm text-gray-300">
                    <p className="font-medium text-blue-400 mb-2">💡 AI Suggestions:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• "Make my summary more impactful"</li>
                      <li>• "Add quantifiable achievements"</li>
                      <li>• "Improve technical skills section"</li>
                      <li>• "Optimize for ATS systems"</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      placeholder="Ask me anything..."
                      className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section Editor */}
          {selectedSection && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-green-400" />
                Edit {selectedSection}
              </h3>
              <div className="space-y-3">
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder={`Modify your ${selectedSection} section here...`}
                  className="w-full h-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      // Apply changes logic here
                      setSelectedSection(null);
                      setEditText('');
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Apply Changes
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedSection(null);
                      setEditText('');
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResumePreview({ data, colorScheme, onSectionClick, selectedSection }) {
  const handleSectionClick = (section) => {
    onSectionClick(selectedSection === section ? null : section);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header Section */}
      <div 
        className={`relative p-6 bg-gradient-to-r ${colorScheme.primary} text-white cursor-pointer transition-all ${
          selectedSection === 'header' ? 'ring-4 ring-yellow-400 ring-offset-2' : 'hover:shadow-lg'
        }`}
        onClick={() => handleSectionClick('header')}
      >
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{data?.name || 'John Doe'}</h1>
        <div className="text-sm opacity-90 space-y-1">
          <p>{data?.contact?.email || 'john.doe@email.com'} • {data?.contact?.phone || '+1 (555) 123-4567'}</p>
          <p>{data?.contact?.location || 'New York, NY'}</p>
        </div>
        {selectedSection === 'header' && (
          <div className="absolute top-2 right-2">
            <Edit3 className="w-4 h-4 text-yellow-300" />
          </div>
        )}
      </div>

      {/* Professional Summary */}
      <div 
        className={`p-6 border-b border-gray-200 cursor-pointer transition-all ${
          selectedSection === 'summary' ? 'ring-4 ring-yellow-400 ring-offset-2 bg-yellow-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => handleSectionClick('summary')}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Professional Summary</h2>
          {selectedSection === 'summary' && <Edit3 className="w-4 h-4 text-yellow-600" />}
        </div>
        <p className="text-gray-600 leading-relaxed">
          {data?.summaryText || 'Experienced professional with expertise in modern technologies and a passion for creating innovative solutions that drive business growth and user satisfaction.'}
        </p>
      </div>

      {/* Work Experience */}
      <div 
        className={`p-6 border-b border-gray-200 cursor-pointer transition-all ${
          selectedSection === 'experience' ? 'ring-4 ring-yellow-400 ring-offset-2 bg-yellow-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => handleSectionClick('experience')}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Work Experience</h2>
          {selectedSection === 'experience' && <Edit3 className="w-4 h-4 text-yellow-600" />}
        </div>
        {(data?.experience || [
          {
            role: 'Senior Software Developer',
            company: 'Tech Innovation Corp',
            years: '2021 - Present',
            achievements: [
              'Led development of core product features serving 100K+ users',
              'Improved system performance by 40% through optimization',
              'Mentored 3 junior developers and conducted code reviews'
            ]
          },
          {
            role: 'Software Developer',
            company: 'Digital Solutions Ltd',
            years: '2019 - 2021',
            achievements: [
              'Developed responsive web applications using React and Node.js',
              'Collaborated with cross-functional teams to deliver projects on time',
              'Implemented automated testing reducing bugs by 30%'
            ]
          }
        ]).map((exp, i) => (
          <div key={i} className="mb-6 last:mb-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
              <h3 className="font-semibold text-gray-800">{exp.role}</h3>
              <span className="text-sm text-gray-500 mt-1 sm:mt-0">{exp.years}</span>
            </div>
            <p className={`${colorScheme.text} font-medium mb-2`}>{exp.company}</p>
            <ul className="space-y-1 text-gray-600 text-sm">
              {exp.achievements?.map((achievement, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div 
        className={`p-6 border-b border-gray-200 cursor-pointer transition-all ${
          selectedSection === 'education' ? 'ring-4 ring-yellow-400 ring-offset-2 bg-yellow-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => handleSectionClick('education')}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Education</h2>
          {selectedSection === 'education' && <Edit3 className="w-4 h-4 text-yellow-600" />}
        </div>
        {(data?.education || [
          {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'State University',
            year: '2019',
            gpa: '3.8/4.0'
          }
        ]).map((edu, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                <p className={`${colorScheme.text} font-medium`}>{edu.institution}</p>
                {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
              </div>
              <span className="text-sm text-gray-500 mt-2 sm:mt-0">{edu.year}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div 
        className={`p-6 cursor-pointer transition-all ${
          selectedSection === 'skills' ? 'ring-4 ring-yellow-400 ring-offset-2 bg-yellow-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => handleSectionClick('skills')}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
          {selectedSection === 'skills' && <Edit3 className="w-4 h-4 text-yellow-600" />}
        </div>
        <div className="flex flex-wrap gap-2">
          {(data?.skills || [
            'JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 
            'MongoDB', 'PostgreSQL', 'Git', 'Agile', 'Problem Solving', 'Leadership'
          ]).map((skill, i) => (
            <span 
              key={i} 
              className={`px-3 py-1 rounded-full text-sm font-medium ${colorScheme.accent} ${colorScheme.text}`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Projects (if available) */}
      {data?.projects && data.projects.length > 0 && (
        <div 
          className={`p-6 border-t border-gray-200 cursor-pointer transition-all ${
            selectedSection === 'projects' ? 'ring-4 ring-yellow-400 ring-offset-2 bg-yellow-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => handleSectionClick('projects')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
            {selectedSection === 'projects' && <Edit3 className="w-4 h-4 text-yellow-600" />}
          </div>
          {data.projects.map((project, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <h3 className="font-semibold text-gray-800 mb-1">{project.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{project.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Additional Pages
function Analysis() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Resume Analysis</h2>
        <p className="text-gray-400">Comprehensive insights about your resume performance</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">ATS Score</h3>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">85%</div>
          <p className="text-gray-400 text-sm">Excellent ATS compatibility</p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Keywords</h3>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">72%</div>
          <p className="text-gray-400 text-sm">Good optimization</p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Completeness</h3>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">90%</div>
          <p className="text-gray-400 text-sm">Well structured</p>
        </div>
      </div>
    </div>
  );
}

function History() {
  const [resumes] = useState([
    { id: 1, name: 'Software Developer Resume', date: '2024-11-20', score: 85 },
    { id: 2, name: 'Full Stack Developer Resume', date: '2024-11-15', score: 78 },
    { id: 3, name: 'Frontend Developer Resume', date: '2024-11-10', score: 82 }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Resume History</h2>
        <Link 
          to="/resume" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          Create New
        </Link>
      </div>
      
      <div className="space-y-4">
        {resumes.map((resume) => (
          <div key={resume.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-2">{resume.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Created: {resume.date}</span>
                  <span>•</span>
                  <span className="text-green-400">ATS Score: {resume.score}%</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Settings</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Default Template</label>
              <select className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                <option>Modern Professional</option>
                <option>Creative Design</option>
                <option>Classic Format</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Interview Level</label>
              <select className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                <option>Basic (5 questions)</option>
                <option>Standard (10 questions)</option>
                <option>Advanced (20 questions)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Backend URL</label>
              <input 
                type="text" 
                defaultValue={API_BASE}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-300">Status</span>
              <span className="text-green-400 text-sm font-medium">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Layout
function Layout({ children }) {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard';
      case '/resume': return 'Resume Builder';
      case '/analysis': return 'Analysis';
      case '/history': return 'History';
      case '/settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <Sidebar />
      <TopNav title={getPageTitle()} />
      <main className="lg:ml-64 pt-20 lg:pt-16 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// Main App
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/resume" element={<ResumeBuilder />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}