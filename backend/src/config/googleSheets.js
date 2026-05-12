import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];

function getGoogleCredentials() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON missing in environment variables"
    );
  }

  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  );

  credentials.private_key =
    credentials.private_key.replace(/\\n/g, "\n");

  return credentials;
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