// frontend/src/pages/HistoryPage.js
import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

function HistoryPage() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPresentations = async () => {
      setLoading(true);
      setError('');
      try {
        const user = getCurrentUser();
        if (!user) {
          setError('You must be logged in to view your history.');
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/presentations`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch presentations.');
        }

        const data = await response.json();
        setPresentations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPresentations();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Presentation History</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {presentations.length === 0 && !loading && (
          <p>You have no saved presentations.</p>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presentations.map((presentation) => (
            <div key={presentation._id} className="p-4 border border-slate-800 rounded-2xl bg-slate-900/40">
              <h2 className="text-lg font-semibold mb-2">{presentation.title}</h2>
              <p className="text-sm text-slate-400 mb-4">
                Created on {new Date(presentation.createdAt).toLocaleDateString()}
              </p>
              <button
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
                onClick={() => {
                  const byteCharacters = atob(presentation.content);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }
                  const byteArray = new Uint8Array(byteNumbers);
                  const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
                  const link = document.createElement('a');
                  link.href = window.URL.createObjectURL(blob);
                  link.download = `${presentation.title}.pptx`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
