import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, ArrowLeft, Download, Check, Palette, Edit3, X, Send } from "lucide-react";
import Editor from "@monaco-editor/react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

async function api(path, body) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${txt}`);
  }
  return res.json();
}

function ResumeBuilderPage() {
  const navigate = useNavigate();
  const editorRef = useRef(null);

  // State hooks
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [backgroundExpanded, setBackgroundExpanded] = useState(false);
  const [theme, setTheme] = useState({ primary: '#000000' });
  const [selectedText, setSelectedText] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [missingInfoAnalyzing, setMissingInfoAnalyzing] = useState(false);
  const [missingItems, setMissingItems] = useState([]);
  const [showMissingInfo, setShowMissingInfo] = useState(false);

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

  // Fetch current resume on load
  useEffect(() => {
    const fetchCurrentResume = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/getCurrentResume`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.layout) {
            setResumeData(data.layout.data);
            setHtmlContent(data.layout.htmlContent);
          }
        }
      } catch (error) {
        console.error('Failed to fetch resume:', error);
      }
    };

    fetchCurrentResume();
  }, []);

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
      setSelectedText(selectedStr);
    } else {
      setSelectedText('');
    }
  };

  // Handle editor change
  const handleEditorChange = (value) => {
    setEditorContent(value || '');
  };

  // Download PDF
  async function handleDownloadPDF() {
    if (!resumeData) {
      alert('No resume data available');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/generatePDF`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          resumeData,
          theme,
          format: 'pdf'
        }),
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
      console.error('Download error:', error);
      alert('Failed to download PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply selected text modification
  const applySelectedTextModification = async () => {
    if (!selectedText || !editorContent) return;

    setIsModifying(true);
    try {
      const result = await api("/modifySelectedText", {
        resumeData,
        htmlContent,
        selectedText,
        context: htmlContent.substring(
          Math.max(0, htmlContent.indexOf(selectedText) - 100),
          Math.min(htmlContent.length, htmlContent.indexOf(selectedText) + selectedText.length + 100)
        ),
        modification: editorContent
      });

      if (result.success && result.layout) {
        setResumeData(result.layout.data);
        setHtmlContent(result.layout.htmlContent);
        setShowEditor(false);
        setSelectedText('');
        window.getSelection().removeAllRanges();
      }
    } catch (error) {
      console.error('Modification error:', error);
      alert('Failed to apply modification: ' + error.message);
    } finally {
      setIsModifying(false);
    }
  };

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
          <button
            onClick={() => navigate('/interview')}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Start Interview
          </button>
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
            <button
              onClick={() => navigate('/analysis')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300"
            >
              <ArrowLeft size={16} />
              Back
            </button>
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

export default ResumeBuilderPage;
