'use server';
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
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Question } from '@/ai/flows/generate-questions-from-topic-data';
import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  userId: string;
  score: number;
  answers: (number | null)[];
  timings: number[];
  questions: Question[];
  testId: string;
  date: string;
  topic: string;
}

export interface AggregatedPerformance {
    [category: string]: {
        totalQuestions: number;
        correctAnswers: number;
        averageScore: number;
    };
}

export interface PerformanceHistory {
    testId: string;
    topic: string;
    score: number;
    date: string;
}

export interface UserProfile {
  userId: string; // This is the unique username
  name?: string; // This is the display name
  learningContext?: string;
  createdAt?: string;
  bio?: string;
  avatarUrl?: string;
  performanceHistory?: PerformanceHistory[];
  aggregatedPerformance?: AggregatedPerformance;
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
    // 1. Save the full test result
    const docRef = await addDoc(collection(firestore, 'testResults'), result);
    console.log('Test result saved with ID: ', docRef.id);

    // 2. Update the user's profile with aggregated data
    const userProfile = await getUserProfile(result.userId);
    if (userProfile) {
        const userDocRef = doc(firestore, 'users', result.userId);

        // Initialize or update performance history
        const newHistoryEntry: PerformanceHistory = {
            testId: result.testId,
            topic: result.topic,
            score: result.score,
            date: result.date,
        };
        const updatedHistory = [...(userProfile.performanceHistory || []), newHistoryEntry];

        // Initialize or update aggregated performance
        const updatedAggregatedPerformance = userProfile.aggregatedPerformance || {};
        result.questions.forEach((q, index) => {
            const category = q.category;
            if (!updatedAggregatedPerformance[category]) {
                updatedAggregatedPerformance[category] = {
                    totalQuestions: 0,
                    correctAnswers: 0,
                    averageScore: 0,
                };
            }
            const stats = updatedAggregatedPerformance[category];
            stats.totalQuestions += 1;
            if (result.answers[index] === q.correctAnswerIndex) {
                stats.correctAnswers += 1;
            }
            stats.averageScore = (stats.correctAnswers / stats.totalQuestions) * 100;
        });

        await updateDoc(userDocRef, {
            performanceHistory: updatedHistory,
            aggregatedPerformance: updatedAggregatedPerformance,
        });

        console.log(`User profile updated for ${result.userId}`);
    }

    return docRef.id;
  } catch (e) {
    console.error('Error adding document or updating profile: ', e);
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


export const createUserProfile = async (profile: Partial<UserProfile> & { userId: string }): Promise<boolean> => {
  try {
    // Use setDoc with merge: true to create or update the profile
    await setDoc(doc(firestore, 'users', profile.userId), profile, { merge: true });
    console.log(`User profile created/updated for ${profile.userId}`);
    return true;
  } catch (e) {
    console.error('Error creating/updating user profile: ', e);
    return false;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const docRef = doc(firestore, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    } catch (e) {
        console.error('Error getting user profile: ', e);
        return null;
    }
}

export const getTopicData = async (topic: string): Promise<TopicData | null> => {
  try {
    if (topic.toLowerCase() === 'percentages') {
        const filePath = path.join(process.cwd(), 'src', 'lib', 'percentages-data.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }
    // In a real app, you might query Firestore here for other topics.
    // e.g. const docRef = doc(firestore, 'topicData', topic.toLowerCase());
    console.log(`No data file found for topic: ${topic}`);
    return null;
  } catch (e) {
    console.error('Error getting topic data: ', e);
    return null;
  }
};
