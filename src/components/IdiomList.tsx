import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Eye, EyeOff, Check, X, BookOpen } from 'lucide-react';
import { Idiom } from '../types';
import { getWordLists, saveLearningStatus } from '../services/api';

interface IdiomListProps {
  idioms: Idiom[];
}

type FilterType = 'all' | 'known' | 'unknown' | 'unclassified';

export const IdiomList: React.FC<IdiomListProps> = ({ idioms }) => {
  const [wordLists, setWordLists] = useState<{ known: string[]; unknown: string[] }>({ known: [], unknown: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showMeanings, setShowMeanings] = useState(false);
  const [expandedIdiom, setExpandedIdiom] = useState<string | null>(null);

  useEffect(() => {
    const loadWordLists = async () => {
      const lists = await getWordLists(idioms);
      setWordLists(lists);
    };
    loadWordLists();
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

  const getStatus = (phrase: string): 'known' | 'unknown' | 'unclassified' => {
    if (wordLists.known.includes(phrase)) return 'known';
    if (wordLists.unknown.includes(phrase)) return 'unknown';
    return 'unclassified';
  };

  const filteredIdioms = useMemo(() => {
    let filtered = idioms;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(idiom =>
        idiom.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idiom.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterType !== 'all') {
      filtered = filtered.filter(idiom => getStatus(idiom.phrase) === filterType);
    }

    return filtered;
  }, [idioms, searchTerm, filterType, wordLists]);

  const stats = useMemo(() => {
    const total = idioms.length;
    const known = wordLists.known.length;
    const unknown = wordLists.unknown.length;
    const unclassified = total - known - unknown;
    const progress = total > 0 ? Math.round((known / total) * 100) : 0;

    return { total, known, unknown, unclassified, progress };
  }, [idioms.length, wordLists]);

  const getStatusColor = (status: 'known' | 'unknown' | 'unclassified') => {
    switch (status) {
      case 'known': return 'bg-green-100 text-green-800 border-green-200';
      case 'unknown': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: 'known' | 'unknown' | 'unclassified') => {
    switch (status) {
      case 'known': return <Check className="w-4 h-4" />;
      case 'unknown': return <X className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">単語リスト一覧 ✨</h1>
            <p className="text-gray-600">全{stats.total}個の英熟語を管理できます</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setShowMeanings(!showMeanings)}
              className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200"
            >
              {showMeanings ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showMeanings ? '意味を隠す' : '意味を表示'}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.known}</div>
            <div className="text-sm text-green-700">覚えた</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.unknown}</div>
            <div className="text-sm text-red-700">覚えてない</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.unclassified}</div>
            <div className="text-sm text-gray-700">未分類</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.progress}%</div>
            <div className="text-sm text-blue-700">進捗</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>学習進捗</span>
            <span>{stats.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="英熟語や意味で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべて ({stats.total})</option>
              <option value="known">覚えた ({stats.known})</option>
              <option value="unknown">覚えてない ({stats.unknown})</option>
              <option value="unclassified">未分類 ({stats.unclassified})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Idiom List */}
      <div className="space-y-4">
        {filteredIdioms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">該当する英熟語が見つかりません</h3>
            <p className="text-gray-600">検索条件を変更してお試しください</p>
          </div>
        ) : (
          filteredIdioms.map((idiom) => {
            const status = getStatus(idiom.phrase);
            const isExpanded = expandedIdiom === idiom.phrase;
            
            return (
              <div
                key={idiom.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{idiom.phrase}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(status)}
                          <span>
                            {status === 'known' && '覚えた'}
                            {status === 'unknown' && '覚えてない'}
                            {status === 'unclassified' && '未分類'}
                          </span>
                        </span>
                      </span>
                    </div>
                    
                    {showMeanings && (
                      <p className="text-gray-700 mb-4 leading-relaxed">{idiom.meaning}</p>
                    )}
                    
                    {isExpanded && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">詳細情報</h4>
                        <p className="text-gray-700 leading-relaxed">{idiom.meaning}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setExpandedIdiom(isExpanded ? null : idiom.phrase)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      title={isExpanded ? '詳細を閉じる' : '詳細を表示'}
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    
                    {status !== 'known' && (
                      <button
                        onClick={() => handleStatusChange(idiom.phrase, 'known')}
                        className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200"
                        title="覚えたに変更"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    
                    {status !== 'unknown' && (
                      <button
                        onClick={() => handleStatusChange(idiom.phrase, 'unknown')}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200"
                        title="覚えてないに変更"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Results Summary */}
      {filteredIdioms.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>表示中: {filteredIdioms.length} / {stats.total} 個</span>
            <span>検索結果</span>
          </div>
        </div>
      )}
    </div>
  );
}; 