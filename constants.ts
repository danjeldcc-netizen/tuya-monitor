// Tuya Device Configuration
export const TUYA_DEVICE_ID = '26ae8a44835099d82fwpge';
export const TUYA_DEVICE_SECRET = '9UC1FIl4tglAqL0J';
export const TUYA_DEVICE_NAME = 'Soncnaelektrarna28c0';

// MQTT Configuration
export const MQTT_HOST = "z561cb05.ala.us-east-1.emqxsl.com";
export const MQTT_PORT = 8084;
export const MQTT_TOPIC = "solar/ac/power";
export const MQTT_USERNAME = "opendtu";
export const MQTT_PASSWORD = "opendtu";

// Power threshold for Tuya
export const TUYA_POWER_THRESHOLD_W = 50; // in Watts

// Fix: Add missing constants for the unused powerService.ts to resolve compile errors.
export const POWER_SOURCE_URL = '';
export const CORS_PROXY_URL = '';