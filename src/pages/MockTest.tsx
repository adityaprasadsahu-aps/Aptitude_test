import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsContext';
import type { Question, AnswerRecord, TestResult } from '../types';
import { generateTest } from '../utils/testGenerator';
import { Clock, CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';

const MockTest: React.FC = () => {
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.totalTimeMinutes * 60);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/data/questions.json');
        const allQuestions = await response.json();
        
        const testQuestions = generateTest(allQuestions, settings);
        setQuestions(testQuestions);
        
        const initialAnswers = testQuestions.map(q => ({
          questionId: q.id,
          selectedOption: null,
          status: 'unanswered' as const
        }));
        setAnswers(initialAnswers);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };
    
    fetchQuestions();
  }, [settings]);

  useEffect(() => {
    if (loading || isSubmitting) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, isSubmitting]);

  const handleSelectOption = (optionKey: string) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = {
        ...newAnswers[currentIndex],
        selectedOption: optionKey,
        status: 'answered'
      };
      return newAnswers;
    });
  };

  const markForReview = () => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = {
        ...newAnswers[currentIndex],
        status: newAnswers[currentIndex].status === 'review' 
          ? (newAnswers[currentIndex].selectedOption ? 'answered' : 'unanswered')
          : 'review'
      };
      return newAnswers;
    });
  };

  const calculateResults = (): TestResult => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    
    answers.forEach((ans, idx) => {
      if (!ans.selectedOption) {
        unanswered++;
        return;
      }
      
      const isCorrect = ans.selectedOption === questions[idx].answer;
      if (isCorrect) correct++;
      else incorrect++;
    });

    const negativeMarks = settings.negativeMarking ? incorrect * settings.negativeMarkWeight : 0;
    const score = correct - negativeMarks;

    return {
      score,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unanswered,
      negativeMarks,
      answers,
      questions
    };
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const results = calculateResults();
    navigate('/results', { state: { results } });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return <div className="loading-screen">Preparing your test...</div>;
  if (questions.length === 0) return <div className="loading-screen">No questions found matching criteria.</div>;

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];

  return (
    <div className="test-layout">
      <main className="test-main">
        <div className="test-header">
          <div className="section-badge">{currentQuestion.section}</div>
          <div className="difficulty-badge">{currentQuestion.difficulty}</div>
        </div>

        <div className="question-container">
          <h2 className="question-text">
            <span className="q-number">Q{currentIndex + 1}.</span> {currentQuestion.question}
          </h2>
          
          {currentQuestion.image && (
            <div className="question-image" style={{ marginBottom: '2rem' }}>
              <img src={currentQuestion.image} alt="Question" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
            </div>
          )}

          <div className="options-grid">
            {Object.entries(currentQuestion.options).map(([key, text]) => (
              <div 
                key={key}
                className={`option-card ${currentAnswer?.selectedOption === key ? 'selected' : ''}`}
                onClick={() => handleSelectOption(key)}
              >
                <div className="option-indicator">{currentAnswer?.selectedOption === key ? <CheckCircle size={20} /> : <Circle size={20} />}</div>
                <div className="option-text">
                  <span className="option-key">{key})</span> {text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="test-controls">
          <button 
            className="btn-nav" 
            disabled={currentIndex === 0} 
            onClick={() => setCurrentIndex(prev => prev - 1)}
          >
            <ArrowLeft size={18} /> Previous
          </button>
          
          <button className="btn-review" onClick={markForReview}>
            {currentAnswer.status === 'review' ? 'Unmark Review' : 'Mark for Review'}
          </button>

          {currentIndex === questions.length - 1 ? (
            <button className="btn-submit" onClick={handleSubmit}>Submit Test</button>
          ) : (
            <button 
              className="btn-nav" 
              onClick={() => setCurrentIndex(prev => prev + 1)}
            >
              Next <ArrowRight size={18} />
            </button>
          )}
        </div>
      </main>

      <aside className="test-sidebar">
        <div className="timer-box">
          <Clock size={24} className={timeLeft < 300 ? 'text-danger pulse' : ''} />
          <span className={`timer-text ${timeLeft < 300 ? 'text-danger' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        
        <div className="nav-grid-container">
          <h3>Question Navigator</h3>
          <div className="nav-legend">
            <span className="legend-item"><div className="dot answered"></div> Answered</span>
            <span className="legend-item"><div className="dot review"></div> Review</span>
            <span className="legend-item"><div className="dot unanswered"></div> Unanswered</span>
          </div>
          <div className="nav-grid">
            {questions.map((_, idx) => (
              <button 
                key={idx}
                className={`nav-bubble ${answers[idx].status} ${currentIndex === idx ? 'current' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
        
        <button className="btn-submit-sidebar" onClick={handleSubmit}>
          End Test & Submit
        </button>
      </aside>
    </div>
  );
};

export default MockTest;
