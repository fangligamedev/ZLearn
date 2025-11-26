import React from 'react';
import { ConceptQuestion } from '../../types';
import SingleChoice from './SingleChoice';
import TrueFalse from './TrueFalse';
import FillBlank from './FillBlank';

interface QuestionRendererProps {
  question: ConceptQuestion;
  onAnswer: (answer: string | boolean) => void;
  showResult: boolean;
  userAnswer?: string | boolean;
  isCorrect?: boolean;
  disabled?: boolean;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = (props) => {
  const { question, ...rest } = props;

  switch (question.type) {
    case 'single_choice':
      return <SingleChoice question={question} {...rest} />;
    case 'true_false':
      return <TrueFalse question={question} {...rest} />;
    case 'fill_blank':
      return <FillBlank question={question} {...rest} />;
    default:
      return (
        <div className="text-red-400 p-4 bg-red-900/20 rounded-xl">
          ⚠️ 未知题型: {(question as any).type}
        </div>
      );
  }
};

export default QuestionRenderer;
