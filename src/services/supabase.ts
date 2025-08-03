import { createClient } from '@supabase/supabase-js';
import { LearningRecord, LearningStats, WordList } from '../types';

// Supabase設定
const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// ユーザーIDを生成（簡易版）
const generateUserId = (): string => {
  const existingId = localStorage.getItem('userId');
  if (existingId) return existingId;
  
  const newId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('userId', newId);
  return newId;
};

// 学習記録を保存
export const saveLearningRecord = async (record: LearningRecord): Promise<boolean> => {
  try {
    const userId = generateUserId();
    
    const { error } = await supabase
      .from('learning_records')
      .insert({
        user_id: userId,
        phrase: record.phrase,
        status: record.status,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving learning record:', error);
    return false;
  }
};

// ユーザーの学習記録を取得
export const getUserLearningRecords = async (): Promise<LearningRecord[]> => {
  try {
    const userId = generateUserId();
    
    const { data, error } = await supabase
      .from('learning_records')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    return data.map(record => ({
      uid: record.id,
      phrase: record.phrase,
      status: record.status,
      timestamp: record.timestamp
    }));
  } catch (error) {
    console.error('Error getting learning records:', error);
    return [];
  }
};

// 学習状況を保存
export const saveLearningStatus = async (phrase: string, status: 'known' | 'unknown'): Promise<void> => {
  try {
    const userId = generateUserId();
    
    const { error } = await supabase
      .from('learning_records')
      .insert({
        user_id: userId,
        phrase,
        status,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving learning status:', error);
  }
};

// ユーザーの学習統計を取得
export const getUserLearningStats = async (idioms: any[]): Promise<LearningStats[]> => {
  const records = await getUserLearningRecords();
  const stats: LearningStats[] = [];

  idioms.forEach(idiom => {
    const idiomRecords = records.filter(r => r.phrase === idiom.phrase);
    const rememberedCount = idiomRecords.filter(r => r.status === 'known').length;
    const correctCount = idiomRecords.filter(r => r.status === 'correct').length;
    const incorrectCount = idiomRecords.filter(r => r.status === 'incorrect').length;
    const totalTests = correctCount + incorrectCount;
    const accuracy = totalTests > 0 ? Math.round((correctCount / totalTests) * 100) : 0;

    let status: 'known' | 'unknown' | 'unclassified' = 'unclassified';
    if (rememberedCount > 0) {
      status = 'known';
    } else if (idiomRecords.some(r => r.status === 'unknown')) {
      status = 'unknown';
    }

    stats.push({
      id: idiom.id,
      phrase: idiom.phrase,
      meaning: idiom.meaning,
      rememberedCount,
      correctCount,
      incorrectCount,
      accuracy,
      status
    });
  });

  return stats;
};

// ユーザーの単語リストを取得
export const getUserWordLists = async (idioms: any[]): Promise<WordList> => {
  const records = await getUserLearningRecords();
  const known: string[] = [];
  const unknown: string[] = [];

  idioms.forEach(idiom => {
    const idiomRecords = records.filter(r => r.phrase === idiom.phrase);
    const hasKnown = idiomRecords.some(r => r.status === 'known');
    const hasUnknown = idiomRecords.some(r => r.status === 'unknown');

    if (hasKnown) {
      known.push(idiom.phrase);
    } else if (hasUnknown) {
      unknown.push(idiom.phrase);
    }
  });

  return { known, unknown };
};

// ユーザーデータをリセット
export const resetUserData = async (): Promise<void> => {
  try {
    const userId = generateUserId();
    
    const { error } = await supabase
      .from('learning_records')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    
    alert('学習データをリセットしました。');
  } catch (error) {
    console.error('Error resetting user data:', error);
    alert('データのリセット中にエラーが発生しました。');
  }
}; 