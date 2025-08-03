import React, { useState, useEffect } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import { Idiom } from '../types';
import { getWordLists, saveLearningStatus } from '../services/api';

interface WordListsProps {
  idioms: Idiom[];
}

export const WordLists: React.FC<WordListsProps> = ({ idioms }) => {
  const [wordLists, setWordLists] = useState<{ known: string[]; unknown: string[] }>({ known: [], unknown: [] });
  const [activeTab, setActiveTab] = useState<'known' | 'unknown'>('known');

  useEffect(() => {
    const lists = getWordLists(idioms);
    setWordLists(lists);
  }, [idioms]);

  const handleStatusChange = (phrase: string, newStatus: 'known' | 'unknown') => {
    saveLearningStatus(phrase, newStatus);
    
    // Update local state
    setWordLists(prev => {
      const newLists = { ...prev };
      
      // Remove from both lists
      newLists.known = newLists.known.filter(p => p !== phrase);
      newLists.unknown = newLists.unknown.filter(p => p !== phrase);
      
      // Add to appropriate list
      if (newStatus === 'known') {
        newLists.known.push(phrase);
      } else {
        newLists.unknown.push(phrase);
      }
      
      return newLists;
    });
  };

  const getMeaning = (phrase: string) => {
    const idiom = idioms.find(i => i.phrase === phrase);
    return idiom?.meaning || '';
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">単語リスト管理</h2>
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('known')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'known'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            覚えた単語 ({wordLists.known.length})
          </button>
          <button
            onClick={() => setActiveTab('unknown')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'unknown'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            覚えてない単語 ({wordLists.unknown.length})
          </button>
        </div>

        {/* Word List */}
        <div className="space-y-3">
          {(activeTab === 'known' ? wordLists.known : wordLists.unknown).map((phrase, index) => (
            <div
              key={phrase}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                activeTab === 'known'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{phrase}</h3>
                  <p className="text-sm text-gray-600">{getMeaning(phrase)}</p>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {activeTab === 'known' ? (
                    <button
                      onClick={() => handleStatusChange(phrase, 'unknown')}
                      className="flex items-center justify-center p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200"
                      title="覚えてないに変更"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(phrase, 'known')}
                      className="flex items-center justify-center p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200"
                      title="覚えたに変更"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {(activeTab === 'known' ? wordLists.known : wordLists.unknown).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'known' ? '覚えた単語はありません' : '覚えてない単語はありません'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 