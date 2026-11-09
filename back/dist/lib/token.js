import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PerfilUsuario } from '../generated/prisma/enums.js';
function obterSegredo() {
    const segredo = process.env.JWT_SECRET;
    if (!segredo)
        throw new Error('JWT_SECRET não definida no ambiente');
    return segredo;
}
const SEGREDO = obterSegredo();
const ALGORITMO = 'HS256';
const payloadSchema = z.object({
    sub: z.uuid(),
    perfil: z.enum(PerfilUsuario),
    email: z.email(),
});
export function gerarToken(payload) {
    return jwt.sign({ perfil: payload.perfil, email: payload.email }, SEGREDO, {
        subject: payload.id,
        algorithm: ALGORITMO,
        expiresIn: '1d',
    });
}
/** Lança erro se o token for inválido, expirado ou com payload fora do formato. */
export function verificarToken(token) {
    const decodificado = jwt.verify(token, SEGREDO, { algorithms: [ALGORITMO] });
    const { sub, perfil, email } = payloadSchema.parse(decodificado);
    return { id: sub, perfil, email };
}
