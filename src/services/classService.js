import { db } from '../firebase/config'
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, limit, Timestamp } from 'firebase/firestore'

export const createClass = async (classData) => {
  try {
    const classDateTime = classData.dateTime ? Timestamp.fromDate(new Date(classData.dateTime)) : null

    const docRef = await addDoc(collection(db, 'classes'), {
      ...classData,
      dateTime: classDateTime,
      enrolledStudents: 0,
      maxCapacity: classData.maxCapacity || 20,
      status: 'active',
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
    const q = query(collection(db, 'classes'), orderBy('dateTime', 'asc'))
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

    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('classId', '==', classId)
    )
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery)
    const deletePromises = enrollmentsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error deleting class:', error)
    throw new Error('Failed to delete class')
  }
}

export const enrollInClass = async (userId, classId, userName) => {
  try {
    const isEnrolled = await isUserEnrolled(userId, classId)
    if (isEnrolled) {
      throw new Error('Already enrolled in this class')
    }

    const classDoc = await getClassById(classId)
    if (!classDoc) {
      throw new Error('Class not found')
    }

    if (classDoc.enrolledStudents >= classDoc.maxCapacity) {
      throw new Error('Class is full')
    }

    const enrollmentRef = collection(db, 'enrollments')
    await addDoc(enrollmentRef, {
      userId,
      classId,
      userName,
      status: 'active',
      enrolledAt: serverTimestamp()
    })

    const classRef = doc(db, 'classes', classId)
    const currentCount = classDoc.enrolledStudents || 0
    await updateDoc(classRef, {
      enrolledStudents: currentCount + 1,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error enrolling in class:', error)
    throw error
  }
}

export const unenrollFromClass = async (userId, classId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('classId', '==', classId)
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      throw new Error('Enrollment not found')
    }

    const enrollmentDoc = querySnapshot.docs[0]
    await deleteDoc(enrollmentDoc.ref)

    const classRef = doc(db, 'classes', classId)
    const classDoc = await getDoc(classRef)
    if (classDoc.exists()) {
      const currentCount = classDoc.data().enrolledStudents || 0
      await updateDoc(classRef, {
        enrolledStudents: Math.max(0, currentCount - 1),
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error unenrolling from class:', error)
    throw error
  }
}

export const getUserEnrollments = async (userId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const enrollments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    enrollments.sort((a, b) => {
      const aTime = a.enrolledAt?.toDate ? a.enrolledAt.toDate() : new Date(a.enrolledAt || 0)
      const bTime = b.enrolledAt?.toDate ? b.enrolledAt.toDate() : new Date(b.enrolledAt || 0)
      return bTime - aTime
    })

    return enrollments
  } catch (error) {
    console.error('Error fetching user enrollments:', error)
    return []
  }
}

export const getClassEnrollments = async (classId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('classId', '==', classId)
    )
    const querySnapshot = await getDocs(q)
    const enrollments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    enrollments.sort((a, b) => {
      const aTime = a.enrolledAt?.toDate ? a.enrolledAt.toDate() : new Date(a.enrolledAt || 0)
      const bTime = b.enrolledAt?.toDate ? b.enrolledAt.toDate() : new Date(b.enrolledAt || 0)
      return bTime - aTime
    })

    return enrollments
  } catch (error) {
    console.error('Error fetching class enrollments:', error)
    return []
  }
}

export const isUserEnrolled = async (userId, classId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('classId', '==', classId),
      limit(1)
    )
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error checking enrollment:', error)
    return false
  }
}

export const getClassStatus = (classData) => {
  if (!classData) return 'unknown'

  if (classData.status === 'cancelled') return 'cancelled'

  const now = new Date()
  const classDate = classData.dateTime?.toDate ? classData.dateTime.toDate() : new Date(classData.dateTime)

  if (classDate < now) return 'completed'
  if (classData.enrolledStudents >= classData.maxCapacity) return 'full'

  return 'active'
}
