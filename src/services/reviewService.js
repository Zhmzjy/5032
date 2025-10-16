import { db } from '../firebase/config'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore'

export const submitReview = async (reviewData) => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp()
    })
    return { id: docRef.id, ...reviewData }
  } catch (error) {
    console.error('Error submitting review:', error)
    throw new Error('Failed to submit review')
  }
}

export const getReviewsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return []
  }
}

export const getReviewsByCoach = async (coachId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('coachId', '==', coachId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching coach reviews:', error)
    return []
  }
}

export const getReviewsByClass = async (classId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('classId', '==', classId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching class reviews:', error)
    return []
  }
}
