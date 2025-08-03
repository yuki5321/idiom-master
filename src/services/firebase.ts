import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { LearningRecord, LearningStats, WordList } from '../types';

// Firebase設定（実際のプロジェクトでは環境変数を使用）
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 匿名認証でユーザーを識別
export const initializeUser = async (): Promise<User | null> => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Error initializing user:', error);
    return null;
  }
};

// 現在のユーザーを取得
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// 学習記録を保存
export const saveLearningRecord = async (record: LearningRecord): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.error('No user authenticated');
      return false;
    }

    const recordWithUserId = {
      ...record,
      userId: user.uid,
      timestamp: new Date().toISOString()
    };

    await addDoc(collection(db, 'learningRecords'), recordWithUserId);
    return true;
  } catch (error) {
    console.error('Error saving learning record:', error);
    return false;
  }
};

// ユーザーの学習記録を取得
export const getUserLearningRecords = async (): Promise<LearningRecord[]> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.error('No user authenticated');
      return [];
    }

    const q = query(
      collection(db, 'learningRecords'), 
      where('userId', '==', user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const records: LearningRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        uid: doc.id,
        phrase: data.phrase,
        status: data.status,
        timestamp: data.timestamp
      });
    });

    return records;
  } catch (error) {
    console.error('Error getting learning records:', error);
    return [];
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

// 学習状況を保存
export const saveLearningStatus = async (phrase: string, status: 'known' | 'unknown'): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    const record: LearningRecord = {
      uid: Date.now().toString(),
      phrase,
      status,
      timestamp: new Date().toISOString()
    };

    await saveLearningRecord(record);
  } catch (error) {
    console.error('Error saving learning status:', error);
  }
};

// ユーザーデータをリセット
export const resetUserData = async (): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    const q = query(
      collection(db, 'learningRecords'), 
      where('userId', '==', user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    
    alert('学習データをリセットしました。');
  } catch (error) {
    console.error('Error resetting user data:', error);
    alert('データのリセット中にエラーが発生しました。');
  }
}; 