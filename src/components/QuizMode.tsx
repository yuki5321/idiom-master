import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, X } from 'lucide-react';
import { Idiom, QuizOption } from '../types';
import { submitLearningRecord } from '../services/api';

interface QuizModeProps {
  idioms: Idiom[];
  currentIndex: number;
  onNext: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ idioms, currentIndex, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentIdiom = idioms[currentIndex];

  // Generate quiz options
  useEffect(() => {
    if (!currentIdiom) return;

    const correctOption: QuizOption = {
      id: 0,
      text: currentIdiom.meaning,
      isCorrect: true
    };

    // Get 3 random incorrect options
    const incorrectOptions: QuizOption[] = idioms
      .filter(idiom => idiom.id !== currentIdiom.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((idiom, index) => ({
        id: index + 1,
        text: idiom.meaning,
        isCorrect: false
      }));

    // Shuffle all options
    const allOptions = [correctOption, ...incorrectOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelectedOption(null);
    setShowResult(false);
  }, [currentIdiom, idioms]);

  const handleOptionSelect = async (optionId: number) => {
    if (showResult || isSubmitting) return;

    setSelectedOption(optionId);
    setIsSubmitting(true);

    const selectedOptionData = options.find(opt => opt.id === optionId);
    const correct = selectedOptionData?.isCorrect || false;
    setIsCorrect(correct);
    setShowResult(true);

    // Submit learning record
    const record = {
      uid: 'guest123',
      phrase: currentIdiom.phrase,
      status: correct ? 'correct' as const : 'incorrect' as const,
      timestamp: new Date().toISOString()
    };

    await submitLearningRecord(record);
    setIsSubmitting(false);

    // Show alert for immediate feedback
    setTimeout(() => {
      alert(correct ? '🎉 Correct! Well done!' : '❌ Incorrect. Keep studying!');
    }, 100);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(false);
    onNext();
  };

  if (!currentIdiom || options.length === 0) return null;

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Question {currentIndex + 1} / {idioms.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / idioms.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            What does this idiom mean?
          </h2>
          <div className="text-2xl font-bold text-blue-600 mb-6 bg-blue-50 rounded-lg py-4 px-3">
            "{currentIdiom.phrase}"
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {options.map((option) => {
            let buttonClass = "w-full p-4 text-left border-2 rounded-lg font-medium transition-all duration-200 ";
            
            if (showResult) {
              if (option.isCorrect) {
                buttonClass += "bg-green-100 border-green-500 text-green-800";
              } else if (selectedOption === option.id) {
                buttonClass += "bg-red-100 border-red-500 text-red-800";
              } else {
                buttonClass += "bg-gray-100 border-gray-300 text-gray-600";
              }
            } else {
              buttonClass += selectedOption === option.id 
                ? "bg-blue-100 border-blue-500 text-blue-800" 
                : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400";
            }

            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                disabled={showResult || isSubmitting}
                className={buttonClass}
              >
                <div className="flex items-center">
                  <span className="flex-1 leading-relaxed">{option.text}</span>
                  {showResult && option.isCorrect && (
                    <Check className="w-5 h-5 text-green-600 ml-2" />
                  )}
                  {showResult && selectedOption === option.id && !option.isCorrect && (
                    <X className="w-5 h-5 text-red-600 ml-2" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`text-center p-4 rounded-lg mb-4 ${
            isCorrect 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="font-bold text-lg mb-1">
              {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
            </div>
            <div className="text-sm">
              {isCorrect ? 'Great job!' : 'Keep studying!'}
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!showResult}
          className="w-full flex items-center justify-center py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Next Question
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};