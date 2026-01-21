import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Download, Edit3, Palette, X, Send, ArrowLeft, AlertCircle, Loader2, Check } from 'lucide-react';
import { downloadPresentation } from "./services/pptxService";
import Editor from '@monaco-editor/react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { getCurrentUser, logout } from './services/authService';
import { Navigate } from 'react-router-dom';
const API_BASE = "http://localhost:5000";

// Global PrivateRoute component used across routes
const PrivateRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = React.useState(false);
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    const check = async () => {
      const current = await getCurrentUser();
      setUser(current);
      setAuthChecked(true);
    };
    check();
  }, []);
  if (!authChecked) return null;
  return user ? children : <Navigate to="/login" replace />;
};



async function api(path, body) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${txt}`);
  }
  return res.json();
}

function Badge({ children }) {
  return (
    <span className="px-2 py-1 rounded-full text-xs bg-slate-800 text-slate-100 border border-slate-700">
      {children}
    </span>
  );
}

// HTML to PDF conversion function
function downloadHTMLAsPDF(htmlContent, filename = 'resume.pdf') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups for PDF download');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @media print {
                body { 
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    margin: 0;
                    padding: 0;
                }
                @page {
                    margin: 0.5in;
                    size: A4;
                }
                .no-print { display: none !important; }
                .page-break { page-break-before: always; }
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.5;
                color: #1f2937;
            }
        </style>
    </head>
    <body>
        ${htmlContent}
        <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
            <button onclick="window.print()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">
                Download PDF
            </button>
            <button onclick="window.close()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer;">
                Close
            </button>
        </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
}

function AnalysisPage() {
  const [method, setMethod] = useState("auto");
  const [industry, setIndustry] = useState("ai");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedHighlights, setSelectedHighlights] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const methodParam = urlParams.get('method');
    const industryParam = urlParams.get('industry');
    
    if (methodParam) setMethod(methodParam);
    if (industryParam) setIndustry(industryParam);
    
    if (methodParam && industryParam) {
      runAnalysis(methodParam, industryParam);
    }
  }, []);

  const runAnalysis = async (selectedMethod = method, selectedIndustry = industry) => {
    setLoading(true);
    try {
      const body = { 
        method: selectedMethod === "auto" ? undefined : selectedMethod, 
        industry: selectedIndustry 
      };
      const res = await api("/analyzeProfile", body);
      setAnalysis(res.analysis);
    } catch (e) {
      alert("Analysis failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

 const proceedToResume = async () => {
  try {
    navigate("/resume", { state: { resume: null, pending: true, selectedHighlights } });
  } catch (e) {
    alert("Resume generation failed: " + e.message);
  }
};


  const MetricCard = ({ metric, className = "" }) => (
    <div className={`p-4 rounded-xl border border-slate-700 bg-slate-800/40 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{metric.metric}</h4>
        <span className="text-2xl font-bold text-emerald-400">{metric.userScore}</span>
      </div>
      <div className="relative h-2 bg-slate-700 rounded-full mb-2">
        <div 
          className="absolute h-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
          style={{ width: `${(metric.userScore / 100) * 100}%` }}
        />
        <div 
          className="absolute h-2 w-1 bg-slate-400 rounded-full"
          style={{ left: `${(metric.averageScore / 100) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span>Avg: {metric.averageScore}</span>
        <span>Top {100 - metric.percentile}%</span>
      </div>
      <p className="text-xs text-slate-300">{metric.description}</p>
    </div>
  );

  const CircularProgress = ({ percentage, label, color = "#10b981" }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-700"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(percentage / 100) * 220} 220`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{percentage}</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 mt-1 text-center">{label}</span>
    </div>
  );

  return (
    <Page title="Profile Analysis">
      {loading && !analysis ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Your Profile</h3>
            <p className="text-slate-400">AI is processing your responses and generating insights...</p>
          </div>
        </div>
      ) : analysis ? (
        <div className="space-y-8">
          {/* Header Summary */}
          <div className="text-center p-8 bg-gradient-to-r from-indigo-900/20 to-emerald-900/20 rounded-2xl border border-slate-800">
            <h1 className="text-2xl font-bold mb-4">Profile Analysis Complete</h1>
            <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {analysis.profileSummary}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 text-center">
              <CircularProgress 
                percentage={analysis.experienceLevel?.confidence || 85} 
                label="Profile Confidence"
                color="#3b82f6"
              />
              <div className="mt-4">
                <div className="font-semibold">{analysis.experienceLevel?.category}</div>
                <div className="text-sm text-slate-400">{analysis.experienceLevel?.yearsEstimate} years</div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 text-center">
              <CircularProgress 
                percentage={analysis.industryFit?.score || 80} 
                label="Industry Fit"
                color="#10b981"
              />
              <div className="mt-4 text-sm text-slate-300">
                {analysis.industryFit?.reasoning}
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 text-center">
              <CircularProgress 
                percentage={analysis.marketInsights?.demandLevel === 'high' ? 85 : analysis.marketInsights?.demandLevel === 'medium' ? 65 : 45} 
                label="Market Demand"
                color="#f59e0b"
              />
              <div className="mt-4">
                <div className="font-semibold capitalize">{analysis.marketInsights?.demandLevel || 'High'} Demand</div>
                <div className="text-sm text-slate-400">{analysis.marketInsights?.salaryRange || '$60k - $120k'}</div>
              </div>
            </div>
          </div>

          {/* Benchmark Comparisons */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              How You Compare to Other Professionals
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.benchmarkComparisons?.map((metric, i) => (
                <MetricCard key={i} metric={metric} />
              ))}
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40">
              <h3 className="font-semibold mb-4 text-blue-400">Technical Skills</h3>
              <div className="space-y-2">
                {analysis.skillsAnalysis?.technical?.map((skill, i) => (
                  <div key={i} className="px-3 py-1 rounded-full bg-blue-900/30 border border-blue-700/50 text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40">
              <h3 className="font-semibold mb-4 text-emerald-400">Soft Skills</h3>
              <div className="space-y-2">
                {analysis.skillsAnalysis?.soft?.map((skill, i) => (
                  <div key={i} className="px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-700/50 text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40">
              <h3 className="font-semibold mb-4 text-purple-400">Leadership</h3>
              <div className="space-y-2">
                {analysis.skillsAnalysis?.leadership?.map((skill, i) => (
                  <div key={i} className="px-3 py-1 rounded-full bg-purple-900/30 border border-purple-700/50 text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resume Recommendations */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40">
            <h3 className="font-semibold mb-4">Resume Building Recommendations</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Suggested Highlights</h4>
                <div className="space-y-2">
                  {analysis.resumeRecommendations?.keyHighlights?.map((highlight, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedHighlights.includes(highlight)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHighlights([...selectedHighlights, highlight]);
                          } else {
                            setSelectedHighlights(selectedHighlights.filter(h => h !== highlight));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{highlight}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Focus Sections</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.resumeRecommendations?.sectionsToFocus?.map((section, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-700/50 text-sm">
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            <button
              onClick={() => navigate("/method")}
              className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300"
            >
              Back to Method
            </button>
            <button
              onClick={proceedToResume}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold disabled:opacity-50"
            >
              {loading ? "Generating Resume..." : "Create Resume"}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-4">No Analysis Data</h2>
          <p className="text-slate-400 mb-6">Please complete the interview and method selection first.</p>
          <Link to="/method" className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500">
            Go to Method Selection
          </Link>
        </div>
      )}
    </Page>
  );
}

async function checkMissingInfo() {
  try {
    const response = await api("/checkMissingInfo", {});
    return response;
  } catch (err) {
    console.error("Error checking missing info:", err);
    return { success: false };
  }
}



function ResumePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [resumeData, setResumeData] = useState(location.state?.resume || null);
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Missing info state
  const [showMissingInfo, setShowMissingInfo] = useState(false);
  const [missingItems, setMissingItems] = useState([]);
  const [missingInfoAnalyzing, setMissingInfoAnalyzing] = useState(false);

  const [theme, setTheme] = useState({
    primary: "#2563eb",
    text: "#111827",
    muted: "#6b7280",
  });

  // Enhanced editing states with Monaco
  const [showEditor, setShowEditor] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedTextContext, setSelectedTextContext] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Background and styling
  const [backgroundExpanded, setBackgroundExpanded] = useState(false);

  const editorRef = useRef(null);

  // Check for data and redirect if missing
  useEffect(() => {
    if (!location.state?.pending && !resumeData && !htmlContent) {
      navigate('/method');
      return;
    }

    if (location.state?.pending) {
      generateResume(location.state?.selectedHighlights || []);
    }
  }, []);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-check for missing items after resume generation
  useEffect(() => {
    if (htmlContent && resumeData) {
      checkForMissingItems();
    }
  }, [htmlContent, resumeData]);

  // Enhanced generateResume with improved missing info check
  async function generateResume(highlights) {
    setLoading(true);
    try {
      const gen = await api("/generateResume", {
        preference: "ats_friendly",
        selectedHighlights: highlights,
      });
      
      if (gen.layout) {
        setResumeData(gen.layout.data);
        setHtmlContent(gen.layout.htmlContent);
      } else {
        alert("Resume generation failed.");
        navigate("/analysis");
      }
    } catch (err) {
      console.error("Resume generation error:", err);
      alert("Resume generation failed: " + err.message);
      navigate("/analysis");
    } finally {
      setLoading(false);
    }
  }

  // New function to check for missing items using AI
  async function checkForMissingItems() {
    setMissingInfoAnalyzing(true);
    try {
      const analysis = await api("/analyzeMissingItems", {
        resumeData,
        htmlContent
      });
      
      if (analysis.success && analysis.missingItems && analysis.missingItems.length > 0) {
        setMissingItems(analysis.missingItems);
        setShowMissingInfo(true);
      }
    } catch (error) {
      console.error("Missing items analysis failed:", error);
    } finally {
      setMissingInfoAnalyzing(false);
    }
  }

  // Handle missing item correction
  async function handleMissingItemCorrection(item, value) {
    setLoading(true);
    try {
      const result = await api("/correctMissingItem", {
        resumeData,
        item,
        value
      });
      
      if (result.success && result.layout) {
        setResumeData(result.layout.data);
        setHtmlContent(result.layout.htmlContent);
        
        // Remove corrected item from missing items
        setMissingItems(prev => prev.filter(mi => mi.field !== item.field));
        
        // If no more missing items, close modal
        if (missingItems.length === 1) {
          setShowMissingInfo(false);
        }
      }
    } catch (error) {
      console.error("Error correcting missing item:", error);
      alert("Failed to update item: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Enhanced text selection handler
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedStr = selection.toString().trim();
    
    if (selectedStr && selectedStr.length > 5) {
      // Get surrounding context for better AI understanding
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parent = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
      
      const context = parent.textContent || parent.innerText || '';
      
      setSelectedText(selectedStr);
      setSelectedTextContext(context);
      setEditorContent(`Modify the selected text: "${selectedStr}"\n\nSuggestions:\n- `);
      setShowEditor(true);
    }
  };

  // Handle Monaco editor changes
  const handleEditorChange = (value) => {
    setEditorContent(value);
  };

  // Apply selected text modifications only
  async function applySelectedTextModification() {
    if (!selectedText || !editorContent.trim()) return;
    
    setIsModifying(true);
    try {
      const result = await api("/modifySelectedText", {
        resumeData,
        htmlContent,
        selectedText,
        context: selectedTextContext,
        modification: editorContent
      });
      
      if (result.success && result.layout) {
        setResumeData(result.layout.data);
        setHtmlContent(result.layout.htmlContent);
        setShowEditor(false);
        setSelectedText('');
        setEditorContent('');
        
        // Clear selection
        window.getSelection().removeAllRanges();
      }
    } catch (error) {
      console.error("Selected text modification failed:", error);
      alert("Modification failed: " + error.message);
    } finally {
      setIsModifying(false);
    }
  }

  // Enhanced PDF download
  const handleDownloadPDF = async () => {
    if (!resumeData) {
      alert("Resume data not ready. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/generatePDF`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeData,
          theme,
          format: 'pdf'
        })
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personalInfo?.name || 'Resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading screen
  if (loading && !htmlContent) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${backgroundExpanded ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-slate-950'} text-slate-100`}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Building Your Resume</h3>
            <p className="text-slate-400">Please wait while we create your professional resume...</p>
          </div>
        </div>
      </div>
    );
  }

  // Missing Info Modal with individual item correction
  if (showMissingInfo && missingItems.length > 0) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${backgroundExpanded ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-slate-950'} text-slate-100`}>
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-3xl w-full border border-slate-700 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="text-yellow-400" size={24} />
              <h3 className="text-xl font-semibold text-yellow-400">
                Resume Quality Check
              </h3>
              {missingInfoAnalyzing && <Loader2 className="animate-spin text-blue-400" size={20} />}
            </div>
            
            <p className="text-slate-300 mb-6">
              Our AI detected some areas that could improve your resume's effectiveness. 
              Please review and update these items:
            </p>
            
            <div className="space-y-4">
              {missingItems.map((item, index) => (
                <MissingItemCorrector
                  key={index}
                  item={item}
                  onCorrect={(value) => handleMissingItemCorrection(item, value)}
                  isLoading={loading}
                />
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMissingInfo(false)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium"
              >
                Continue Anyway ({missingItems.length} items remaining)
              </button>
              <button
                onClick={() => navigate('/analysis')}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium"
              >
                Back to Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data found
  if (!htmlContent && !resumeData) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${backgroundExpanded ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-slate-950'} text-slate-100`}>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-4">No Resume Data Found</h2>
          <p className="text-slate-400 mb-6">Please complete the interview and analysis first.</p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/interview" 
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Start Interview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main render with enhanced background and Monaco editor
  return (
    <div className={`min-h-screen transition-all duration-500 ${backgroundExpanded ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-slate-950'} text-slate-100`}>
      {/* Enhanced Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBackgroundExpanded(!backgroundExpanded)}
              className="font-semibold text-lg hover:text-indigo-400 transition-colors"
            >
              Resume Builder
            </button>
            {missingInfoAnalyzing && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Analyzing quality...
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              to="/analysis"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            >
              <Download size={16} />
              {loading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Desktop Layout */}
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Left Side - Resume Preview */}
          <div className="col-span-2">
            {htmlContent && (
              <div className="h-full border border-slate-700 rounded-xl overflow-hidden bg-slate-900/40">
                <div className="bg-slate-800 p-3 text-sm text-slate-300 flex justify-between items-center">
                  <span>Live Preview (ATS-Compatible)</span>
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                    Select text to edit precisely
                  </span>
                </div>
                <div
                  className="bg-white p-6 h-[calc(100%-48px)] overflow-y-auto cursor-text hover:bg-gray-50/50 transition-colors"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                  onMouseUp={handleTextSelection}
                  style={{ userSelect: 'text' }}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar - Enhanced Controls */}
          <div className="space-y-4 h-full overflow-y-auto">
            {/* Theme Controls */}
            <div className="p-4 border border-slate-700 rounded-xl bg-slate-900/40">
              <div className="flex items-center gap-2 mb-2">
                <Palette size={16} />
                <h3 className="font-semibold">Theme Color</h3>
              </div>
              <input
                type="color"
                value={theme.primary}
                onChange={(e) => setTheme(prev => ({ ...prev, primary: e.target.value }))}
                className="w-full h-10 rounded-lg"
              />
            </div>

            {/* Selected Text Editor */}
            {selectedText && (
              <div className="p-4 border border-emerald-500 rounded-xl bg-emerald-900/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-emerald-300 flex items-center gap-2">
                    <Edit3 size={16} />
                    Selected: "{selectedText.substring(0, 30)}..."
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedText('');
                      setShowEditor(false);
                      window.getSelection().removeAllRanges();
                    }}
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    <X size={16} />
                  </button>
                </div>
                <button
                  onClick={() => setShowEditor(true)}
                  className="w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-medium"
                >
                  Edit Selected Text
                </button>
              </div>
            )}

            {/* Quality Checker */}
            <div className="p-4 border border-slate-700 rounded-xl bg-slate-900/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  Quality Check
                </h3>
                <button
                  onClick={checkForMissingItems}
                  disabled={missingInfoAnalyzing}
                  className="text-xs px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {missingInfoAnalyzing ? "Analyzing..." : "Re-analyze"}
                </button>
              </div>
              <div className="text-sm text-slate-400">
                AI checks your resume for completeness and professional standards
              </div>
            </div>

            {/* ATS Compliance */}
            <div className="p-4 border border-slate-700 rounded-xl bg-slate-900/40">
              <h3 className="font-semibold mb-2 text-green-400">✓ ATS Compatible</h3>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Single column layout</li>
                <li>• Standard fonts</li>
                <li>• Selectable text</li>
                <li>• Clean structure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Monaco Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-4xl h-[80vh] border border-slate-700 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  Edit: "{selectedText.substring(0, 50)}..."
                </h3>
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 border border-slate-700 rounded-lg overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="markdown"
                  theme="vs-dark"
                  value={editorContent}
                  onChange={handleEditorChange}
                  options={{
                    fontSize: 14,
                    wordWrap: 'on',
                    lineNumbers: 'off',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                  }}
                  onMount={(editor) => { editorRef.current = editor; }}
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={applySelectedTextModification}
                  disabled={isModifying || !editorContent.trim()}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {isModifying ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Applying Changes...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Apply to Selected Text Only
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Component for handling individual missing item corrections
function MissingItemCorrector({ item, onCorrect, isLoading }) {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onCorrect(value);
      setValue(''); // Clear on success
    } catch (error) {
      console.error('Error submitting correction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-900/10">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-yellow-400 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-300 mb-1">{item.field}</h4>
          <p className="text-sm text-slate-300 mb-3">{item.issue}</p>
          
          {item.suggestions && (
            <div className="mb-3">
              <p className="text-xs text-slate-400 mb-1">Suggestions:</p>
              <div className="flex flex-wrap gap-1">
                {item.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setValue(suggestion)}
                    className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={item.placeholder || "Enter correct information..."}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || isSubmitting || isLoading}
              className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-sm font-medium flex items-center gap-1"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Fix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



function Page({ title, children, right }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-semibold text-lg">Resume AI Tester</Link>
            <Badge>Demo</Badge>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="hover:underline" to="/">Home</Link>
            <Link className="hover:underline" to="/interview">Interview</Link>
            <Link className="hover:underline" to="/method">Method</Link>
            <Link className="hover:underline" to="/analysis">Analysis</Link>
          </nav>
          {right}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      <footer className="max-w-5xl mx-auto px-4 py-8 text-xs text-slate-400">
        HTML + Tailwind → PDF | ATS Compatible | New: AI Profile Analysis with Benchmarks
      </footer>
    </div>
  );
}

function Home() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      setHealth({ error: e.message });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { checkHealth(); }, []);

  return (
    <Page title="Home">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40">
          <h2 className="text-xl font-semibold mb-3">Health Check</h2>
          <div className="flex gap-3">
            <button
              onClick={checkHealth}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
            >
              {loading ? "Checking..." : "Re-run"}
            </button>
            <button
              onClick={downloadPresentation}
              className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-500"
            >
              Download Presentation
            </button>
          </div>
          <pre className="mt-4 text-xs p-3 bg-slate-900 rounded-xl overflow-x-auto border border-slate-800">
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
        <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40">
          <h2 className="text-xl font-semibold mb-3">Enhanced Workflow</h2>
          <div className="space-y-3 text-sm text-slate-300 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs">1</div>
              <span>Complete interview with smart question combining</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs">2</div>
              <span>Select method & industry for optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs">3</div>
              <span>Get AI analysis with statistical comparisons</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-xs">4</div>
              <span>Generate ATS-compatible resume</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500" to="/interview">Start Interview</Link>
            <Link className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500" to="/method">Method Selection</Link>
          </div>
          <div className="mt-4 p-3 bg-slate-800 rounded-xl">
            <div className="text-xs font-semibold text-purple-400 mb-1">NEW: AI Analysis</div>
            <div className="text-xs text-slate-400">Get detailed insights on how you compare to other professionals with visual metrics</div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function StartInterviewCard({ onStarted }) {
  const [level, setLevel] = useState("standard");
  const [loading, setLoading] = useState(false);
  const levels = [
    { id: "basic", label: "Basic", desc: "~3 combined questions", efficiency: "High efficiency - AI combines questions" },
    { id: "standard", label: "Standard", desc: "~8 questions", efficiency: "Balanced approach" },
    { id: "advanced", label: "Advanced", desc: "~15 questions", efficiency: "Comprehensive coverage" },
  ];

  const start = async () => {
    setLoading(true);
    try {
      const res = await api("/startInterview", { level });
      onStarted?.(res);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40">
      <h3 className="text-lg font-semibold mb-4">Start Interview</h3>
      <div className="grid grid-cols-1 gap-4 mb-4">
        {levels.map((l) => (
          <button
            key={l.id}
            onClick={() => setLevel(l.id)}
            className={`p-4 rounded-xl border text-left ${
              level === l.id ? "border-indigo-500 bg-indigo-600/20" : "border-slate-700 bg-slate-800/60"
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="font-semibold">{l.label}</div>
              <div className="text-xs text-slate-300">{l.desc}</div>
            </div>
            <div className="text-xs text-slate-400">{l.efficiency}</div>
          </button>
        ))}
      </div>
      <button
        onClick={start}
        className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
        disabled={loading}
      >
        {loading ? "Starting..." : "Start Interview"}
      </button>
    </div>
  );
}

function Question({ q, onAnswer }) {
  const [value, setValue] = useState("");

  useEffect(() => setValue(""), [q?.question]);

  if (!q) return null;

  const submit = (v) => {
    onAnswer(v ?? value);
  };

  const isMultipleFields = q.requiresMultipleFields || q.question.toLowerCase().includes('provide') || q.question.toLowerCase().includes('describe your');

  return (
    <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-sm text-slate-400">Category: {q.category || "general"}</div>
        <div className="text-sm text-slate-400">•</div>
        <div className="text-sm text-slate-400">Type: {q.type}</div>
        {isMultipleFields && (
          <>
            <div className="text-sm text-slate-400">•</div>
            <Badge>Combined Question</Badge>
          </>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-4">{q.question}</h3>
      
      {isMultipleFields && (
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <div className="text-sm text-blue-200">Tip: This question combines multiple resume sections for efficiency. Please provide all requested information in your answer.</div>
        </div>
      )}

      {q.type === "mcq" && Array.isArray(q.options) && q.options.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => submit(opt)} className="p-3 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/60 text-left">
              {opt}
            </button>
          ))}
        </div>
      ) : q.type === "boolean" ? (
        <div className="flex gap-3">
          <button onClick={() => submit(true)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500">True</button>
          <button onClick={() => submit(false)} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500">False</button>
        </div>
      ) : q.type === "scale" ? (
        <div>
          <input type="range" min={1} max={5} value={value || 3} onChange={(e) => setValue(e.target.value)} className="w-full" />
          <div className="mt-2 text-sm">Selected: <Badge>{value || 3}</Badge></div>
          <button onClick={() => submit(value || 3)} className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500">Submit</button>
        </div>
      ) : (
        <div>
          <textarea
            className={`w-full rounded-xl bg-slate-900 border border-slate-700 p-3 ${isMultipleFields ? 'h-40' : 'h-28'}`}
            placeholder={isMultipleFields ? "Provide all requested information in detail..." : "Type your answer..."}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button 
            onClick={() => submit()} 
            disabled={!value.trim()}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
}

function Interview() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState({ current: 0, max: 0 });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchNext = async (answer) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api("/getInterview", answer !== undefined ? { answer } : {});
      if (res.done) {
        setDone(true);
      } else {
        setQuestion({
          question: res.question,
          type: res.type,
          options: res.options,
          category: res.category,
          requiresMultipleFields: res.requiresMultipleFields
        });
        setProgress({
          current: res.currentCount ?? progress.current + 1,
          max: res.maxQuestions ?? progress.max
        });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const start = async (info) => {
    setStarted(true);
    setProgress({ current: 0, max: info?.maxQuestions || 0 });
    await fetchNext();
  };

  return (
    <Page title="Interview">
      {!started ? (
        <StartInterviewCard onStarted={start} />
      ) : done ? (
        <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40 text-center">
          <h3 className="text-xl font-semibold mb-2 text-green-400">Interview Complete</h3>
          <p className="text-slate-300 mb-4">All necessary information collected. Proceed to method selection and analysis.</p>
          <Link to="/method" className="inline-block px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500">Go to Method Selection</Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-300">Interview Progress</div>
            <div className="text-sm flex items-center gap-2">
              <Badge>{progress.current}</Badge> 
              <span className="text-slate-400">of</span> 
              <Badge>{progress.max}</Badge>
              <span className="text-xs text-slate-500">
                ({progress.max ? Math.round((progress.current / progress.max) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-emerald-600 transition-all duration-300"
              style={{ width: `${progress.max ? Math.min(100, Math.round((progress.current / progress.max) * 100)) : 0}%` }}
            />
          </div>

          {loading && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                <span>AI is preparing your next question...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-900/50 border border-rose-700 text-center text-rose-200">
              {error}
              <button 
                onClick={() => fetchNext()}
                className="ml-3 px-3 py-1 rounded bg-rose-700 hover:bg-rose-600 text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && <Question q={question} onAnswer={(ans) => fetchNext(ans)} />}
        </div>
      )}
    </Page>
  );
}

const METHOD_OPTIONS = [
  { id: "star", name: "STAR", desc: "Situation-Task-Action-Result" },
  { id: "car", name: "CAR", desc: "Challenge-Action-Result" },
  { id: "par", name: "PAR", desc: "Problem-Action-Result" },
  { id: "soar", name: "SOAR", desc: "Situation-Obstacle-Action-Result" },
  { id: "fab", name: "FAB", desc: "Features-Advantages-Benefits" },
  { id: "auto", name: "Auto", desc: "AI selects best method" },
];

const INDUSTRY_OPTIONS = [
  { id: "tech", name: "Technology", desc: "Software, IT, Engineering" },
  { id: "medical", name: "Medical", desc: "Healthcare, Research, Clinical" },
  { id: "ai", name: "AI / ML", desc: "Artificial Intelligence, Data Science" },
];

function Method() {
  const [method, setMethod] = useState("auto");
  const [industry, setIndustry] = useState("ai");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const proceedToAnalysis = async () => {
    setLoading(true);
    try {
      navigate(`/analysis?method=${method}&industry=${industry}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Method & Industry">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40">
            <h3 className="text-lg font-semibold mb-4">Resume Method</h3>
            <p className="text-sm text-slate-400 mb-4">
              Choose how your experiences will be structured and presented
            </p>
            <div className="grid grid-cols-2 gap-3">
              {METHOD_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    method === m.id 
                      ? "border-emerald-500 bg-emerald-600/20 shadow-lg" 
                      : "border-slate-700 bg-slate-800/60 hover:border-slate-600"
                  }`}
                >
                  <div className="font-semibold text-sm">{m.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40">
            <h3 className="text-lg font-semibold mb-4">Target Industry</h3>
            <p className="text-sm text-slate-400 mb-4">
              Select your target industry for optimized content and keywords
            </p>
            <div className="space-y-3">
              {INDUSTRY_OPTIONS.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => setIndustry(ind.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    industry === ind.id 
                      ? "border-sky-500 bg-sky-600/20 shadow-lg" 
                      : "border-slate-700 bg-slate-800/60 hover:border-slate-600"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">{ind.name}</div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      industry === ind.id ? 'bg-sky-700 text-sky-200' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {ind.id === 'ai' ? 'Trending' : ind.id === 'tech' ? 'Popular' : 'Stable'}
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">{ind.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40">
            <h3 className="text-lg font-semibold mb-4">What Happens Next</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <div className="font-medium">AI Profile Analysis</div>
                  <div className="text-sm text-slate-400">
                    Deep analysis of your responses with benchmark comparisons
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <div className="font-medium">Statistical Insights</div>
                  <div className="text-sm text-slate-400">
                    See how you compare to other professionals in your field
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <div className="font-medium">ATS-Optimized Resume</div>
                  <div className="text-sm text-slate-400">
                    Generate a professional resume based on your analysis
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-slate-800 rounded-2xl bg-gradient-to-r from-indigo-900/20 to-emerald-900/20">
            <h3 className="text-lg font-semibold mb-4">Selected Configuration</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Method:</span>
                <span className="font-medium capitalize">
                  {METHOD_OPTIONS.find(m => m.id === method)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Industry:</span>
                <span className="font-medium">
                  {INDUSTRY_OPTIONS.find(i => i.id === industry)?.name}
                </span>
              </div>
            </div>
            
            <button 
              onClick={proceedToAnalysis} 
              disabled={loading} 
              className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              {loading ? "Processing..." : "Start AI Analysis"}
            </button>
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-xl">
            <div className="text-sm font-medium text-blue-300 mb-1">Pro Tip</div>
            <div className="text-sm text-blue-200">
              The AI analysis will provide detailed insights including how you compare to other professionals,
              market demand for your skills, and personalized resume recommendations.
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

import NewLoginPage from './pages/NewLoginPage';
import NewRegisterPage from './pages/NewRegisterPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<PrivateRoute><Interview /></PrivateRoute>} />
        <Route path="/method" element={<PrivateRoute><Method /></PrivateRoute>} />
        <Route path="/analysis" element={<PrivateRoute><AnalysisPage /></PrivateRoute>} />
        <Route path="/resume" element={<PrivateRoute><ResumePage /></PrivateRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/new-login" element={<NewLoginPage />} />
        <Route path="/new-register" element={<NewRegisterPage />} />
      </Routes>
    </Router>
  );
}