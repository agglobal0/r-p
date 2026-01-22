// frontend/src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Presentation } from 'lucide-react';

const SelectionCard = ({ to, icon, title, description }) => (
  <Link
    to={to}
    className="block p-8 border border-slate-800 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700 transition-all transform hover:-translate-y-1"
  >
    <div className="flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl text-white">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-slate-100">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </Link>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 py-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
          AI-Powered Document Builder
        </h1>
        <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto">
          Choose a tool to get started. Generate professional resumes or engaging presentations in minutes with the help of AI.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <SelectionCard
            to="/interview"
            icon={<FileText size={32} />}
            title="Resume Builder"
            description="Create a professional, ATS-friendly resume through an interactive AI-driven interview process."
          />
          <SelectionCard
            to="/pptx-builder"
            icon={<Presentation size={32} />}
            title="PPTX Presentation Builder"
            description="Generate a complete PowerPoint presentation from a single topic, complete with titles and bullet points."
          />
        </div>
      </div>
    </div>
  );
}
