# Google Sheets Enquiry Integration

Customer enquiries are sent from the enquiry form to a **Google Apps Script Web
App**, which appends each row to a **Google Sheet** connected to the script.

```
Customer → /enquire form → browser validation → POST /api/enquiries (Next.js proxy)
        → Google Apps Script Web App (/exec) → Google Sheets
```

The Next.js app **no longer stores enquiries in the database**. The database
keeps site content, rooms, offers, gallery and admin users (see `DATABASE.md`).

---

## 1. Environment configuration

The endpoint is read **server-side** in `lib/google-sheets.ts`:

| Variable | Purpose | Example |
| --- | --- | --- |
| `GOOGLE_APPS_SCRIPT_URL` | Apps Script Web App URL (server-only; preferred) | `https://script.google.com/macros/s/.../exec` |
| `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL` | Fallback accepted for compatibility | same |

If `GOOGLE_APPS_SCRIPT_URL` is set it wins. Both are **not secrets** — the URL is
meant to be public — but keeping it server-side (`GOOGLE_APPS_SCRIPT_URL`) means
it is never bundled into client JavaScript. The repository ships with Vela's
default deployment id so the app runs without extra configuration.

> ⚠️ **Access requirement.** The deployment must be published as a Web App with
> **"Who has access: Anyone"**. At the time of writing, the provided endpoint
> redirects to `accounts.google.com` sign-in, which confirms it is **not** yet
> shared as Anyone. Until that is changed, submissions cannot succeed.

---

## 2. Request format

The proxy sends a `POST` with `Content-Type: application/json`. The Apps Script
reads it from `e.postData.contents` and `JSON.parse`s it.

### Example payload

```json
{
  "enquiryType": "STAY",
  "customerName": "Rahul Sharma",
  "mobileNumber": "9876543210",
  "email": "rahul@example.com",
  "checkInDate": "2026-11-20",
  "checkOutDate": "2026-11-22",
  "adults": 2,
  "children": 0,
  "roomTypeId": "clxxxxxxxx",
  "roomType": "Deluxe Room",
  "numberOfRooms": 1,
  "purposeOfStay": "Leisure",
  "specialRequest": "Early check-in if possible",
  "preferredContact": "Phone call",
  "source": "Website",
  "companyName": "",
  "eventType": "Wedding",
  "expectedGuests": 150,
  "approximateBudget": "",
  "preferredCallTime": "",
  "reference": "ENQ-20261009-A1B2",
  "submittedAt": "2026-10-09T16:20:27.000Z"
}
```

Field notes:

- Property names mirror the enquiry form field names wherever possible.
- Enum fields are sent as **human-readable labels** (`purposeOfStay: "Leisure"`,
  `eventType: "Wedding"`, `preferredContact: "Phone call"`) because the target is
  a spreadsheet read by people.
- `roomType` is the resolved room-type display name; `roomTypeId` is the internal
  record id (empty string when unknown/unset).
- `reference` is a server-generated display id (e.g. `ENQ-20261009-A1B2`). If the
  script returns its own `enquiryId`/`reference`, the website shows that instead.
- `submittedAt` is the ISO-8601 submission timestamp.
- `source` is always `"Website"`.

There is intentionally **no consent field** — the current form does not collect
consent, and the integration must not invent mandatory fields.

---

## 3. Suggested Google Sheet columns

| # | Column | Payload field | Notes |
| --- | --- | --- | --- |
| 1 | Reference | `reference` | Display id shown to the customer |
| 2 | Submitted At | `submittedAt` | ISO-8601 date-time |
| 3 | Customer Name | `customerName` | |
| 4 | Mobile Number | `mobileNumber` | |
| 5 | Email | `email` | |
| 6 | Enquiry Type | `enquiryType` | STAY / EVENT / GENERAL |
| 7 | Check-in Date | `checkInDate` | blank for GENERAL |
| 8 | Check-out Date | `checkOutDate` | blank for GENERAL |
| 9 | Adults | `adults` | |
| 10 | Children | `children` | |
| 11 | Room Type | `roomType` | resolved name |
| 12 | No. of Rooms | `numberOfRooms` | |
| 13 | Purpose of Stay | `purposeOfStay` | label |
| 14 | Event Type | `eventType` | label, EVENT only |
| 15 | Expected Guests | `expectedGuests` | EVENT only |
| 16 | Preferred Contact | `preferredContact` | label |
| 17 | Special Request | `specialRequest` | |
| 18 | Budget | `approximateBudget` | optional |
| 19 | Company | `companyName` | optional |
| 20 | Preferred Call Time | `preferredCallTime` | optional |
| 21 | Enquiry Source | `source` | always "Website" |

---

## 4. Response contract

The website only reports success when the response **confirms the save**. The
following shapes are accepted:

| Shape | Example |
| --- | --- |
| `{ "ok": true }` | `{"ok":true}` |
| `{ "success": true }` | `{"success":true}` |
| `{ "status": "success" \| "ok" \| "created" \| "saved" ... }` | `{"status":"success"}` |
| `{ "result": "success" ... }` | any success token under `result` |
| JSON **with an id field** | `{"enquiryId":"ENQ-...","enquiryId":...}` |
| Plain text success token | `Success`, `OK`, `Saved`, `Done` |

Anything else is treated as **failed** (never as a silent success):

- non-2xx HTTP status
- explicit failure: `{ok:false}`, `{success:false}`, `{status:"error"}`, `{error:"..."}`
- empty body
- HTML (e.g. a Google sign-in page) or any unrecognised JSON/plain text

### Recommended Apps Script response

```js
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
// success:
json({ ok: true, enquiryId: data.reference });
// failure:
json({ ok: false, error: "Reason" });
```

---

## 5. Reference Apps Script (`doPost`)

Paste into the Apps Script project bound to the Google Sheet:

```js
function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: "Invalid JSON payload" });
  }

  // Required for GDPR/privacy hygiene — never log full data.
  var message =
    "Vela by Svasti enquiry " + (data.reference || "?") + " from " + (data.customerName || "");

  // Verify the caller so the public endpoint cannot be flooded/spoofed freely.
  // A shared secret header is one option; see docs section 6 for alternatives.
  if (data.source !== "Website") {
    return json({ ok: false, error: "Invalid source" });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Enquiries");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Enquiries");
    sheet.appendRow([
      "Reference", "Submitted At", "Customer Name", "Mobile Number", "Email",
      "Enquiry Type", "Check-in Date", "Check-out Date", "Adults", "Children",
      "Room Type", "No. of Rooms", "Purpose of Stay", "Event Type", "Expected Guests",
      "Preferred Contact", "Special Request", "Budget", "Company",
      "Preferred Call Time", "Enquiry Source",
    ]);
  }

  sheet.appendRow([
    data.reference || Date.now(),
    data.submittedAt || new Date().toISOString(),
    data.customerName, data.mobileNumber, data.email,
    data.enquiryType, data.checkInDate, data.checkOutDate,
    data.adults, data.children, data.roomType, data.numberOfRooms,
    data.purposeOfStay, data.eventType, data.expectedGuests,
    data.preferredContact, data.specialRequest, data.approximateBudget,
    data.companyName, data.preferredCallTime, data.source,
  ]);

  return json({ ok: true, enquiryId: data.reference });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

If you deploy a script that behaves differently, the response parser in
`lib/enquiry-payload.ts` (`interpretSheetResponse`) is the single place to adjust.

---

## 6. Security & spam notes

- **Validation** happens client-side (browser) **and** server-side in
  `lib/validate.ts` (zod): required fields, mobile (10-digit Indian format),
  email format, date sanity and check-out-after-check-in, length caps and the
  `website` honeypot.
- **Rate limiting** (`lib/rate-limit.ts`) caps submissions per client IP
  (`RATE_LIMITS.enquirySubmit`, 5 per 10 minutes) and the proxy uses the same
  CSRF header check as the admin panel.
- **Double-submit** is blocked client-side by a synchronous ref guard plus the
  disabled loading state.
- **Frontend-only validation is not the boundary.** Anyone can POST JSON to the
  Apps Script `/exec` URL directly. The Apps Script should add its own guard(s):
  - a shared secret header sent by the proxy that the public form never sees
    (the script checks `e.parameter`... note: Apps Script receives POST headers
    via `UrlFetchApp`-style calls; for browser calls this needs a `text/plain`
    simple request — see below), or
  - a honeypot/second-pass verification, or
  - a turnover/venue-key check.
  Changing `go/script` to require a secret means updating the header sent in
  `lib/google-sheets.ts` — this is a documented **assumption**, not yet tested.
- **No service-account keys or Google credentials** are ever sent to the
  browser or stored in the repo. The script runs as its owner ("Execute as:
  Me") and the website only ever talks to the public endpoint.

---

## 7. Known blocker / assumptions (NOT fully verified)

1. **Endpoint access**: the provided `/exec` URL currently 302-redirects to
   Google sign-in. Live submissions cannot be confirmed until the Apps Script
   deployment is set to **Anyone**. Please do this and re-test (section 8).
2. **Payload contract**: the script's exact expected property names are
   unknown, so this document defines the contract. If your deployed script
   already expects different names/order, update `buildEnquiryPayload` in
   `lib/enquiry-payload.ts`.
3. **Duplicate detection**: the previous database had similarity/duplicate
   detection. That is gone — the new flow relies on client + IP + rate limits
   and the script's own logic. The success page still shows a reference.
4. **Consent**: not collected (form has no consent checkbox by design).
5. **Browser CORS**: apps-script `/exec` does not send CORS headers, so the
   browser cannot call it directly. This is why the Next.js server proxies the
   request — do not "fix" CORS by using `mode: no-cors` in the frontend, since
   that can never confirm success.

---

## 8. Deploy & verify

1. In Apps Script: set **Who has access → Anyone**, copy the `/exec` URL into
   `GOOGLE_APPS_SCRIPT_URL` (or keep the default).
2. `npm run typecheck && npm run lint && npm run build`.
3. Start the site, submit the `/enquire` form with real values.
4. Success page appears **only** if the script returned a success marker.
5. Open the Google Sheet — the row appears under the mapped columns.
6. Failure tests: stop the script / use an invalid URL → the form shows a clear
   error and keeps the entered values.