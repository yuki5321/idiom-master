import React from 'react';
import { BookOpen, List, BarChart3 } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-blue-600 mr-2" />
          <h1 className="text-xl font-bold text-gray-900">英熟語マスター300</h1>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onModeChange('study')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                currentMode === 'study'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              暗記モード
            </button>
            <button
              onClick={() => onModeChange('quiz')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                currentMode === 'quiz'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              テストモード
            </button>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onModeChange('lists')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                currentMode === 'lists'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-3 h-3 inline mr-1" />
              単語リスト
            </button>
            <button
              onClick={() => onModeChange('statistics')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                currentMode === 'statistics'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-3 h-3 inline mr-1" />
              統計
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};