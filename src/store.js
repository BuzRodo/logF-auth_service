const { INITIAL_ROLES } = require('./constants');

const state = {
  users: new Map(),
  usersByEmail: new Map(),
  refreshTokens: new Map(),
  roles: Object.fromEntries(
    Object.entries(INITIAL_ROLES).map(([name, permissions]) => [name, { name, permissions: [...permissions] }])
  ),
  permissions: new Set(Object.values(INITIAL_ROLES).flat()),
  auditLogs: []
};

function resetState() {
  state.users.clear();
  state.usersByEmail.clear();
  state.refreshTokens.clear();
  state.auditLogs.length = 0;
}

module.exports = { state, resetState };
