import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import type { TestResult } from '../types';
import { ArrowLeft, CheckCircle, XCircle, MinusCircle, BarChart2 } from 'lucide-react';

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');
  
  if (!location.state || !location.state.results) {
    return <Navigate to="/" />;
  }

  const results = location.state.results as TestResult;
  const { score, correctAnswers, incorrectAnswers, unanswered, negativeMarks, answers, questions } = results;

  const totalAttempted = correctAnswers + incorrectAnswers;
  const accuracy = totalAttempted > 0 ? Math.round((correctAnswers / totalAttempted) * 100) : 0;

  const filteredQuestions = questions.filter((q, idx) => {
    const ans = answers[idx];
    if (filter === 'all') return true;
    if (filter === 'correct') return ans.selectedOption === q.answer;
    if (filter === 'incorrect') return ans.selectedOption && ans.selectedOption !== q.answer;
    if (filter === 'unanswered') return !ans.selectedOption;
    return true;
  });

  return (
    <div className="results-container">
      <div className="results-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} /> Back to Home
        </button>
        <h1>Test Results</h1>
      </div>

      <div className="score-dashboard">
        <div className="score-card primary-score">
          <h3>Final Score</h3>
          <div className="score-value">{score.toFixed(2)}</div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-box">
            <CheckCircle className="text-success" size={24} />
            <div className="stat-details">
              <span className="stat-label">Correct</span>
              <span className="stat-num">{correctAnswers}</span>
            </div>
          </div>
          <div className="stat-box">
            <XCircle className="text-danger" size={24} />
            <div className="stat-details">
              <span className="stat-label">Incorrect</span>
              <span className="stat-num">{incorrectAnswers}</span>
            </div>
          </div>
          <div className="stat-box">
            <MinusCircle className="text-warning" size={24} />
            <div className="stat-details">
              <span className="stat-label">Unanswered</span>
              <span className="stat-num">{unanswered}</span>
            </div>
          </div>
          {negativeMarks > 0 && (
            <div className="stat-box">
              <MinusCircle className="text-danger" size={24} />
              <div className="stat-details">
                <span className="stat-label">Neg. Marks</span>
                <span className="stat-num">-{negativeMarks}</span>
              </div>
            </div>
          )}
          <div className="stat-box">
            <BarChart2 className="text-info" size={24} />
            <div className="stat-details">
              <span className="stat-label">Accuracy</span>
              <span className="stat-num">{accuracy}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detailed-analysis">
        <div className="analysis-header">
          <h2>Detailed Review</h2>
          <div className="filter-tabs">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
            <button className={filter === 'correct' ? 'active' : ''} onClick={() => setFilter('correct')}>Correct</button>
            <button className={filter === 'incorrect' ? 'active' : ''} onClick={() => setFilter('incorrect')}>Incorrect</button>
            <button className={filter === 'unanswered' ? 'active' : ''} onClick={() => setFilter('unanswered')}>Unanswered</button>
          </div>
        </div>

        <div className="review-list">
          {filteredQuestions.map((q) => {
            const originalIndex = questions.findIndex(orig => orig.id === q.id);
            const ans = answers[originalIndex];
            const isCorrect = ans.selectedOption === q.answer;
            const isUnanswered = !ans.selectedOption;
            
            let statusClass = 'unanswered-card';
            if (!isUnanswered) {
              statusClass = isCorrect ? 'correct-card' : 'incorrect-card';
            }

            return (
              <div key={q.id} className={`review-card ${statusClass}`}>
                <div className="review-card-header">
                  <span className="q-badge">Q{originalIndex + 1}</span>
                  <span className="section-tag">{q.section}</span>
                </div>
                
                <h3 className="review-question">{q.question}</h3>
                
                {q.image && (
                  <div className="review-image" style={{ marginBottom: '1.5rem' }}>
                    <img src={q.image} alt="Question" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                  </div>
                )}
                
                <div className="review-options">
                  {Object.entries(q.options).map(([key, text]) => {
                    let optClass = 'review-option';
                    if (key === q.answer) optClass += ' correct-option'; // Always highlight correct answer
                    else if (key === ans.selectedOption && !isCorrect) optClass += ' wrong-option'; // Highlight user's wrong answer
                    
                    return (
                      <div key={key} className={optClass}>
                        <span className="opt-key">{key})</span> {text}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="explanation-box">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Results;
