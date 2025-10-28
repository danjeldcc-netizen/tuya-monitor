import { POWER_SOURCE_URL, CORS_PROXY_URL } from '../constants';

/**
 * Fetches the raw HTML from the power plant monitoring page.
 * It uses a CORS proxy if one is configured.
 * @returns {Promise<string>} The HTML content of the page.
 */
async function fetchPowerPageHtml(): Promise<string> {
  const url = `${CORS_PROXY_URL}${POWER_SOURCE_URL}`;
  const response = await fetch(url, {
      headers: {
        // Some proxies require this header
        'X-Requested-With': 'XMLHttpRequest'
      }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch power data. Status: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

/**
 * Parses the power value from the fetched HTML content.
 * @param {string} html The HTML content of the page.
 * @returns {string} The parsed power value (e.g., "5.12 kW").
 */
function parsePowerFromHtml(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const powerElement = doc.getElementById('power');

    if (!powerElement || !powerElement.textContent) {
      throw new Error("Could not find power element with id='power' in the fetched HTML.");
    }
    
    // Cleanup text content, removing extra spaces.
    const powerValue = powerElement.textContent.trim();
    if (!powerValue) {
        throw new Error("Power element was found but it is empty.");
    }

    return powerValue;
  } catch (error) {
    console.error("HTML Parsing Error:", error);
    throw new Error("Failed to parse power value from HTML content.");
  }
}

/**
 * Fetches and parses the current power from the source website.
 * @returns {Promise<string>} A promise that resolves to the current power value string.
 */
export async function fetchPower(): Promise<string> {
  const html = await fetchPowerPageHtml();
  const power = parsePowerFromHtml(html);
  return power;
}