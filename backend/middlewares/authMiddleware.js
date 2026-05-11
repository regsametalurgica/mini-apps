import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_para_desenvolvimento';

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido.' });
  }

  // Se o token vier no formato "Bearer token123"
  const tokenSemBearer = token.split(' ')[1] || token;

  jwt.verify(tokenSemBearer, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Requer permissão de administrador.' });
  }
  next();
};
