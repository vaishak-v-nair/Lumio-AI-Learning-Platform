import {
  getFirestore,
  doc,
  getDoc,
} from 'firebase/firestore';

import { firestore } from '@/lib/firebase';
import type { TopicData } from '@/lib/firestore';

export const getTopicData = async (topic: string): Promise<TopicData | null> => {
  try {
    // We have to normalize the topic name from "Time & Distance" to "time-&-distance" to match the doc ID.
    // However, for this project, let's assume simple cases.
    const docId = topic.toLowerCase();
    const docRef = doc(firestore, 'topicData', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as TopicData;
    } else {
      console.log(`No document found for topic: ${topic} with id ${docId}`);
      return null;
    }
  } catch (e) {
    console.error('Error getting topic data: ', e);
    return null;
  }
};
