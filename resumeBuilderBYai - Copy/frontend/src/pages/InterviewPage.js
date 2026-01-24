import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, StopCircle, Play } from 'lucide-react';
import Page from '../components/Page';
import Question from '../components/Question';
import StartInterviewCard from '../components/StartInterviewCard';

const InterviewPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const questions = [
    "Tell me about yourself and your background.",
    "What are your greatest strengths?",
    "Describe a challenging situation you faced and how you handled it.",
    "Where do you see yourself in 5 years?",
    "Why are you interested in this position?"
  ];

  const startInterview = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsInterviewStarted(true);
      setIsLoading(false);
    }, 1000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsRecording(false);
    } else {
      // Interview complete
      navigate('/analysis');
    }
  };

  if (!isInterviewStarted) {
    return (
      <Page title="Interview Practice">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              Practice Your Interview Skills
            </h2>
            <p className="text-slate-300 text-lg">
              Get ready for your next interview with AI-powered practice sessions.
            </p>
          </div>
          <StartInterviewCard onStart={startInterview} isLoading={isLoading} />
        </div>
      </Page>
    );
  }

  return (
    <Page title="Interview in Progress">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Question
          question={questions[currentQuestion]}
          index={currentQuestion + 1}
          total={questions.length}
        />

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={toggleRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? (
                <StopCircle className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
          </div>

          <div className="text-center mb-6">
            <p className="text-slate-300">
              {isRecording ? 'Recording your answer...' : 'Click to start recording'}
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-100 rounded-lg transition-colors"
            >
              Previous
            </button>
            <button
              onClick={nextQuestion}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {currentQuestion === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default InterviewPage;