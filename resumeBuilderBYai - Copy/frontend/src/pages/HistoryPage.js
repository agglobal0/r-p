// frontend/src/pages/HistoryPage.js
// Replaced presentation-only history page with a combined history view
import React, { useState, useEffect } from 'react';
import PreviewModal from '../components/PreviewModal';
import ReviewForm from '../components/ReviewForm';
import { submitReview } from '../services/api';
import { downloadBase64File } from '../services/downloadService';

function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_ROOT}/api/history`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // use shared helper

  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDownload = (item) => {
    if (!item?.fileContent) return;
    const type = item.type === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : (item.type === 'pdf' || item.type === 'resume' ? 'application/pdf' : 'application/octet-stream');
    const ext = item.type === 'pptx' ? 'pptx' : item.type === 'pdf' || item.type === 'resume' ? 'pdf' : 'bin';
    downloadBase64File(item.fileContent, `${(item.title || 'download').replace(/\s+/g,'_')}.${ext}`, type);
  };

  const handleReviewDone = async () => {
    setSelected(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">History</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && items.length === 0 && <p>No history items found.</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it._id} className="p-4 border border-slate-800 rounded-2xl bg-slate-900/40">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-semibold">{it.title || it.name || 'Untitled'}</h2>
                  <div className="text-sm text-slate-400">{it.type?.toUpperCase() || 'UNKNOWN'}</div>
                </div>
                <div className="text-xs text-slate-400">{new Date(it.createdAt).toLocaleDateString()}</div>
              </div>

              <p className="text-sm text-slate-300 mb-4 break-words">{it.prompt || it.summary || ''}</p>

              <div className="flex gap-2">
                {it.fileContent && (
                  <button onClick={() => handleDownload(it)} className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500">Download</button>
                )}
                <button onClick={() => setSelected(it)} className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500">Preview & Review</button>
                <a href={`#/history/${it._id}`} className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600">Details</a>
              </div>
            </div>
          ))}
        </div>
        {selected && (
          <PreviewModal item={selected} onClose={() => setSelected(null)} onDownload={handleDownload}>
            <ReviewForm item={selected} onDone={handleReviewDone} />
          </PreviewModal>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
