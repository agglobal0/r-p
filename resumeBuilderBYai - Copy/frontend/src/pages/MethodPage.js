import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Code, Heart, TrendingUp, ArrowRight } from 'lucide-react';
import Page from '../components/Page';
import Badge from '../components/Badge';

const MethodPage = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const navigate = useNavigate();

  const industries = [
    { id: 'tech', name: 'Technology', icon: Code, description: 'Software, IT, Engineering' },
    { id: 'business', name: 'Business', icon: Briefcase, description: 'Finance, Marketing, Management' },
    { id: 'healthcare', name: 'Healthcare', icon: Heart, description: 'Medical, Nursing, Research' },
    { id: 'other', name: 'Other', icon: TrendingUp, description: 'Various industries' }
  ];

  const methods = [
    { id: 'traditional', name: 'Traditional Resume', description: 'Standard resume format' },
    { id: 'modern', name: 'Modern Resume', description: 'Contemporary design with visual elements' },
    { id: 'creative', name: 'Creative Resume', description: 'Unique layout for creative fields' }
  ];

  const handleContinue = () => {
    if (selectedIndustry && selectedMethod) {
      // Store selections and navigate
      localStorage.setItem('selectedIndustry', selectedIndustry);
      localStorage.setItem('selectedMethod', selectedMethod);
      navigate('/resume-builder');
    }
  };

  return (
    <Page title="Choose Your Method">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Customize Your Resume
          </h2>
          <p className="text-slate-300 text-lg">
            Select your industry and preferred resume style to get started.
          </p>
        </div>

        {/* Industry Selection */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-slate-100 mb-6">Select Your Industry</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedIndustry === industry.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${
                    selectedIndustry === industry.id ? 'text-blue-400' : 'text-slate-400'
                  }`} />
                  <h4 className="font-semibold text-slate-100 mb-1">{industry.name}</h4>
                  <p className="text-sm text-slate-400">{industry.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Method Selection */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-slate-100 mb-6">Choose Resume Style</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <h4 className="font-semibold text-slate-100 mb-2">{method.name}</h4>
                <p className="text-sm text-slate-400">{method.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedIndustry || !selectedMethod}
            className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
          >
            Continue to Resume Builder
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Selection Summary */}
        {(selectedIndustry || selectedMethod) && (
          <div className="mt-8 p-4 bg-slate-800 rounded-lg">
            <h4 className="font-semibold text-slate-100 mb-2">Your Selections:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedIndustry && (
                <Badge variant="primary">
                  Industry: {industries.find(i => i.id === selectedIndustry)?.name}
                </Badge>
              )}
              {selectedMethod && (
                <Badge variant="secondary">
                  Style: {methods.find(m => m.id === selectedMethod)?.name}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default MethodPage;