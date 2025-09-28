import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { TopicData } from '@/lib/firestore';

export const getTopicData = async (topic: string): Promise<TopicData | null> => {
  try {
    const q = query(collection(firestore, 'topicData'), where('topic', '==', topic), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data() as TopicData;
    }
    return null;
  } catch (e) {
    console.error('Error getting topic data: ', e);
    return null;
  }
};
