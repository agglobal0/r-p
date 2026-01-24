import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Presentation, Users, ArrowRight } from 'lucide-react';
import Page from '../components/Page';

const HomePage = () => {
  const workflows = [
    {
      icon: FileText,
      title: 'Resume Builder',
      description: 'Create professional resumes with AI assistance',
      path: '/resume-builder',
      color: 'blue'
    },
    {
      icon: Presentation,
      title: 'PPTX Builder',
      description: 'Generate presentations from your content',
      path: '/pptx-builder',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Interview Practice',
      description: 'Practice interviews with AI feedback',
      path: '/interview',
      color: 'purple'
    }
  ];

  return (
    <Page title="Welcome to Resume Builder AI">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-100 mb-4">
            Choose Your Workflow
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Select the tool that best fits your needs. Whether you're building a resume,
            creating presentations, or practicing interviews, we've got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {workflows.map((workflow) => {
            const Icon = workflow.icon;
            return (
              <Link
                key={workflow.path}
                to={workflow.path}
                className="group bg-slate-800 hover:bg-slate-750 rounded-xl p-6 transition-all duration-200 border border-slate-700 hover:border-slate-600"
              >
                <div className={`w-12 h-12 bg-${workflow.color}-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-${workflow.color}-500/30 transition-colors`}>
                  <Icon className={`w-6 h-6 text-${workflow.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  {workflow.title}
                </h3>
                <p className="text-slate-300 mb-4">
                  {workflow.description}
                </p>
                <div className="flex items-center text-slate-400 group-hover:text-slate-300">
                  <span className="text-sm">Get started</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            to="/history"
            className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors duration-200"
          >
            View Your History
          </Link>
        </div>
      </div>
    </Page>
  );
};

export default HomePage;