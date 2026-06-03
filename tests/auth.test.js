const request = require('supertest');
const { app } = require('../src/app');
const { resetState, state } = require('../src/store');

describe('auth security flows', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    resetState();
  });

  test('requires email verification before login', async () => {
    const register = await request(app).post('/auth/register').send({
      email: 'user@example.com',
      password: 'Secure123'
    });
    expect(register.statusCode).toBe(201);

    const loginBeforeVerification = await request(app).post('/auth/login').send({
      email: 'user@example.com',
      password: 'Secure123'
    });
    expect(loginBeforeVerification.statusCode).toBe(401);

    const verify = await request(app).post('/auth/verify-email').send({
      token: register.body.verificationToken
    });
    expect(verify.statusCode).toBe(200);

    const login = await request(app).post('/auth/login').send({
      email: 'user@example.com',
      password: 'Secure123'
    });
    expect(login.statusCode).toBe(200);
    expect(login.body.accessToken).toBeDefined();
    expect(login.body.refreshToken).toBeDefined();
  });

  test('rotates refresh token and invalidates previous token', async () => {
    const register = await request(app).post('/auth/register').send({
      email: 'rotate@example.com',
      password: 'Secure123'
    });
    await request(app).post('/auth/verify-email').send({ token: register.body.verificationToken });
    const login = await request(app).post('/auth/login').send({
      email: 'rotate@example.com',
      password: 'Secure123'
    });

    const refresh = await request(app).post('/auth/refresh').send({
      refreshToken: login.body.refreshToken
    });
    expect(refresh.statusCode).toBe(200);

    const replay = await request(app).post('/auth/refresh').send({
      refreshToken: login.body.refreshToken
    });
    expect(replay.statusCode).toBe(401);
  });

  test('enforces admin RBAC for audit access', async () => {
    const register = await request(app).post('/auth/register').send({
      email: 'admin@example.com',
      password: 'Secure123'
    });
    await request(app).post('/auth/verify-email').send({ token: register.body.verificationToken });

    const userId = state.usersByEmail.get('admin@example.com');
    state.users.get(userId).role = 'ADMIN';

    const login = await request(app).post('/auth/login').send({
      email: 'admin@example.com',
      password: 'Secure123'
    });

    const audit = await request(app)
      .get('/auth/audit')
      .set('Authorization', 'Bearer ' + login.body.accessToken);

    expect(audit.statusCode).toBe(200);
    expect(Array.isArray(audit.body.items)).toBe(true);
  });
});
