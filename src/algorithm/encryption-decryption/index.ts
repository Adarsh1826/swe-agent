import crypto from "crypto"

const algorithm = "aes-256-cbc"
const key  = Buffer.from(process.env.ENCRYPTION_KEY!,"utf-8")
// for encrytio
export function encrypt(text: string) {
  const iv = crypto.randomBytes(16); 

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    content: encrypted,
  };
}

// for decrytio
export function decrypt(encryptedText: string, ivHex: string) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, "hex")
  );

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
