import React, { useState } from 'react';
import { submitReview } from '../services/api';

export default function ReviewForm({ item, onDone }) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // submitReview expects an object; include history item id and feedback
      await submitReview({ historyId: item._id, feedback, rating });
      onDone?.();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label className="block text-sm text-slate-300 mb-2">Your Feedback</label>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-sm"
        rows={4}
        placeholder="Tell the AI what to improve (tone, detail, structure, etc.)"
        required
      />

      <div className="flex items-center gap-2 mt-3">
        <label className="text-sm text-slate-300">Rating</label>
        <select value={rating} onChange={(e) => setRating(parseInt(e.target.value, 10))} className="bg-slate-800 p-2 rounded">
          {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-emerald-600">
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
