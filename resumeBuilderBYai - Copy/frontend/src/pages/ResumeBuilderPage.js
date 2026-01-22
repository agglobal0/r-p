import React from 'react';

function ResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">Resume Builder</h2>
        <p className="text-slate-300 mb-4">
          Placeholder page for the resume builder. Future UI will collect user info and trigger resume generation.
        </p>
        <p className="text-slate-400 text-sm">
          Add form fields, integrate with backend `/api/generateResume` or similar.
        </p>
      </div>
    </div>
  );
}

export default ResumeBuilderPage;
