import React, { useState, useEffect } from 'react';
import { Download, RotateCcw, BarChart3 } from 'lucide-react';
import { Idiom, LearningStats } from '../types';
import { getLearningStats, exportStatsToCSV, resetLearningData } from '../services/api';

interface StatisticsProps {
  idioms: Idiom[];
}

export const Statistics: React.FC<StatisticsProps> = ({ idioms }) => {
  const [stats, setStats] = useState<LearningStats[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const learningStats = getLearningStats(idioms);
    setStats(learningStats);
  }, [idioms]);

  const totalKnown = stats.filter(s => s.status === 'known').length;
  const totalUnknown = stats.filter(s => s.status === 'unknown').length;
  const totalUnclassified = stats.filter(s => s.status === 'unclassified').length;
  const totalTests = stats.reduce((sum, s) => sum + s.correctCount + s.incorrectCount, 0);
  const totalCorrect = stats.reduce((sum, s) => sum + s.correctCount, 0);
  const overallAccuracy = totalTests > 0 ? Math.round((totalCorrect / totalTests) * 100) : 0;

  const handleExport = () => {
    exportStatsToCSV(stats);
  };

  const handleReset = () => {
    if (showResetConfirm) {
      resetLearningData();
      setShowResetConfirm(false);
      // Refresh stats
      const learningStats = getLearningStats(idioms);
      setStats(learningStats);
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-center mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">学習統計</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalKnown}</div>
            <div className="text-sm text-green-700">覚えた単語</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{totalUnknown}</div>
            <div className="text-sm text-red-700">覚えてない単語</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{totalUnclassified}</div>
            <div className="text-sm text-gray-700">未分類</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{overallAccuracy}%</div>
            <div className="text-sm text-blue-700">正解率</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>学習進捗</span>
            <span>{Math.round((totalKnown / idioms.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(totalKnown / idioms.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Download className="w-5 h-5 mr-2" />
            統計をエクスポート
          </button>
          
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            データリセット
          </button>
        </div>

        {/* Reset Confirmation */}
        {showResetConfirm && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-yellow-800 mb-2">確認</h3>
            <p className="text-sm text-yellow-700 mb-3">
              全ての学習データをリセットしますか？この操作は元に戻せません。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                リセット
              </button>
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 mb-3">詳細統計</h3>
          {stats.slice(0, 10).map((stat) => (
            <div key={stat.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{stat.phrase}</h4>
                  <p className="text-sm text-gray-600">{stat.meaning}</p>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    stat.status === 'known' ? 'bg-green-100 text-green-800' :
                    stat.status === 'unknown' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {stat.status === 'known' ? '覚えた' :
                     stat.status === 'unknown' ? '覚えてない' : '未分類'}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>覚えた回数: {stat.rememberedCount}</span>
                <span>テスト正解: {stat.correctCount}</span>
                <span>正解率: {stat.accuracy}%</span>
              </div>
            </div>
          ))}
          
          {stats.length > 10 && (
            <div className="text-center text-sm text-gray-500">
              他 {stats.length - 10} 語の統計があります
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 