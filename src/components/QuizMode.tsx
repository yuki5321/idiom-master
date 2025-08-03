import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, X, Settings } from 'lucide-react';
import { Idiom, QuizOption, QuizRange } from '../types';
import { saveLearningStatus } from '../services/api';

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
  const [showRangeSettings, setShowRangeSettings] = useState(false);
  const [quizRange, setQuizRange] = useState<QuizRange>({ start: 1, end: 300 });
  const [filteredIdioms, setFilteredIdioms] = useState<Idiom[]>(idioms);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  const currentIdiom = filteredIdioms[currentQuizIndex];

  // Filter idioms based on range
  useEffect(() => {
    const filtered = idioms.filter(idiom => 
      idiom.id >= quizRange.start && idiom.id <= quizRange.end
    );
    setFilteredIdioms(filtered);
    setCurrentQuizIndex(0);
  }, [idioms, quizRange]);

  // Generate quiz options
  useEffect(() => {
    if (!currentIdiom) return;

    const correctOption: QuizOption = {
      id: 0,
      text: currentIdiom.meaning,
      isCorrect: true
    };

    // Get 3 random incorrect options from all idioms
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

    try {
      // Save learning status
      saveLearningStatus(currentIdiom.phrase, correct ? 'known' : 'unknown');
      
      // Show alert for immediate feedback
      setTimeout(() => {
        alert(correct ? '🎉 正解！よくできました！' : '❌ 不正解。もう一度勉強しましょう！');
      }, 100);
    } catch (error) {
      console.error('Error saving quiz result:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(false);
    
    if (currentQuizIndex + 1 < filteredIdioms.length) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      // Quiz completed, go back to first question
      setCurrentQuizIndex(0);
      onNext();
    }
  };

  const handleRangeChange = (field: 'start' | 'end', value: number) => {
    setQuizRange(prev => ({
      ...prev,
      [field]: Math.max(1, Math.min(300, value))
    }));
  };

  const handleRangeSubmit = () => {
    setShowRangeSettings(false);
  };

  if (!currentIdiom || options.length === 0) return null;

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            問題 {currentQuizIndex + 1} / {filteredIdioms.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuizIndex + 1) / filteredIdioms.length) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mb-3">
            範囲: No.{quizRange.start}-{quizRange.end}
          </div>
          <button
            onClick={() => setShowRangeSettings(true)}
            className="inline-flex items-center justify-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <Settings className="w-4 h-4 mr-2" />
            範囲設定
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            この熟語の意味は何ですか？
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
              {isCorrect ? '🎉 正解！' : '❌ 不正解'}
            </div>
            <div className="text-sm">
              {isCorrect ? '素晴らしい！' : 'もう一度勉強しましょう！'}
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!showResult}
          className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
        >
          次の問題
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      {/* Range Settings Modal */}
      {showRangeSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">テスト範囲を設定</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始番号
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={quizRange.start}
                  onChange={(e) => handleRangeChange('start', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了番号
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={quizRange.end}
                  onChange={(e) => handleRangeChange('end', parseInt(e.target.value) || 300)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                選択範囲: {filteredIdioms.length}語
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRangeSettings(false)}
                className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleRangeSubmit}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                設定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};