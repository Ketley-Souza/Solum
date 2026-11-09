import { ForbiddenError, UnauthorizedError } from '../errors.js';
/** RN10 — usar sempre depois de `autenticar`. */
export function autorizar(...perfis) {
    return (req, _res, next) => {
        if (!req.usuario)
            throw new UnauthorizedError();
        if (!perfis.includes(req.usuario.perfil))
            throw new ForbiddenError();
        next();
    };
}
