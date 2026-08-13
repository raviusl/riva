# RSVP → Google Sheets Setup Guide

This guide connects the wedding website RSVP form to a Google Sheet using a Google Apps Script Web App.

## Form fields sent to Google Sheets

| Sheet column     | Form field    | JSON key       |
|------------------|---------------|----------------|
| Timestamp        | auto-generated | `timestamp`   |
| Full Name        | Full Name     | `fullName`     |
| Phone Number     | Phone Number  | `phoneNumber`  |
| Email            | Email         | `email`        |
| Guests           | Guests        | `guests`       |
| Blessing         | Blessing...   | `blessing`     |

---

## A. Create the Google Sheet

1. Open [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. Name it something clear, for example: `Samuel & Jun Yu RSVP`.
3. In **Sheet1** (or rename it to `RSVP`), add these headers in row 1:

```text
Timestamp | Full Name | Phone Number | Email | Guests | Blessing
```

4. Keep this sheet open — you will bind the Apps Script to it.

---

## B. Create the Google Apps Script

1. In the Google Sheet, go to **Extensions → Apps Script**.
2. Delete any placeholder code in `Code.gs`.
3. Paste the exact script from section C below.
4. Click the disk icon / **Save**, and name the project e.g. `Wedding RSVP Web App`.

---

## C. Exact Apps Script code required

Paste this into `Code.gs`:

```javascript
/**
 * Samuel & Jun Yu — RSVP Web App
 * Receives JSON from the wedding website and appends one row per submission.
 */

var SHEET_NAME = "RSVP"; // change if your tab name is different

function doPost(e) {
  try {
    var sheet = getRsvpSheet_();
    var data = parsePayload_(e);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.fullName || "",
      data.phoneNumber || "",
      data.email || "",
      data.guests || "",
      data.blessing || "",
    ]);

    return jsonResponse_({ result: "success" });
  } catch (error) {
    return jsonResponse_({
      result: "error",
      error: String(error && error.message ? error.message : error),
    });
  }
}

function doGet() {
  return jsonResponse_({
    result: "ok",
    message: "RSVP endpoint is live. Use POST from the wedding website.",
  });
}

function getRsvpSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Full Name",
      "Phone Number",
      "Email",
      "Guests",
      "Blessing",
    ]);
  }

  return sheet;
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing request body");
  }

  var parsed = JSON.parse(e.postData.contents);

  return {
    timestamp: parsed.timestamp,
    fullName: parsed.fullName,
    phoneNumber: parsed.phoneNumber,
    email: parsed.email,
    guests: parsed.guests,
    blessing: parsed.blessing,
  };
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

If your tab is still named `Sheet1`, either:
- rename the tab to `RSVP`, or
- change `var SHEET_NAME = "RSVP";` to `var SHEET_NAME = "Sheet1";`

---

## D. Deploy the Apps Script as a Web App

1. In Apps Script, click **Deploy → New deployment**.
2. Click the gear icon next to **Select type** and choose **Web app**.
3. Configure:
   - **Description:** `Wedding RSVP endpoint`
   - **Execute as:** `Me` (your Google account)
   - **Who has access:** `Anyone` (see section E)
4. Click **Deploy**.
5. Authorize the app when prompted (Review permissions → allow access to the spreadsheet).
6. Copy the **Web app URL**. It looks like:

```text
https://script.google.com/macros/s/XXXXXXXX/exec
```

Use the `/exec` URL (not `/dev`).

---

## E. Which access permission to select

Use:

- **Execute as:** `Me`
- **Who has access:** `Anyone`

This is required so the public wedding website can submit RSVPs without Google login.

This does **not** expose your Google password. It only allows POSTs to this script endpoint. Do not put service-account keys or OAuth client secrets in the website.

---

## F. Put `NEXT_PUBLIC_RSVP_GOOGLE_SHEETS_URL` in Vercel

1. Open your project in [Vercel](https://vercel.com).
2. Go to **Settings → Environment Variables**.
3. Add:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_RSVP_GOOGLE_SHEETS_URL` | `https://script.google.com/macros/s/XXXXXXXX/exec` | Production (and Preview if you want) |

4. Save.
5. **Redeploy** the project (required because `NEXT_PUBLIC_` variables are baked in at build time).

### Local testing

Create or update `.env.local` (do not commit it):

```bash
NEXT_PUBLIC_RSVP_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

Then restart `pnpm dev`.

---

## G. Test RSVP from the production website

1. Confirm Vercel finished deploying after the env var was added.
2. Open the production wedding site.
3. Scroll to **RSVP**.
4. Fill in:
   - Full Name
   - Phone Number
   - Email
   - Guests (choose 1 / 2 / 3, not the placeholder)
   - Blessing (optional)
5. Click **Submit RSVP**.
6. You should see: `Thank you! Your RSVP has been received.`

If you see an error message, check:
- the Web App URL is the `/exec` deployment URL
- access is set to **Anyone**
- the sheet tab name matches `SHEET_NAME`
- Vercel was redeployed after adding the env var

---

## H. Verify the submission in Google Sheets

1. Open your RSVP Google Sheet.
2. Confirm a new row was appended under the headers.
3. Check columns:
   - Timestamp
   - Full Name
   - Phone Number
   - Email
   - Guests
   - Blessing
4. Submit a second test RSVP and confirm a second row appears.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| “RSVP is not configured yet” | Env var missing or site not redeployed |
| Success UI but no sheet row | Wrong sheet tab name, or old deployment URL |
| Network / CORS failure | Access not set to **Anyone**, or using `/dev` URL |
| Permission popup in Apps Script | Re-authorize after changing code, then **Deploy → Manage deployments → Edit → New version** |

After any Apps Script code change, create a **New version** deployment so production uses the updated script.
