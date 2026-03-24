// backend/__tests__/auth.test.ts

import request from 'supertest';
import app from '../src/index';

describe('Authentication Controller Tests', () => {
  describe('POST /api/auth/send-otp', () => {
    it('should send OTP successfully', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: '+919876543210' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('phone', '+919876543210');
      expect(response.body.data).toHaveProperty('devOtp');
    });

    it('should reject invalid phone format', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('phone');
    });

    it('should rate limit after 3 requests', async () => {
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/send-otp')
          .send({ phone: '+919876543210' });
      }

      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: '+919876543210' });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Too many requests');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should verify OTP and return tokens', async () => {
      // First send OTP
      await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: '+919876543210' });

      // Then verify
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '123456',
          name: 'John Doe',
          role: 'customer'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.name).toBe('John Doe');
      expect(response.body.data.user.role).toBe('customer');
    });

    it('should reject invalid OTP', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '000000',
          name: 'John Doe',
          role: 'customer'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired OTP');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return new access token', async () => {
      // First get tokens
      const authResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '123456',
          name: 'John Doe',
          role: 'customer'
        });

      const refreshToken = authResponse.body.data.refreshToken;

      // Then refresh
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid_token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      // Get token
      const authResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '123456',
          name: 'John Doe',
          role: 'customer'
        });

      const token = authResponse.body.data.accessToken;

      // Get profile
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('phone');
      expect(response.body.data.phone).toBe('+919876543210');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Authorization');
    });
  });
});
