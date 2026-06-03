const INITIAL_ROLES = {
  ADMIN: ['access:audit', 'manage:users', 'manage:roles'],
  GERENTE: ['access:audit'],
  ENCARGADO: [],
  ALMACEN: [],
  COCINA: [],
  CAJERO: []
};

module.exports = {
  INITIAL_ROLES,
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  VERIFICATION_TOKEN_TTL_MS: 24 * 60 * 60 * 1000,
  PASSWORD_RESET_TOKEN_TTL_MS: 15 * 60 * 1000,
  BCRYPT_ROUNDS: 12
};
