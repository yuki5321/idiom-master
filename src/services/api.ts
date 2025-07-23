import { Idiom, LearningRecord } from '../types';

const API_BASE_URL = 'https://script.google.com/macros/s/XXX/exec';

// Mock data for development - replace with actual API call
const mockIdioms: Idiom[] = [
  { id: 1, phrase: "break the ice", meaning: "to start a conversation or make people feel more comfortable" },
  { id: 2, phrase: "hit the books", meaning: "to study hard" },
  { id: 3, phrase: "piece of cake", meaning: "something very easy to do" },
  { id: 4, phrase: "cost an arm and a leg", meaning: "to be very expensive" },
  { id: 5, phrase: "under the weather", meaning: "feeling sick or unwell" },
  { id: 6, phrase: "spill the beans", meaning: "to reveal a secret" },
  { id: 7, phrase: "bite the bullet", meaning: "to face a difficult situation bravely" },
  { id: 8, phrase: "break a leg", meaning: "good luck (especially before a performance)" },
  { id: 9, phrase: "call it a day", meaning: "to stop working for the day" },
  { id: 10, phrase: "get cold feet", meaning: "to become nervous or hesitant about something" }
];

export const fetchIdioms = async (): Promise<Idiom[]> => {
  try {
    // In production, uncomment this and remove mock data:
    // const response = await fetch(API_BASE_URL);
    // const data = await response.json();
    // return data;
    
    // For development, return mock data
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockIdioms), 500);
    });
  } catch (error) {
    console.error('Error fetching idioms:', error);
    return mockIdioms; // Fallback to mock data
  }
};

export const submitLearningRecord = async (record: LearningRecord): Promise<boolean> => {
  try {
    console.log('Learning Record:', record);
    
    // In production, uncomment this:
    // const response = await fetch(API_BASE_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(record),
    // });
    // return response.ok;
    
    // For development, simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 200);
    });
  } catch (error) {
    console.error('Error submitting learning record:', error);
    return false;
  }
};