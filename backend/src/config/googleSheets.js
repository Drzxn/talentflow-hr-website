// import { google } from "googleapis";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const auth = new google.auth.GoogleAuth({
//   keyFile: path.join(__dirname, "../../credentials.json"),
//   scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
// });

// const authClient = await auth.getClient();

// const sheets = google.sheets({
//   version: "v4",
//   auth: authClient,
// });

// export default sheets;

import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

export default sheets;