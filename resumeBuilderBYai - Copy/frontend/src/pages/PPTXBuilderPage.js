import React, { useState } from 'react';
import { Loader2, Presentation, Download } from 'lucide-react';
import { downloadPresentation } from '../services/pptxService';
import { api } from '../utils/api';

export default function PPTXBuilderPage() {
  // UI fields for PPTX creation
  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState(1);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }
    if (slides < 1) {
      setError('Number of slides must be at least 1.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Send all fields; backend can ignore unused ones.
      const result = await api('/generatePPTX', {
        topic: title, // keep backward compatibility
        title,
        slides,
        content,
      });
      if (result.success && result.pptx) {
        downloadPresentation(result.pptx, `${title.replace(/\s+/g, '_')}.pptx`);
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto px-4 py-6">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl text-white">
                <Presentation size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-100">AI Presentation Builder</h1>
            <p className="text-slate-400 mt-2">Provide a title, number of slides, and optional content to generate a PPTX.</p>
        </div>
  
        <div className="p-8 border border-slate-800 rounded-2xl bg-slate-900/40">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                Presentation Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="e.g., 'Future of AI'"
                disabled={loading}
              />
            </div>
            {/* Number of Slides */}
            <div className="mb-4">
              <label htmlFor="slides" className="block text-sm font-medium text-slate-300 mb-2">
                Number of Slides
              </label>
              <input
                type="number"
                id="slides"
                min={1}
                value={slides}
                onChange={(e) => setSlides(parseInt(e.target.value, 10) || 1)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={loading}
              />
            </div>
            {/* Optional Content */}
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">
                Slide Content (optional)
              </label>
              <textarea
                id="content"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Enter any bullet points or notes for the slides..."
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download size={20} />
                  <span>Generate & Download</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}