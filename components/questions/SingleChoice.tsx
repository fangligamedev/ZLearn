import React from 'react';
import { SingleChoiceQuestion } from '../../types';

interface Props {
  question: SingleChoiceQuestion;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
  disabled?: boolean;
}

const SingleChoice: React.FC<Props> = ({
  question,
  onAnswer,
  showResult,
  userAnswer,
  isCorrect,
  disabled
}) => {
  const handleSelect = (key: string) => {
    if (!showResult && !disabled) {
      onAnswer(key);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white leading-relaxed">
        {question.question}
      </h2>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = userAnswer === option.key;
          const isCorrectOption = option.key === question.correctAnswer;

          let className = 'w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3 ';

          if (showResult) {
            if (isCorrectOption) {
              className += 'bg-green-600 ring-2 ring-green-400';
            } else if (isSelected) {
              className += 'bg-red-600 ring-2 ring-red-400';
            } else {
              className += 'bg-slate-700/50 opacity-60';
            }
          } else if (isSelected) {
            className += 'bg-blue-600 ring-2 ring-blue-400';
          } else {
            className += 'bg-slate-700 hover:bg-slate-600 cursor-pointer';
          }

          return (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              disabled={showResult || disabled}
              className={className}
            >
              <span
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${isSelected ? 'bg-white/20' : 'bg-slate-600'}
                `}
              >
                {option.key}
              </span>

              <span className="flex-1">{option.text}</span>

              {showResult && isCorrectOption && (
                <span className="text-xl">✓</span>
              )}
            </button>
          );
        })}
      </div>

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
          <p className="text-slate-300 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default SingleChoice;
