import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudyMode } from './components/StudyMode';
import { QuizMode } from './components/QuizMode';
import { WordLists } from './components/WordLists';
import { IdiomList } from './components/IdiomList';
import { Statistics } from './components/Statistics';
import { LoadingSpinner } from './components/LoadingSpinner';
import { fetchIdioms } from './services/api';
import { Idiom, AppMode } from './types';

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('study');
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIdioms = async () => {
      try {
        const data = await fetchIdioms();
        setIdioms(data);
      } catch (error) {
        console.error('Failed to load idioms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIdioms();
  }, []);

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
    setCurrentIndex(0); // Reset to first item when switching modes
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= idioms.length ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (idioms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">英熟語データが利用できません</h2>
          <p className="text-gray-600">接続を確認して、もう一度お試しください。</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentMode) {
      case 'study':
        return (
          <StudyMode 
            idioms={idioms}
            currentIndex={currentIndex}
            onNext={handleNext}
          />
        );
      case 'quiz':
        return (
          <QuizMode 
            idioms={idioms}
            currentIndex={currentIndex}
            onNext={handleNext}
          />
        );
      case 'lists':
        return <IdiomList idioms={idioms} />;
      case 'statistics':
        return <Statistics idioms={idioms} />;
      default:
        return (
          <StudyMode 
            idioms={idioms}
            currentIndex={currentIndex}
            onNext={handleNext}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentMode={currentMode} onModeChange={handleModeChange} />
      
      <main className="pb-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;