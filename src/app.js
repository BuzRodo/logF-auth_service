const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authService = require('./authService');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false
});

function maybeExposeToken(payload) {
  if (process.env.NODE_ENV === 'test') {
    return payload;
  }
  if (!payload || typeof payload !== 'object') {
    return payload;
  }
  const clone = { ...payload };
  delete clone.verificationToken;
  delete clone.resetToken;
  return clone;
}

function authGuard(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = authService.authenticate(token);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = user;
  return next();
}

function rbacGuard({ roles = [], permissions = [] } = {}) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (permissions.length > 0 && !authService.hasPermissions(req.user.role, permissions)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}

app.post('/auth/register', authLimiter, async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(maybeExposeToken(result));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
});

app.post('/auth/verify-email', authLimiter, async (req, res) => {
  try {
    res.json(await authService.verifyEmail(req.body));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
});

app.post('/auth/login', authLimiter, async (req, res) => {
  try {
    res.json(await authService.login(req.body));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
});

app.post('/auth/refresh', authLimiter, async (req, res) => {
  try {
    res.json(await authService.refresh(req.body));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
});

app.post('/auth/logout', authLimiter, async (req, res) => {
  try {
    res.json(await authService.logout(req.body));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
});

app.post('/auth/password/forgot', authLimiter, async (req, res) => {
  try {
    res.json(maybeExposeToken(await authService.requestPasswordReset(req.body)));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
});

app.post('/auth/password/reset', authLimiter, async (req, res) => {
  try {
    res.json(await authService.resetPassword(req.body));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
});

app.get('/auth/audit', authGuard, rbacGuard({ roles: ['ADMIN'], permissions: ['access:audit'] }), (req, res) => {
  res.json({ items: authService.state.auditLogs });
});

module.exports = { app, authGuard, rbacGuard };
