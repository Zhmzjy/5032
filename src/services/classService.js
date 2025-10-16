import { db } from '../firebase/config'
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'

export const createClass = async (classData) => {
  try {
    const docRef = await addDoc(collection(db, 'classes'), {
      ...classData,
      enrolledStudents: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { id: docRef.id, ...classData }
  } catch (error) {
    console.error('Error creating class:', error)
    throw new Error('Failed to create class')
  }
}

export const getClassesByCoach = async (coachId) => {
  try {
    const q = query(
      collection(db, 'classes'),
      where('coachId', '==', coachId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching coach classes:', error)
    return []
  }
}

export const getAllClasses = async () => {
  try {
    const q = query(collection(db, 'classes'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching all classes:', error)
    return []
  }
}

export const getClassById = async (classId) => {
  try {
    const docRef = doc(db, 'classes', classId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching class:', error)
    return null
  }
}

export const updateClass = async (classId, updates) => {
  try {
    const docRef = doc(db, 'classes', classId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating class:', error)
    throw new Error('Failed to update class')
  }
}

export const deleteClass = async (classId) => {
  try {
    const docRef = doc(db, 'classes', classId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting class:', error)
    throw new Error('Failed to delete class')
  }
}

export const enrollInClass = async (userId, classId, userName) => {
  try {
    const enrollmentRef = collection(db, 'enrollments')
    await addDoc(enrollmentRef, {
      userId,
      classId,
      userName,
      enrolledAt: serverTimestamp()
    })

    const classRef = doc(db, 'classes', classId)
    const classDoc = await getDoc(classRef)
    if (classDoc.exists()) {
      const currentCount = classDoc.data().enrolledStudents || 0
      await updateDoc(classRef, {
        enrolledStudents: currentCount + 1
      })
    }
  } catch (error) {
    console.error('Error enrolling in class:', error)
    throw new Error('Failed to enroll in class')
  }
}

export const getUserEnrollments = async (userId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching user enrollments:', error)
    return []
  }
}

export const isUserEnrolled = async (userId, classId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('classId', '==', classId)
    )
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error checking enrollment:', error)
    return false
  }
}
