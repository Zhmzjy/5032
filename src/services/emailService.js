import { auth, defaultDb } from '../firebase/config'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore'

const functions = getFunctions()
const sendEmailFunction = httpsCallable(functions, 'sendEmail')

export const sendEmail = async ({ to, subject, message, replyTo }) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('You must be logged in to send emails')
    }

    const result = await sendEmailFunction({
      to,
      subject,
      message,
      replyTo: replyTo || user.email
    })

    return result.data
  } catch (error) {
    if (error.code === 'functions/unauthenticated') {
      throw new Error('Authentication required. Please log in.')
    } else if (error.code === 'functions/invalid-argument') {
      throw new Error('Invalid email data. Please check your inputs.')
    } else if (error.message.includes('Rate limit')) {
      throw new Error('Too many emails sent. Please wait a minute.')
    } else {
      throw new Error(error.message || 'Failed to send email. Please try again.')
    }
  }
}

export const getEmailHistory = async (userId) => {
  try {
    console.log('getEmailHistory called with userId:', userId)
    const emailLogsRef = collection(defaultDb, 'emailLogs')

    // First, try without orderBy to see if we can get any data
    console.log('Attempting query without orderBy...')
    const simpleQuery = query(
      emailLogsRef,
      where('from', '==', userId),
      limit(100)
    )

    const simpleSnapshot = await getDocs(simpleQuery)
    console.log('Simple query returned docs:', simpleSnapshot.size)

    if (simpleSnapshot.size > 0) {
      console.log('Found emails with simple query, now sorting in memory')
      const emails = []
      simpleSnapshot.forEach((doc) => {
        emails.push({
          id: doc.id,
          ...doc.data()
        })
      })

      // Sort in memory
      emails.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp || 0)
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp || 0)
        return bTime - aTime
      })

      console.log('Sorted emails:', emails.length)
      return emails.slice(0, 10)
    }

    console.log('No emails found with simple query')
    return []
  } catch (error) {
    console.error('Error fetching email history:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    throw new Error('Failed to load email history')
  }
}

export const getEmailLogsPaginated = async (userId, pageSize = 10, lastDoc = null, statusFilter = 'all') => {
  try {
    const emailLogsRef = collection(defaultDb, 'emailLogs')

    let q = query(
      emailLogsRef,
      where('from', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(pageSize)
    )

    if (lastDoc) {
      q = query(
        emailLogsRef,
        where('from', '==', userId),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      )
    }

    const querySnapshot = await getDocs(q)
    const emails = []
    let lastDocument = null

    querySnapshot.forEach((doc) => {
      const emailData = {
        id: doc.id,
        ...doc.data()
      }

      if (statusFilter === 'all' || emailData.status === statusFilter) {
        emails.push(emailData)
      }

      lastDocument = doc
    })

    return {
      emails,
      lastDoc: lastDocument,
      hasMore: querySnapshot.docs.length === pageSize
    }
  } catch (error) {
    console.error('Error fetching paginated email logs:', error)
    throw new Error('Failed to load email logs')
  }
}

export const getTotalEmailCount = async (userId, statusFilter = 'all') => {
  try {
    const emailLogsRef = collection(defaultDb, 'emailLogs')
    const q = query(
      emailLogsRef,
      where('from', '==', userId)
    )

    const querySnapshot = await getDocs(q)

    if (statusFilter === 'all') {
      return querySnapshot.size
    }

    let count = 0
    querySnapshot.forEach((doc) => {
      if (doc.data().status === statusFilter) {
        count++
      }
    })

    return count
  } catch (error) {
    console.error('Error counting emails:', error)
    return 0
  }
}
