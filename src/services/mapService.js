import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions()
const searchLocationsFunction = httpsCallable(functions, 'searchLocations')
const searchPlacesFunction = httpsCallable(functions, 'searchPlaces')
const getDirectionsFunction = httpsCallable(functions, 'getDirections')

export const searchLocations = async ({ query, locationType, userLat, userLng, searchScope }) => {
  try {
    const result = await searchLocationsFunction({
      query,
      locationType,
      userLat,
      userLng,
      searchScope
    })

    return result.data
  } catch (error) {
    console.error('Error searching locations:', error)
    if (error.code === 'functions/invalid-argument') {
      throw new Error('Invalid search parameters')
    } else if (error.code === 'functions/unavailable') {
      throw new Error('Service temporarily unavailable. Please try again.')
    } else {
      throw new Error(error.message || 'Failed to search locations')
    }
  }
}

export const searchPlaces = async ({ query, locationType, userLat, userLng, searchScope }) => {
  try {
    const result = await searchPlacesFunction({
      query,
      locationType,
      userLat,
      userLng,
      searchScope
    })

    return result.data
  } catch (error) {
    console.error('Error searching places:', error)
    if (error.code === 'functions/invalid-argument') {
      throw new Error('Invalid search parameters')
    } else if (error.code === 'functions/unavailable') {
      throw new Error('Service temporarily unavailable. Please try again.')
    } else {
      throw new Error(error.message || 'Failed to search places')
    }
  }
}

export const getDirections = async ({ originLat, originLng, destLat, destLng, mode }) => {
  try {
    const result = await getDirectionsFunction({
      originLat,
      originLng,
      destLat,
      destLng,
      mode
    })

    return result.data
  } catch (error) {
    console.error('Error getting directions:', error)
    if (error.code === 'functions/invalid-argument') {
      throw new Error('Invalid location parameters')
    } else if (error.code === 'functions/unavailable') {
      throw new Error('Service temporarily unavailable. Please try again.')
    } else {
      throw new Error(error.message || 'Failed to get directions')
    }
  }
}
