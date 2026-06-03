const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_TTL_MS,
  VERIFICATION_TOKEN_TTL_MS,
  PASSWORD_RESET_TOKEN_TTL_MS,
  BCRYPT_ROUNDS
} = require('./constants');
const { state } = require('./store');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';

function now() {
  return Date.now();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function validatePassword(password) {
  return typeof password === 'string' && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified
  };
}

function addAudit(event, userId, metadata = {}) {
  state.auditLogs.push({ event, userId, metadata, timestamp: new Date().toISOString() });
}

async function register({ email, password }) {
  if (!email || !password || !validatePassword(password)) {
    throw { status: 400, message: 'Invalid registration payload' };
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (state.usersByEmail.has(normalizedEmail)) {
    throw { status: 409, message: 'Email already registered' };
  }

  const id = crypto.randomUUID();
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const user = {
    id,
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    role: 'CAJERO',
    emailVerified: false,
    verificationTokenHash: hashToken(verificationToken),
    verificationTokenExpiresAt: now() + VERIFICATION_TOKEN_TTL_MS,
    passwordResetTokenHash: null,
    passwordResetTokenExpiresAt: null,
    createdAt: new Date().toISOString()
  };

  state.users.set(id, user);
  state.usersByEmail.set(normalizedEmail, id);
  addAudit('user_registered', id);

  return {
    user: sanitizeUser(user),
    verificationToken
  };
}

async function verifyEmail({ token }) {
  if (!token) {
    throw { status: 400, message: 'Token required' };
  }

  const tokenHash = hashToken(token);
  const user = [...state.users.values()].find((candidate) => candidate.verificationTokenHash === tokenHash);

  if (!user || !user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < now()) {
    throw { status: 400, message: 'Invalid or expired token' };
  }

  user.emailVerified = true;
  user.verificationTokenHash = null;
  user.verificationTokenExpiresAt = null;
  addAudit('email_verified', user.id);

  return { ok: true };
}

function issueAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: 'logfood-auth'
  });
}

function issueRefreshToken(userId) {
  const token = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(token);
  const entry = {
    id: crypto.randomUUID(),
    userId,
    tokenHash,
    createdAt: now(),
    expiresAt: now() + REFRESH_TOKEN_TTL_MS,
    revokedAt: null
  };
  state.refreshTokens.set(entry.id, entry);
  return { token, entry };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw { status: 400, message: 'Invalid login payload' };
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const userId = state.usersByEmail.get(normalizedEmail);
  const user = userId ? state.users.get(userId) : null;

  if (!user || !user.emailVerified || !(await bcrypt.compare(password, user.passwordHash))) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const accessToken = issueAccessToken(user);
  const refresh = issueRefreshToken(user.id);
  addAudit('user_login', user.id);

  return {
    accessToken,
    refreshToken: refresh.token,
    user: sanitizeUser(user)
  };
}

function findValidRefreshByRawToken(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  return [...state.refreshTokens.values()].find(
    (entry) => entry.tokenHash === tokenHash && !entry.revokedAt && entry.expiresAt > now()
  );
}

function revokeRefreshToken(entry) {
  entry.revokedAt = now();
}

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw { status: 400, message: 'Refresh token required' };
  }

  const currentEntry = findValidRefreshByRawToken(refreshToken);
  if (!currentEntry) {
    throw { status: 401, message: 'Invalid refresh token' };
  }

  revokeRefreshToken(currentEntry);
  const user = state.users.get(currentEntry.userId);
  if (!user) {
    throw { status: 401, message: 'Invalid refresh token' };
  }

  const accessToken = issueAccessToken(user);
  const rotated = issueRefreshToken(user.id);
  addAudit('token_refreshed', user.id);

  return { accessToken, refreshToken: rotated.token };
}

async function logout({ refreshToken }) {
  if (!refreshToken) {
    return { ok: true };
  }

  const entry = findValidRefreshByRawToken(refreshToken);
  if (entry) {
    revokeRefreshToken(entry);
    addAudit('user_logout', entry.userId);
  }

  return { ok: true };
}

async function requestPasswordReset({ email }) {
  if (!email) {
    return { ok: true };
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const userId = state.usersByEmail.get(normalizedEmail);
  if (!userId) {
    return { ok: true };
  }

  const user = state.users.get(userId);
  const rawToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetTokenHash = hashToken(rawToken);
  user.passwordResetTokenExpiresAt = now() + PASSWORD_RESET_TOKEN_TTL_MS;
  addAudit('password_reset_requested', user.id);

  return { ok: true, resetToken: rawToken };
}

async function resetPassword({ token, newPassword }) {
  if (!token || !validatePassword(newPassword)) {
    throw { status: 400, message: 'Invalid reset payload' };
  }

  const tokenHash = hashToken(token);
  const user = [...state.users.values()].find((candidate) => candidate.passwordResetTokenHash === tokenHash);

  if (!user || !user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < now()) {
    throw { status: 400, message: 'Invalid or expired token' };
  }

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpiresAt = null;
  addAudit('password_reset_completed', user.id);

  return { ok: true };
}

function authenticate(accessToken) {
  try {
    const payload = jwt.verify(accessToken, JWT_SECRET, { issuer: 'logfood-auth' });
    const user = state.users.get(payload.sub);
    if (!user) {
      return null;
    }
    return { id: user.id, role: user.role, email: user.email };
  } catch {
    return null;
  }
}

function hasPermissions(role, requiredPermissions = []) {
  const roleData = state.roles[role];
  if (!roleData) {
    return false;
  }
  return requiredPermissions.every((permission) => roleData.permissions.includes(permission));
}

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  authenticate,
  hasPermissions,
  state
};
