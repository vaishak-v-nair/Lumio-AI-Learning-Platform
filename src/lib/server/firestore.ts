
import {
  getFirestore,
  doc,
  getDoc,
} from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

import { firestore } from '@/lib/firebase';
import type { TopicData, UserProfile } from '@/lib/firestore';

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
