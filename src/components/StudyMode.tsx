import React, { useState } from 'react';
import { Eye, EyeOff, ChevronRight, Check, X } from 'lucide-react';
import { Idiom } from '../types';
import { submitLearningRecord } from '../services/api';

interface StudyModeProps {
  idioms: Idiom[];
  currentIndex: number;
  onNext: () => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({ idioms, currentIndex, onNext }) => {
  const [showMeaning, setShowMeaning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentIdiom = idioms[currentIndex];

  const handleMeaningToggle = () => {
    setShowMeaning(!showMeaning);
  };

  const handleLearningStatus = async (status: 'known' | 'unknown') => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const record = {
      uid: 'guest123',
      phrase: currentIdiom.phrase,
      status,
      timestamp: new Date().toISOString()
    };

    await submitLearningRecord(record);
    setIsSubmitting(false);
  };

  const handleNext = () => {
    setShowMeaning(false);
    onNext();
  };

  if (!currentIdiom) return null;

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            {currentIndex + 1} / {idioms.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / idioms.length) * 100}%` }}
            />
          </div>
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
                Hide Meaning
              </>
            ) : (
              <>
                <Eye className="w-5 h-5 mr-2" />
                Show Meaning
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

        {showMeaning && (
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleLearningStatus('known')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Check className="w-5 h-5 mr-2" />
              Got it! 😊
            </button>
            
            <button
              onClick={() => handleLearningStatus('unknown')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 mr-2" />
              Need more practice 🤔
            </button>
          </div>
        )}

        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};