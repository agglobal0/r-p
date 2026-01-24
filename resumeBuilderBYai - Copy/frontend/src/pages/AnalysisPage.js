import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, TrendingUp, Target } from 'lucide-react';
import Page from '../components/Page';
import Badge from '../components/Badge';

const AnalysisPage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate analysis loading
    const timer = setTimeout(() => {
      setAnalysis({
        overallScore: 85,
        strengths: [
          'Strong technical background',
          'Clear communication skills',
          'Relevant experience in the field'
        ],
        improvements: [
          'Add more quantifiable achievements',
          'Include industry-specific keywords',
          'Expand on leadership experience'
        ],
        recommendations: [
          'Consider adding a professional summary',
          'Include relevant certifications',
          'Add volunteer work or community involvement'
        ]
      });
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Page title="Analyzing Your Profile">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-slate-100 mb-2">
              Analyzing Your Interview Performance
            </h2>
            <p className="text-slate-300">
              Please wait while we process your responses...
            </p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Interview Analysis">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Overall Score */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500/20 rounded-full mb-4">
            <span className="text-3xl font-bold text-blue-400">{analysis.overallScore}%</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-100 mb-2">
            Your Interview Performance
          </h2>
          <Badge variant={analysis.overallScore >= 80 ? 'success' : 'warning'}>
            {analysis.overallScore >= 80 ? 'Excellent' : 'Good'} Performance
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Strengths */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-slate-100">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-slate-100">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {analysis.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-800 rounded-lg p-6 mt-8">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-slate-100">Recommendations</h3>
          </div>
          <div className="grid md:grid-cols-1 gap-4">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start p-3 bg-slate-700/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-300 text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/interview')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 mr-4"
          >
            Practice Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    </Page>
  );
};

export default AnalysisPage;