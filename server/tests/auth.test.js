const request = require('supertest');
const app = require('../app'); // assuming app.js exports the express instance correctly
const mongoose = require('mongoose');

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

describe('Auth API testing', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should fail registration with missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test user',
                // missing email and password
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('success', false);
    });

    it('should successfully register a test user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'testuser_jest@intellihire.ai',
                password: 'Password123!',
                role: 'candidate'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.headers['set-cookie']).toBeDefined(); // Cookie validation check
        expect(res.body.data.user).toHaveProperty('email', 'testuser_jest@intellihire.ai');
    });

    it('should successfully login the newly registered user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser_jest@intellihire.ai',
                password: 'Password123!',
            });
        expect(res.statusCode).toEqual(200);
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail login with incorrect password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser_jest@intellihire.ai',
                password: 'wrongpassword',
            });
        expect(res.statusCode).toEqual(401);
    });
});
