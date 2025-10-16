import { auth, db } from '../firebase/config'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'

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
    const emailLogsRef = collection(db, 'emailLogs')
    const q = query(
      emailLogsRef,
      where('from', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    )

    const querySnapshot = await getDocs(q)
    const emails = []

    querySnapshot.forEach((doc) => {
      emails.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return emails
  } catch (error) {
    console.error('Error fetching email history:', error)
    throw new Error('Failed to load email history')
  }
}
