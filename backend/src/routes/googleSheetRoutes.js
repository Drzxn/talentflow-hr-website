import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];

function getGoogleCredentials() {
  try {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    }

    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON missing in environment variables"
    );
  } catch (error) {
    console.log("GOOGLE AUTH ERROR:", error.message);
    throw error;
  }
}

const credentials = getGoogleCredentials();

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

export const sheets = google.sheets({
  version: "v4",
  auth,
});

export default sheets;