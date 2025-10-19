/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions/v2");
const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const {defineSecret} = require("firebase-functions/params");
const axios = require("axios");

admin.initializeApp();

const sendgridApiKey = defineSecret("SENDGRID_API_KEY");
const sendgridFromEmail = defineSecret("SENDGRID_FROM_EMAIL");
const sendgridFromName = defineSecret("SENDGRID_FROM_NAME");
const mapboxAccessToken = defineSecret("MAPBOX_ACCESS_TOKEN");
const googlePlacesApiKey = defineSecret("GOOGLE_PLACES_API_KEY");

const rateLimitMap = new Map();

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];

  const recentRequests = userRequests.filter(timestamp => now - timestamp < 60000);

  if (recentRequests.length >= 3) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);

  return true;
};

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.sendEmail = onCall({
  cors: true,
  secrets: [sendgridApiKey, sendgridFromEmail, sendgridFromName]
}, async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Authentication required");
    }

    const {to, subject, message, replyTo} = request.data;
    const userId = request.auth.uid;

    if (!to || !subject || !message) {
      throw new Error("Missing required fields: to, subject, message");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid recipient email address");
    }

    if (replyTo && !emailRegex.test(replyTo)) {
      throw new Error("Invalid reply-to email address");
    }

    if (subject.length > 200) {
      throw new Error("Subject exceeds maximum length of 200 characters");
    }

    if (message.length > 5000) {
      throw new Error("Message exceeds maximum length of 5000 characters");
    }

    if (!checkRateLimit(userId)) {
      throw new Error("Rate limit exceeded. Maximum 3 emails per minute");
    }

    sgMail.setApiKey(sendgridApiKey.value());

    const userDoc = await admin.firestore()
      .collection("userData")
      .doc(userId)
      .get();

    const userName = userDoc.exists ?
      (userDoc.data().name || request.auth.token.name || "User") :
      (request.auth.token.name || "User");

    const userEmail = request.auth.token.email || replyTo || "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3498db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .message-box { background: white; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0; }
          .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">FitTogether</h2>
          </div>
          <div class="content">
            <div class="meta">
              <strong>From:</strong> ${userName}${userEmail ? ` (${userEmail})` : ""}<br>
              <strong>Date:</strong> ${new Date().toLocaleString()}
            </div>
            <div class="message-box">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
          <div class="footer">
            ${replyTo ? `<p>Click "Reply" to respond directly to ${userEmail || replyTo}</p>` : ""}
            <p>This email was sent via FitTogether</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const plainTextContent = `
FitTogether Message

From: ${userName}${userEmail ? ` (${userEmail})` : ""}
Date: ${new Date().toLocaleString()}

────────────────────────────────

${message}

────────────────────────────────
${replyTo ? `Reply to this email to contact ${userEmail || replyTo}` : ""}

This email was sent via FitTogether
    `;

    const msg = {
      to: to,
      from: {
        email: sendgridFromEmail.value(),
        name: sendgridFromName.value()
      },
      subject: subject,
      text: plainTextContent,
      html: htmlContent
    };

    if (replyTo) {
      msg.replyTo = replyTo;
    }

    await sgMail.send(msg);

    await admin.firestore().collection("emailLogs").add({
      from: userId,
      fromEmail: userEmail,
      fromName: userName,
      to: to,
      subject: subject,
      status: "success",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      messageLength: message.length
    });

    return {
      success: true,
      message: "Email sent successfully"
    };

  } catch (error) {
    console.error("Error sending email:", error);

    if (request.auth) {
      try {
        await admin.firestore().collection("emailLogs").add({
          from: request.auth.uid,
          to: request.data?.to || "unknown",
          subject: request.data?.subject || "unknown",
          status: "failed",
          error: error.message,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (logError) {
        console.error("Error logging failed email:", logError);
      }
    }

    throw new Error(error.message || "Failed to send email");
  }
});

exports.searchLocations = onCall({
  cors: true,
  secrets: [mapboxAccessToken]
}, async (request) => {
  try {
    const {query, locationType, userLat, userLng, searchScope} = request.data;

    if (!query && !locationType) {
      throw new Error("Search query or location type is required");
    }

    const searchTerm = query || locationType;
    const lat = userLat || -37.8136;
    const lng = userLng || 144.9631;
    const scope = searchScope || '10';

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json`;

    let bbox = null;
    if (scope !== 'all') {
      const radius = parseFloat(scope);
      const latDelta = radius / 111.32;
      const lngDelta = radius / (111.32 * Math.cos(lat * Math.PI / 180));

      bbox = [
        lng - lngDelta,
        lat - latDelta,
        lng + lngDelta,
        lat + latDelta
      ].join(',');
    } else {
      bbox = '144.5937,-38.4339,145.5125,-37.5113';
    }

    const params = {
      proximity: `${lng},${lat}`,
      limit: 50,
      access_token: mapboxAccessToken.value()
    };

    if (bbox) {
      params.bbox = bbox;
    }

    const response = await axios.get(url, { params });

    if (!response.data.features || response.data.features.length === 0) {
      return {
        success: true,
        results: [],
        message: "No results found"
      };
    }

    const results = response.data.features.map((place) => {
      let distance = null;
      if (userLat && userLng) {
        const R = 6371;
        const dLat = (place.center[1] - lat) * Math.PI / 180;
        const dLng = (place.center[0] - lng) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(place.center[1] * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        distance = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
      }

      return {
        id: place.id,
        name: place.text,
        address: place.place_name,
        lng: place.center[0],
        lat: place.center[1],
        distance: distance
      };
    });

    if (request.auth) {
      await admin.firestore().collection("mapSearchLogs").add({
        userId: request.auth.uid,
        query: searchTerm,
        resultCount: results.length,
        searchScope: scope,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      success: true,
      results: results
    };

  } catch (error) {
    console.error("Error searching locations:", error);
    throw new Error(error.message || "Failed to search locations");
  }
});

exports.getDirections = onCall({
  cors: true,
  secrets: [mapboxAccessToken]
}, async (request) => {
  try {
    const {originLat, originLng, destLat, destLng, mode} = request.data;

    if (!originLat || !originLng || !destLat || !destLng) {
      throw new Error("Origin and destination coordinates are required");
    }

    const validModes = ['walking', 'cycling', 'driving'];
    const travelMode = validModes.includes(mode) ? mode : 'walking';

    const profile = `mapbox/${travelMode}`;
    const url = `https://api.mapbox.com/directions/v5/${profile}/${originLng},${originLat};${destLng},${destLat}`;

    const response = await axios.get(url, {
      params: {
        geometries: 'geojson',
        access_token: mapboxAccessToken.value()
      }
    });

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error("No route found");
    }

    const route = response.data.routes[0];

    const result = {
      distance: (route.distance / 1000).toFixed(2) + ' km',
      duration: Math.round(route.duration / 60) + ' min',
      geometry: route.geometry,
      mode: travelMode.charAt(0).toUpperCase() + travelMode.slice(1)
    };

    if (request.auth) {
      await admin.firestore().collection("directionsLogs").add({
        userId: request.auth.uid,
        mode: travelMode,
        distance: route.distance,
        duration: route.duration,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      success: true,
      route: result
    };

  } catch (error) {
    console.error("Error getting directions:", error);
    throw new Error(error.message || "Failed to get directions");
  }
});

exports.searchPlaces = onCall({
  cors: true,
  secrets: [googlePlacesApiKey]
}, async (request) => {
  try {
    const {query, userLat, userLng, searchScope} = request.data;

    if (!query) {
      throw new Error("Search query is required");
    }

    const lat = userLat || -37.8136;
    const lng = userLng || 144.9631;
    const scope = searchScope || '10';
    const radius = scope === 'all' ? 50000 : parseFloat(scope) * 1000;

    const url = 'https://places.googleapis.com/v1/places:searchText';

    const requestBody = {
      textQuery: query,
      locationBias: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng
          },
          radius: Math.min(radius, 50000)
        }
      },
      maxResultCount: 20
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googlePlacesApiKey.value(),
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.types,places.id'
    };

    console.log('Searching places with text query:', { query, lat, lng, radius });

    const response = await axios.post(url, requestBody, { headers });

    console.log('API Response status:', response.status);

    if (!response.data.places || response.data.places.length === 0) {
      return {
        success: true,
        results: [],
        message: "No results found"
      };
    }

    const results = response.data.places.map((place) => {
      const R = 6371;
      const placeLat = place.location.latitude;
      const placeLng = place.location.longitude;
      const dLat = (placeLat - lat) * Math.PI / 180;
      const dLng = (placeLng - lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      const distance = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;

      return {
        id: place.id,
        name: place.displayName?.text || place.displayName || 'Unknown',
        address: place.formattedAddress || 'Address not available',
        lng: placeLng,
        lat: placeLat,
        distance: distance,
        rating: place.rating || null,
        userRatingsTotal: place.userRatingCount || 0,
        isOpen: place.currentOpeningHours?.openNow,
        types: place.types || []
      };
    });

    const sortedResults = results.sort((a, b) => {
      const distA = parseFloat(a.distance);
      const distB = parseFloat(b.distance);
      return distA - distB;
    });

    console.log('Returning sorted results:', sortedResults.length);

    if (request.auth) {
      await admin.firestore().collection("mapSearchLogs").add({
        userId: request.auth.uid,
        query: query,
        resultCount: sortedResults.length,
        searchScope: scope,
        apiUsed: 'google-places-text-search',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      success: true,
      results: sortedResults
    };

  } catch (error) {
    console.error("Error searching places:", error.message);
    if (error.response) {
      console.error("API Response status:", error.response.status);
      console.error("API Response data:", JSON.stringify(error.response.data));
    }
    throw new Error(error.response?.data?.error?.message || error.message || "Failed to search places");
  }
});
