import { Idiom, LearningRecord, LearningStats, WordList } from '../types';
import { 
  saveLearningRecord as saveCloudflareRecord,
  getUserLearningRecords as getCloudflareRecords,
  saveLearningStatus as saveCloudflareStatus,
  getUserLearningStats as getCloudflareStats,
  getUserWordLists as getCloudflareWordLists,
  resetUserData as resetCloudflareData
} from './cloudflare';

export const fetchIdioms = async (): Promise<Idiom[]> => {
  try {
    const response = await fetch('/idioms_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching idioms:', error);
    // Fallback to mock data if JSON file is not available
    return mockIdioms;
  }
};

// Mock data for fallback
const mockIdioms: Idiom[] = [
  { id: 1, phrase: "lead to ～", meaning: "～（という結果）を引き起こす、～へと通じる" },
  { id: 2, phrase: "break the ice", meaning: "会話を始める、緊張をほぐす" },
  { id: 3, phrase: "hit the books", meaning: "一生懸命勉強する" },
  { id: 4, phrase: "piece of cake", meaning: "とても簡単なこと" },
  { id: 5, phrase: "cost an arm and a leg", meaning: "非常に高価である" },
  { id: 6, phrase: "under the weather", meaning: "体調が悪い、気分が優れない" },
  { id: 7, phrase: "spill the beans", meaning: "秘密を漏らす" },
  { id: 8, phrase: "bite the bullet", meaning: "困難な状況に勇敢に立ち向かう" },
  { id: 9, phrase: "break a leg", meaning: "頑張って（特に公演前に使う）" },
  { id: 10, phrase: "call it a day", meaning: "その日の仕事を終える" }
];

export const submitLearningRecord = async (record: LearningRecord): Promise<boolean> => {
  return await saveCloudflareRecord(record);
};

// Helper function to get learning records from Cloudflare
export const getLearningRecords = async (): Promise<LearningRecord[]> => {
  return await getCloudflareRecords();
};

// Helper function to save learning status
export const saveLearningStatus = async (phrase: string, status: 'known' | 'unknown'): Promise<void> => {
  await saveCloudflareStatus(phrase, status);
};

// Get learning statistics
export const getLearningStats = async (idioms: Idiom[]): Promise<LearningStats[]> => {
  return await getCloudflareStats(idioms);
};

// Get word lists
export const getWordLists = async (idioms: Idiom[]): Promise<WordList> => {
  return await getCloudflareWordLists(idioms);
};

// Export statistics to CSV
export const exportStatsToCSV = (stats: LearningStats[]): void => {
  const csvContent = [
    'No.,熟語,意味,覚えた回数,テスト正解,テスト不正解,正解率,状態',
    ...stats.map(stat => 
      `${stat.id},"${stat.phrase}","${stat.meaning}",${stat.rememberedCount},${stat.correctCount},${stat.incorrectCount},${stat.accuracy}%,${stat.status}`
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'idiom_stats.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Reset all learning data
export const resetLearningData = async (): Promise<void> => {
  await resetCloudflareData();
};