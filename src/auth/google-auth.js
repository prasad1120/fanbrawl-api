const { OAuth2Client } = require('google-auth-library');
const config = require('../config.js');

const GOOGLE_CLIENT_ID = config.googleClientId;
const client = new OAuth2Client(GOOGLE_CLIENT_ID, '', '');

module.exports.getGoogleUser = async (idToken) => {
  const loginTicket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
  const payload = loginTicket.getPayload();
  const audience = payload.aud;
  if (audience !== GOOGLE_CLIENT_ID) {
    throw new Error(`error while authenticating google user: audience mismatch: wanted [${GOOGLE_CLIENT_ID}] but was [${audience}]`);
  }
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    pic: payload.picture,
  };
};
