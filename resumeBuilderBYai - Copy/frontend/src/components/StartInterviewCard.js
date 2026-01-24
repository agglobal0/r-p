import React from 'react';
import { Play, Settings } from 'lucide-react';

const StartInterviewCard = ({ onStart, isLoading }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Settings className="w-6 h-6 text-blue-400 mr-3" />
        <h3 className="text-lg font-semibold text-slate-100">
          Interview Configuration
        </h3>
      </div>
      
      <p className="text-slate-300 mb-6">
        Configure your interview settings and start practicing. You'll be asked a series of questions to help improve your responses.
      </p>
      
      <button
        onClick={onStart}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Starting Interview...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Start Interview
          </>
        )}
      </button>
    </div>
  );
};

export default StartInterviewCard;