import { todayISO } from "@/lib/reviewDates";

export function buildAssessmentJson({ form, result, protocol, patientId, dietitianName }) {
  const { lab_files: _labFiles, image: _image, mimeType: _mimeType, ...visit } = form;
  return {
    exported_at: new Date().toISOString(),
    patient: {
      id: patientId || null,
      full_name: form.patient_name?.trim() || "",
      file_number: form.file_number || "",
      father_name: form.father_name || "",
      birth_date: form.birth_date || "",
    },
    visit: {
      date: todayISO(),
      dietitian: dietitianName || "",
      protocol: protocol?.name || "",
      ...visit,
      result,
    },
  };
}

export function exportFileName(name = "patient-visit") {
  const safeName = (name || "patient-visit").trim().replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-|-$/g, "");
  return `${safeName || "patient-visit"}-${todayISO()}.json`;
}

export function downloadJsonFile(payload, fileName = exportFileName()) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
