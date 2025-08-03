import React from 'react';
import { BookOpen } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <BookOpen className="w-12 h-12 text-blue-600 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">英熟語を読み込み中...</h2>
        <p className="text-gray-600">学習セッションの準備をしています</p>
      </div>
    </div>
  );
};