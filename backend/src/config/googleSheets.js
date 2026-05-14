import { google } from "googleapis";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

/* ==============================
   GOOGLE AUTH
============================== */

function getGoogleAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  /* Render Environment Variable JSON */
  if (json && !json.includes("PASTE_")) {
    try {
      const credentials = JSON.parse(json);

      return new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
      });
    } catch {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON is invalid JSON. Paste real Google service account JSON."
      );
    }
  }

  /* Local credentials.json fallback */
  const localFile = "./credentials.json";

  if (fs.existsSync(localFile)) {
    return new google.auth.GoogleAuth({
      keyFile: localFile,
      scopes: SCOPES,
    });
  }

  /* Render secret file fallback */
  const renderSecret = "/etc/secrets/service-account.json";

  if (fs.existsSync(renderSecret)) {
    return new google.auth.GoogleAuth({
      keyFile: renderSecret,
      scopes: SCOPES,
    });
  }

  throw new Error(
    "Google credentials missing. Add GOOGLE_SERVICE_ACCOUNT_JSON or credentials.json"
  );
}

/* ==============================
   SHEETS CLIENT
============================== */

const auth = getGoogleAuth();

const authClient = await auth.getClient();

const sheets = google.sheets({
  version: "v4",
  auth: authClient,
});

export default sheets;