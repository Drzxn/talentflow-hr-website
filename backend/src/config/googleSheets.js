import { google } from "googleapis";
import fs from "fs";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];

/* =========================================
   PARSE GOOGLE JSON
========================================= */

function parseGoogleCredentials() {
  try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    if (!raw) {
      return null;
    }

    let cleaned = raw.trim();

    /* Remove wrapping quotes */
    if (
      (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
      (cleaned.startsWith('"') && cleaned.endsWith('"'))
    ) {
      cleaned = cleaned.slice(1, -1);
    }

    const credentials = JSON.parse(cleaned);

    /* IMPORTANT FIX */
    credentials.private_key = credentials.private_key
      .replace(/\\n/g, "\n")
      .replace(/\r/g, "");

    return credentials;
  } catch (error) {
    console.error("GOOGLE JSON ERROR:", error);

    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is invalid JSON"
    );
  }
}

/* =========================================
   GOOGLE AUTH
========================================= */

function getGoogleAuth() {
  /* ENV JSON */

  const credentials = parseGoogleCredentials();

  if (credentials) {
    return new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  }

  /* LOCAL FILE */

  if (fs.existsSync("./credentials.json")) {
    return new google.auth.GoogleAuth({
      keyFile: "./credentials.json",
      scopes: SCOPES,
    });
  }

  /* RENDER SECRET FILE */

  if (fs.existsSync("/etc/secrets/service-account.json")) {
    return new google.auth.GoogleAuth({
      keyFile: "/etc/secrets/service-account.json",
      scopes: SCOPES,
    });
  }

  throw new Error(
    "Google credentials missing"
  );
}

export async function getSheetsClient() {
  const auth = getGoogleAuth();

  const client = await auth.getClient();

  return google.sheets({
    version: "v4",
    auth: client,
  });
}