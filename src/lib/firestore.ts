'use client';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { GeneratePersonalizedTestOutput } from '@/ai/flows/generate-personalized-test';

export interface TestResult {
  userId: string;
  score: number;
  answers: (number | null)[];
  timings: number[];
  questions: GeneratePersonalizedTestOutput['questions'];
  testId: string;
  date: string;
  topic: string;
}

export interface TopicData {
  topic: string;
  concepts: {
    name: string;
    explanation: string;
  }[];
  examples: {
    problem: string;
    solution: string;
  }[];
}


export const saveTestResult = async (result: TestResult) => {
  try {
    const docRef = await addDoc(collection(firestore, 'testResults'), result);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    return null;
  }
};

export const getLatestTestResult = async (
  userId: string,
  topic?: string
): Promise<TestResult | null> => {
  try {
    let q;
    if (topic) {
       q = query(
        collection(firestore, 'testResults'),
        where('userId', '==', userId),
        where('topic', '==', topic),
        orderBy('date', 'desc'),
        limit(1)
      );
    } else {
       q = query(
        collection(firestore, 'testResults'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(1)
      );
    }

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data() as TestResult;
    }
    return null;
  } catch (e) {
    console.error('Error getting documents: ', e);
    return null;
  }
};


export const getTopicDataDoc = async (topic: string): Promise<TopicData | null> => {
  try {
    const docRef = doc(firestore, 'topicData', topic);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as TopicData;
    } else {
      console.log(`No such document for topic: ${topic}`);
      return null;
    }
  } catch (e) {
    console.error('Error getting topic data: ', e);
    return null;
  }
};
