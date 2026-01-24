import React from 'react';

const Question = ({ question, index, total }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">
          Question {index} of {total}
        </span>
        <div className="w-full bg-slate-700 rounded-full h-2 ml-4">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(index / total) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-slate-100 mb-4">
        {question}
      </h3>
      
      <div className="text-slate-300 text-sm">
        Take your time to think about your answer. You can speak naturally.
      </div>
    </div>
  );
};

export default Question;