export const EMAIL_SETTINGS_ID = "email";

const WEB3FORMS_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeWeb3FormsKey(value) {
  return String(value ?? "").trim();
}

export function isValidWeb3FormsKey(value) {
  return WEB3FORMS_KEY_PATTERN.test(value);
}

export async function getEmailSettings(db) {
  return db.collection("settings").findOne({ _id: EMAIL_SETTINGS_ID });
}
