interface TuyaResponse {
  message: string;
}

/**
 * Sends power data to the Tuya Smart API via a secure Netlify serverless function.
 * This function acts as a proxy, keeping API secrets safe on the backend.
 * 
 * @param {number} powerInWatts The power value in Watts to send.
 * @returns {Promise<TuyaResponse>} A promise that resolves with the response message from the backend.
 */
export async function sendPowerToTuya(powerInWatts: number): Promise<TuyaResponse> {
  const endpoint = '/.netlify/functions/send-to-tuya';
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ power: powerInWatts }),
    });

    const result = await response.json();

    if (!response.ok) {
      // The backend provides a user-friendly error message
      throw new Error(result.message || 'Unknown server error');
    }

    return { message: result.message };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'A network error occurred.';
    console.error('Failed to send data to backend function:', errorMessage);
    // Re-throw with a user-friendly message
    throw new Error(`Napaka pri komunikaciji s strežnikom: ${errorMessage}`);
  }
}