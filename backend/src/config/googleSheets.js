import { google } from "googleapis";

export function getGoogleSheetsClient() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON is missing in environment variables"
      );
    }

    const credentials = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
      ],
    });

    return google.sheets({
      version: "v4",
      auth,
    });
  } catch (error) {
    console.log("GOOGLE SHEETS CONFIG ERROR:", error);

    throw error;
  }
}