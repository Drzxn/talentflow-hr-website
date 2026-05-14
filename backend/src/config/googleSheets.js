import { google } from "googleapis";
import fs from "fs";
import path from "path";
import process from "process";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

function cleanPrivateKey(credentials) {
  if (credentials?.private_key) {
    credentials.private_key = credentials.private_key
      .replace(/\\n/g, "\n")
      .replace(/\r/g, "");
  }

  return credentials;
}

function getGoogleAuth() {
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64?.trim();
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  const envFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE?.trim();

  if (base64 && base64.startsWith("ey")) {
    const jsonString = Buffer.from(base64, "base64").toString("utf8");
    const credentials = cleanPrivateKey(JSON.parse(jsonString));

    return new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  }

  if (rawJson && rawJson.startsWith("{")) {
    const credentials = cleanPrivateKey(JSON.parse(rawJson));

    return new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  }

  const possibleFiles = [
    envFile,
    "./service-account.json",
    path.join(process.cwd(), "service-account.json"),
    path.join(process.cwd(), "backend", "service-account.json"),
    path.join(process.cwd(), "src", "service-account.json"),
    "/etc/secrets/service-account.json",
  ].filter(Boolean);

  for (const filePath of possibleFiles) {
    if (fs.existsSync(filePath)) {
      return new google.auth.GoogleAuth({
        keyFile: filePath,
        scopes: SCOPES,
      });
    }
  }

  throw new Error(
    "Google credentials missing. Use GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json locally. Do not set GOOGLE_SERVICE_ACCOUNT_JSON=service-account.json."
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

export default getSheetsClient;