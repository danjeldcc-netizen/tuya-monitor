// netlify/functions/send-to-tuya.js
const crypto = require('crypto');

// Environment variables to be configured in Netlify UI
const {
  TUYA_ACCESS_ID,
  TUYA_ACCESS_SECRET,
  TUYA_DEVICE_ID,
  TUYA_API_REGION = 'eu', // Default to EU, can be overridden
} = process.env;

const BASE_URLS = {
  cn: 'https://openapi.tuyacn.com',
  us: 'https://openapi.tuyaus.com',
  eu: 'https://openapi.tuyaeu.com',
  in: 'https://openapi.tuyain.com',
};

const BASE_URL = BASE_URLS[TUYA_API_REGION] || BASE_URLS.eu;

// Cached token to avoid requesting a new one for every function invocation
let tokenCache = {
  access_token: null,
  expires_at: 0,
};

function calculateSign(stringToSign, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(stringToSign, 'utf8')
    .digest('hex')
    .toUpperCase();
}

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.access_token && now < tokenCache.expires_at) {
    return tokenCache.access_token;
  }

  const method = 'GET';
  const url = '/v1.0/token?grant_type=1';
  const timestamp = now.toString();
  const stringToSign = [TUYA_ACCESS_ID, timestamp].join('');
  const sign = calculateSign(stringToSign, TUYA_ACCESS_SECRET);
  
  const headers = {
    'client_id': TUYA_ACCESS_ID,
    't': timestamp,
    'sign': sign,
    'sign_method': 'HMAC-SHA256',
    'dev_lang': 'en',
  };

  const response = await fetch(`${BASE_URL}${url}`, { method, headers });
  const data = await response.json();

  if (!data.success) {
    throw new Error(`Failed to get Tuya token: ${data.msg}`);
  }

  const result = data.result;
  tokenCache = {
    access_token: result.access_token,
    // Refresh token a bit before it expires (Tuya tokens last 2 hours)
    expires_at: now + (result.expire_time - 60) * 1000,
  };
  return tokenCache.access_token;
}

async function sendCommand(accessToken, powerValue) {
  // IMPORTANT: The 'code' for the command ('power_value' here) must match
  // the Datapoint (DP) ID of your virtual device in the Tuya IoT Platform.
  const body = {
    commands: [
      {
        code: 'power_value',
        value: Math.round(powerValue), // Tuya often expects integer values
      },
    ],
  };

  const method = 'POST';
  const url = `/v1.0/devices/${TUYA_DEVICE_ID}/commands`;
  const timestamp = Date.now().toString();
  const bodyString = JSON.stringify(body);
  const stringToSign = [TUYA_ACCESS_ID, accessToken, timestamp, bodyString].join('');
  const sign = calculateSign(stringToSign, TUYA_ACCESS_SECRET);

  const headers = {
    'client_id': TUYA_ACCESS_ID,
    'access_token': accessToken,
    't': timestamp,
    'sign': sign,
    'sign_method': 'HMAC-SHA256',
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: bodyString,
  });

  const data = await response.json();
  if (!data.success) {
      // Provide a more detailed error message
      const errorMsg = data.msg || 'Unknown error from Tuya API';
      const errorCode = data.code || 'N/A';
      throw new Error(`Tuya API error: ${errorMsg} (Code: ${errorCode})`);
  }
  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!TUYA_ACCESS_ID || !TUYA_ACCESS_SECRET || !TUYA_DEVICE_ID) {
    const errorMsg = 'Required Tuya environment variables are not set in Netlify.';
    console.error(errorMsg);
    return { statusCode: 500, body: JSON.stringify({ message: errorMsg }) };
  }

  try {
    const { power } = JSON.parse(event.body);
    if (typeof power !== 'number') {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid "power" value in request body.' }) };
    }

    const accessToken = await getAccessToken();
    await sendCommand(accessToken, power);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Uspešno poslana moč (${power.toFixed(2)} W) na Tuya.` }),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Error in Tuya function:', errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Napaka pri pošiljanju na Tuya: ${errorMessage}` }),
    };
  }
};