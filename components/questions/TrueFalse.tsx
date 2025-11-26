import React from 'react';
import { TrueFalseQuestion } from '../../types';

interface Props {
  question: TrueFalseQuestion;
  onAnswer: (answer: boolean) => void;
  showResult: boolean;
  userAnswer?: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
}

const TrueFalse: React.FC<Props> = ({
  question,
  onAnswer,
  showResult,
  userAnswer,
  isCorrect,
  disabled
}) => {
  const options = [
    { value: true, label: '正确', icon: '✓' },
    { value: false, label: '错误', icon: '✗' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-300">
        判断以下说法是否正确：
      </h2>

      <div className="p-6 bg-slate-700/50 rounded-xl border border-slate-600">
        <p className="text-xl text-white leading-relaxed">
          "{question.statement}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => {
          const isSelected = userAnswer === option.value;
          const isCorrectOption = option.value === question.correctAnswer;

          let className = 'p-6 rounded-xl text-center transition-all duration-200 ';

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
              key={String(option.value)}
              onClick={() => !showResult && !disabled && onAnswer(option.value)}
              disabled={showResult || disabled}
              className={className}
            >
              <span className="text-4xl mb-2 block">{option.icon}</span>
              <span className="font-bold text-lg">{option.label}</span>
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

export default TrueFalse;
