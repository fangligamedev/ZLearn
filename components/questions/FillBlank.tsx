import React, { useEffect, useState } from 'react';
import { FillBlankQuestion } from '../../types';

interface Props {
  question: FillBlankQuestion;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
  disabled?: boolean;
}

const FillBlank: React.FC<Props> = ({
  question,
  onAnswer,
  showResult,
  userAnswer,
  isCorrect,
  disabled
}) => {
  const [input, setInput] = useState('');

  useEffect(() => {
    setInput(userAnswer || '');
  }, [question, userAnswer]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onAnswer(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      handleSubmit();
    }
  };

  const renderQuestionText = () => {
    const parts = question.question.split('____');
    const tail = parts.slice(1).join('____'); // 展示剩余文本，兼容多空位题面

    return (
      <p className="text-xl leading-relaxed">
        <span>{parts[0]}</span>

        {showResult ? (
          <span
            className={`
              inline-block px-3 py-1 mx-1 rounded-lg font-bold
              ${isCorrect ? 'bg-green-600' : 'bg-red-600'}
            `}
          >
            {userAnswer || '(未填写)'}
          </span>
        ) : (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="输入答案"
            autoFocus
            className="
              inline-block w-40 px-3 py-1 mx-1
              bg-slate-600 border-2 border-blue-500 rounded-lg
              text-center text-white font-bold
              focus:outline-none focus:ring-2 focus:ring-blue-400
              disabled:opacity-50
            "
          />
        )}

        <span>{tail}</span>
      </p>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-300">填写空白处：</h2>

      <div className="p-6 bg-slate-700/50 rounded-xl border border-slate-600">
        {renderQuestionText()}
      </div>

      {!showResult && (
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="
            w-full py-4 rounded-xl font-bold text-lg
            transition-all duration-200
            bg-blue-600 hover:bg-blue-500
            disabled:bg-slate-600 disabled:cursor-not-allowed
          "
        >
          提交答案
        </button>
      )}

      {showResult && (
        <div
          className={`p-5 rounded-xl ${
            isCorrect
              ? 'bg-green-900/40 border border-green-500/30'
              : 'bg-red-900/40 border border-red-500/30'
          }`}
        >
          <p className="font-bold text-lg mb-2">
            {isCorrect ? '🎉 答对了！' : '❌ 答错了'}
          </p>
          {!isCorrect && (
            <p className="text-yellow-300 mb-2">
              正确答案: {question.correctAnswers.join(' 或 ')}
            </p>
          )}
          <p className="text-slate-300 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default FillBlank;
