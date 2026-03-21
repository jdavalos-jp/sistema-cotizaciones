const { verifyToken } = require('../modules/auth/auth.service');
const { HttpError } = require('../utils/httpError');

/**
 * Middleware para verificar JWT token
 * Extrae el token del header Authorization: Bearer <token>
 * Si es válido, agrega userId y email a req
 */
function verifyJwtToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'Token no proporcionado');
    }

    const token = authHeader.slice(7); // Quita "Bearer "
    const decoded = verifyToken(token);

    // Agregar datos del token al request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRol = decoded.rol;

    next();
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        ok: false,
        error: err.message,
      });
    }
    next(new HttpError(401, 'Token inválido'));
  }
}

/**
 * Middleware para verificar que el usuario sea admin
 * Debe usarse después de verifyJwtToken
 */
function requireAdmin(req, res, next) {
  if (req.userRol !== 'admin') {
    return res.status(403).json({
      ok: false,
      error: 'Se requieren permisos de administrador',
    });
  }
  next();
}

module.exports = {
  verifyJwtToken,
  requireAdmin,
};
