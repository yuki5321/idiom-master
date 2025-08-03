import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronRight, Check, X, Settings } from 'lucide-react';
import { Idiom, QuizRange } from '../types';
import { saveLearningStatus } from '../services/api';

interface StudyModeProps {
  idioms: Idiom[];
  currentIndex: number;
  onNext: () => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({ idioms, currentIndex, onNext }) => {
  const [showMeaning, setShowMeaning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRangeSettings, setShowRangeSettings] = useState(false);
  const [studyRange, setStudyRange] = useState<QuizRange>({ start: 1, end: 300 });
  const [filteredIdioms, setFilteredIdioms] = useState<Idiom[]>(idioms);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);

  const currentIdiom = filteredIdioms[currentStudyIndex];

  // Filter idioms based on range
  useEffect(() => {
    const filtered = idioms.filter(idiom => 
      idiom.id >= studyRange.start && idiom.id <= studyRange.end
    );
    setFilteredIdioms(filtered);
    setCurrentStudyIndex(0);
  }, [idioms, studyRange]);

  const handleMeaningToggle = () => {
    setShowMeaning(!showMeaning);
  };

  const handleLearningStatus = async (status: 'known' | 'unknown') => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      saveLearningStatus(currentIdiom.phrase, status);
      
      // Show feedback
      const message = status === 'known' ? '覚えました！👍' : 'もう一度練習しましょう 💪';
      alert(message);
    } catch (error) {
      console.error('Error saving learning status:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setShowMeaning(false);
    
    if (currentStudyIndex + 1 < filteredIdioms.length) {
      setCurrentStudyIndex(currentStudyIndex + 1);
    } else {
      // Study completed, go back to first item
      setCurrentStudyIndex(0);
      onNext();
    }
  };

  const handleRangeChange = (field: 'start' | 'end', value: number) => {
    setStudyRange(prev => ({
      ...prev,
      [field]: Math.max(1, Math.min(300, value))
    }));
  };

  const handleRangeSubmit = () => {
    setShowRangeSettings(false);
  };

  if (!currentIdiom) return null;

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            {currentStudyIndex + 1} / {filteredIdioms.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStudyIndex + 1) / filteredIdioms.length) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mb-3">
            範囲: No.{studyRange.start}-{studyRange.end}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {currentIdiom.phrase}
          </h2>
          
          <button
            onClick={handleMeaningToggle}
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 mb-4"
          >
            {showMeaning ? (
              <>
                <EyeOff className="w-5 h-5 mr-2" />
                意味を隠す
              </>
            ) : (
              <>
                <Eye className="w-5 h-5 mr-2" />
                意味を表示
              </>
            )}
          </button>

          {showMeaning && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 animate-in slide-in-from-top-2 duration-300">
              <p className="text-blue-900 font-medium leading-relaxed">
                {currentIdiom.meaning}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleLearningStatus('known')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Check className="w-5 h-5 mr-2" />
            覚えた！😊
          </button>
          
          <button
            onClick={() => handleLearningStatus('unknown')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 mr-2" />
            まだ練習が必要🤔
          </button>
        </div>

        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          次へ
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      {/* Range Settings Modal */}
      {showRangeSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">暗記範囲を設定</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始番号
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={studyRange.start}
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
                  value={studyRange.end}
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