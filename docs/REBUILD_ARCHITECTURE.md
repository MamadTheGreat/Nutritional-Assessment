# Rebuild architecture

## Decision

- Keep the React/TanStack application and its clinical calculation code.
- Store all clinical records, patients, visits, and library (protocols, formulas, sources) locally on the device (IndexedDB with localStorage mirroring). No login or external account is required.
- Provide direct JSON file export/download and file import so users can save backups to their phone or computer and restore them anytime.
- Send intake text, lab images, and assessment data to the server for Gemini processing without requiring OAuth tokens. Extracted values are shown for review and saved locally only when the visit is saved.
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
