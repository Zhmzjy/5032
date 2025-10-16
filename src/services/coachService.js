import { db } from '../firebase/config'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore'

export const submitCoachApplication = async (applicationData) => {
  try {
    const docRef = await addDoc(collection(db, 'coachApplications'), {
      ...applicationData,
      status: 'approved',
      submittedAt: serverTimestamp()
    })
    return { id: docRef.id, ...applicationData }
  } catch (error) {
    console.error('Error submitting coach application:', error)
    throw new Error('Failed to submit application')
  }
}

export const getCoachApplicationByUserId = async (userId) => {
  try {
    const q = query(
      collection(db, 'coachApplications'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching coach application:', error)
    return null
  }
}

export const getAllCoachApplications = async () => {
  try {
    const q = query(
      collection(db, 'coachApplications'),
      orderBy('submittedAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching coach applications:', error)
    return []
  }
}
