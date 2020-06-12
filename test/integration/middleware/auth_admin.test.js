const request = require('supertest');
const DB = require('../../../core/db');
const Admin = require('../../../app/models/Admin');
const Post_Office = require('../../../app/models/Post_Office');
let server;

describe('auth_admin middleware', () => {
    beforeAll(() => { 
        server = require('../../../index');
        DB.connect();
    })
    afterAll(async () => { 
        server.close();
        await DB.disconnect();
    })
    afterEach(async () => {
        await DB.query('DELETE FROM postal_areas');
    })

    const send_req = (token) => {
        return request(server)
        .post('/postal-areas')
        .set('x-auth-token', token)
        .send({code: '12345', name: 'a'});
    }

    it('should return 401 if no token is provided', async () => {
        const res = await send_req('');

        expect(res.status).toBe(401);
    })

    it('should return 400 if invalid token is provided', async () => {
        const res = await send_req('a');

        expect(res.status).toBe(400);
    })

    it('should return 403 if user is not admin', async () => {
        let token = Post_Office.generate_po_token('12345');
        const res = await send_req(token);

        expect(res.status).toBe(403);
    })

    it('should return 200 if valid token and valid data is provided', async () => {
        let token = Admin.generate_admin_token(1);
        const res = await send_req(token);

        expect(res.status).toBe(200);
    })
})