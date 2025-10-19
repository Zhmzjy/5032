import { db } from '../firebase/config'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore'

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

export const updateReview = async (reviewId, updates) => {
  try {
    const docRef = doc(db, 'reviews', reviewId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating review:', error)
    throw new Error('Failed to update review')
  }
}

export const deleteReview = async (reviewId) => {
  try {
    const docRef = doc(db, 'reviews', reviewId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting review:', error)
    throw new Error('Failed to delete review')
  }
}

export const getReviewsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const reviews = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    reviews.sort((a, b) => {
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return bTime - aTime
    })

    return reviews
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return []
  }
}

export const getReviewsByCoach = async (coachId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('coachId', '==', coachId)
    )
    const querySnapshot = await getDocs(q)
    const reviews = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    reviews.sort((a, b) => {
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return bTime - aTime
    })

    return reviews
  } catch (error) {
    console.error('Error fetching coach reviews:', error)
    return []
  }
}

export const getReviewsByClass = async (classId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('classId', '==', classId)
    )
    const querySnapshot = await getDocs(q)
    const reviews = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    reviews.sort((a, b) => {
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return bTime - aTime
    })

    return reviews
  } catch (error) {
    console.error('Error fetching class reviews:', error)
    return []
  }
}
