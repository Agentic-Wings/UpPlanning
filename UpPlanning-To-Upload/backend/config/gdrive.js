const { google } = require('googleapis');

let drive = null;

try {
  const clientId = process.env.GDRIVE_CLIENT_ID;
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GDRIVE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground' // Default redirect URI for playground
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    drive = google.drive({ version: 'v3', auth: oauth2Client });
    console.log('Google Drive API initialized successfully with OAuth2.');
  } else {
    console.warn('[WARNING] Google Drive OAuth2 credentials not fully provided in .env. File uploads will fail.');
  }
} catch (error) {
  console.error('[ERROR] Failed to initialize Google Drive API:', error.message);
}

module.exports = { drive };
