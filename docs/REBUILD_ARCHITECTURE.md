# Rebuild architecture

## Decision

- Keep the React/TanStack application and its clinical calculation code.
- Replace Base44 with one private JSON file in the owner's Google Drive. The file contains patients, their visits, and the dietitian's library (protocols, formulas, and reference notes).
- Use Google OAuth in the browser with the narrow `drive.file` scope. The access token stays in memory and is not written to local storage. Only the Drive file id may be remembered locally so the same file is reused.
- Send intake text, lab images, and assessment data to the server for Gemini processing. The image is not persisted. Extracted values are shown for review and saved only as text when the visit is saved.
- Keep the Gemini API key and model name in the Worker environment. The API key must never be exposed to browser code.
- Keep deterministic clinical calculations in application code. AI text is advisory and reviewable. If Gemini is not configured, the calculated result is still shown.

## Data contract

```json
{
  "schemaVersion": 1,
  "patients": [
    {
      "id": "uuid",
      "full_name": "",
      "file_number": "",
      "age": null,
      "sex": null,
      "father_name": "",
      "birth_date": "",
      "ward_type": "general",
      "last_review_date": "YYYY-MM-DD",
      "next_review_date": "YYYY-MM-DD",
      "visits": []
    }
  ],
  "library": {
    "protocols": [],
    "formulas": [],
    "sources": []
  }
}
```

The file name is `nutrition-assessment.json`. No image bytes, image URL, or image file id belongs in a visit. Built-in protocols, formulas, and sources are written the first time each library list is empty.

Patient intake also supports an AI-generated draft from user-provided text. The draft is shown for review before it is copied into the form; it is not saved until the dietitian saves the visit. The optional “remember me” preference stores only the Google account-selection preference, never an OAuth access token.
