import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from 'node:crypto'

/**
 * Criptografia em repouso (campos sensíveis): AES-256-GCM com IV aleatório por valor.
 * Formato armazenado: `enc:v1:` + base64(iv[12] | tag[16] | ciphertext).
 * Chaves de cifra e de índice cego (HMAC-SHA256) são derivadas via HKDF de ENCRYPTION_KEY.
 */
const PREFIXO = 'enc:v1:'

const chaveMestra = process.env.ENCRYPTION_KEY
if (!chaveMestra) throw new Error('ENCRYPTION_KEY não definida no ambiente')
const bruta = Buffer.from(chaveMestra, 'base64')
if (bruta.length !== 32) throw new Error('ENCRYPTION_KEY deve ter 32 bytes em base64')

const derivar = (info: string) => Buffer.from(hkdfSync('sha256', bruta, 'solum', info, 32))
const chaveCifra = derivar('cifra-campos')
const chaveIndice = derivar('indice-cego')

export const estaCifrado = (valor: string) => valor.startsWith(PREFIXO)

export function cifrar(texto: string): string {
  const iv = randomBytes(12)
  const cifra = createCipheriv('aes-256-gcm', chaveCifra, iv)
  const dados = Buffer.concat([cifra.update(texto, 'utf8'), cifra.final()])
  return PREFIXO + Buffer.concat([iv, cifra.getAuthTag(), dados]).toString('base64')
}

export function decifrar(valor: string): string {
  if (!estaCifrado(valor)) return valor
  const bytes = Buffer.from(valor.slice(PREFIXO.length), 'base64')
  const decifra = createDecipheriv('aes-256-gcm', chaveCifra, bytes.subarray(0, 12))
  decifra.setAuthTag(bytes.subarray(12, 28))
  return Buffer.concat([decifra.update(bytes.subarray(28)), decifra.final()]).toString('utf8')
}

/** Índice cego determinístico: permite unicidade e busca exata sem guardar o valor em claro. */
export const indiceCego = (texto: string) => createHmac('sha256', chaveIndice).update(texto).digest('hex')
