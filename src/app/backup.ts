import { parseAppState, type AppState } from "./storage";

interface EncryptedBackup {
  format: "meter-clarity-encrypted-backup";
  version: 1;
  createdAt: string;
  kdf: { name: "PBKDF2"; hash: "SHA-256"; iterations: 310000; salt: string };
  cipher: { name: "AES-GCM"; iv: string; data: string };
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  if (passphrase.length < 8) throw new Error("備份密碼至少需要 8 個字元");
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", iterations: 310_000, salt },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptBackup(state: AppState, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(state));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  const backup: EncryptedBackup = {
    format: "meter-clarity-encrypted-backup",
    version: 1,
    createdAt: new Date().toISOString(),
    kdf: { name: "PBKDF2", hash: "SHA-256", iterations: 310000, salt: toBase64(salt) },
    cipher: { name: "AES-GCM", iv: toBase64(iv), data: toBase64(new Uint8Array(ciphertext)) }
  };
  return JSON.stringify(backup, null, 2);
}

export async function decryptBackup(serialized: string, passphrase: string): Promise<AppState> {
  const parsed = JSON.parse(serialized) as Partial<EncryptedBackup>;
  if (
    parsed.format !== "meter-clarity-encrypted-backup" ||
    parsed.version !== 1 ||
    !parsed.kdf?.salt ||
    !parsed.cipher?.iv ||
    !parsed.cipher?.data
  ) {
    throw new Error("不是 MeterClarity 加密備份");
  }
  const key = await deriveKey(passphrase, fromBase64(parsed.kdf.salt));
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(parsed.cipher.iv) },
      key,
      fromBase64(parsed.cipher.data)
    );
  } catch {
    throw new Error("密碼錯誤或備份檔已損壞");
  }
  return parseAppState(JSON.parse(new TextDecoder().decode(plaintext)));
}
