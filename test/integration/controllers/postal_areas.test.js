const request = require('supertest');
const DB = require('../../../core/db');
const Admin = require('../../../app/models/Admin');
let server;
let token;

describe('/postal-areas', () => {
    beforeAll(() => { 
        server = require('../../../index');
        DB.connect();
        token = Admin.generate_admin_token(1);
    })
    afterAll(async () => { 
        server.close();
        await DB.disconnect();
    })
    
    const insert_test_data = async (test_pw) => {
        let test_obj1 = {code:'11111', name: 'a'};
        await DB.query('INSERT INTO postal_areas SET ?', test_obj1);
        let test_obj2 = (test_pw) ? {code:'22222', name: 'b', password: test_pw} : {code:'22222', name: 'b'};
        await DB.query('INSERT INTO postal_areas SET ?', test_obj2);
        return [test_obj1, test_obj2];
    }

    describe('GET /', () => {
        afterEach(async () => {
            await DB.query('DELETE FROM postal_areas');
        })

        it('should return all postal areas', async () => {
            // let test_obj1 = {code:'11111', name: 'a'};
            // await DB.query('INSERT INTO postal_areas SET ?', test_obj1);
            // let test_obj2 = {code:'22222', name: 'b'};
            // await DB.query('INSERT INTO postal_areas SET ?', test_obj2);
            let test_objs = await insert_test_data();

            const res = await request(server).get('/postal-areas');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(pa => pa.code === test_objs[0].code)).toBeTruthy();
            expect(res.body.some(pa => pa.code === test_objs[1].code)).toBeTruthy();
        })
    })

    describe('GET /no-account', () => {
        afterEach(async () => {
            await DB.query('DELETE FROM postal_areas');
        })

        it('should return postal areas not having an account', async () => {
            let test_objs = await insert_test_data('abcdef');

            const res = await request(server).get('/postal-areas/no-account');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].code).toBe(test_objs[0].code);
        })
    })

    describe('POST /', () => {
        afterEach(async () => {
            await DB.query('DELETE FROM postal_areas');
        })

        const send_req = (test_obj) => {
            return request(server)
            .post('/postal-areas')
            .set('x-auth-token', token)
            .send(test_obj);
        }

        it('should return 401 if no token provided', async () => {
            let test_obj = {code: '11111', name: 'a'};
            const res = await request(server).post('/postal-areas').send(test_obj);

            expect(res.status).toBe(401);
            expect(res.text).toMatch(/denied/i);
        })

        it('should return 400 for invalid request body', async () => {
            const res = await send_req({a: '12345', name: 'xyz'});
            // const res = await request(server)
            // .post('/postal-areas')
            // .set('x-auth-token', token)
            // .send(test_obj);

            expect(res.status).toBe(400);
        })

        it.each(['1111', 'aaaaa', 'A#12b'])('should return 400 for invalid postal code %s', async (code) => {            
            const res = await send_req({code, name: 'a'});

            expect(res.status).toBe(400);
        })

        it.each(['1', '-a1a', 'A#bcd'])('should return 400 for invalid postal area name %s', async (name) => {            
            const res = await send_req({code: '12345', name});

            expect(res.status).toBe(400);
        })

        // it('should return 400 if two seperate postal areas exist with the given code and name', async () => {
        //     await DB.query('INSERT INTO postal_areas SET ?', {code:'12345', name:'area-x'});
        //     await DB.query('INSERT INTO postal_areas SET ?', {code:'54321', name:'area-y'});

        //     const res = await send_req({code: '12345', name: 'area-y'});

        //     expect(res.status).toBe(400);
        //     expect(res.text).toMatch(/12345/);
        //     expect(res.text).toMatch(/area-y/);

        // })

        // it('should return 400 if postal area already exists', async () => {
        //     await DB.query('INSERT INTO postal_areas SET ?', {code:'12345', name:'area-x'});

        //     const res = await send_req({code: '12345', name: 'area-x'});

        //     expect(res.status).toBe(400);
        //     expect(res.text).toMatch(/12345/);
        //     expect(res.text).toMatch(/area-x/);
        // })

        it('should return 400 if there is a postal area with the given code', async () => {
            await DB.query('INSERT INTO postal_areas SET ?', {code:'12345', name:'area-x'});

            const res = await send_req({code: '12345', name: 'area-y'});

            expect(res.status).toBe(400);
            expect(res.text).toMatch(/12345/);
        })

        // it('should return 400 if there is a postal area with the given name', async () => {
        //     await DB.query('INSERT INTO postal_areas SET ?', {code:'12345', name:'area-x'});

        //     const res = await send_req({code: '54321', name: 'area-x'});

        //     expect(res.status).toBe(400);
        //     expect(res.text).toMatch(/area-x/);
        // })

        it('should insert postal area if valid and unique', async () => {
            let test_obj = {code: '54321', name: 'area-x'};
            const res = await send_req(test_obj);

            expect(res.status).toBe(200);
            expect(res.text).toBe(`${test_obj.name}, ${test_obj.code}`);
        })
    })

    describe('POST /province', () => {
        afterEach(async () => {
            await DB.query('DELETE FROM postal_areas');
        })

        const send_req = (test_obj) => {
            return request(server)
            .post('/postal-areas/province')
            .set('x-auth-token', token)
            .send(test_obj);
        }

        it('should return 401 if no token provided', async () => {
            const res = await request(server).post('/postal-areas/province').send({province: '1'});

            expect(res.status).toBe(401);
            expect(res.text).toMatch(/denied/i);
        })

        it.each(['0', '10', 'a', 'A#12b'])('should return 400 for invalid province code %s', async (province) => {
            const res = await send_req({province});

            expect(res.status).toBe(400);
        })

        it('should return postal areas grouped by first letter for valid province code', async () => {
            await DB.query('INSERT INTO postal_areas SET ?', {code: '12345', name: 'aaa'});
            await DB.query('INSERT INTO postal_areas SET ?', {code: '09876', name: 'bbb', password: 'xyz'});
            await DB.query('INSERT INTO postal_areas SET ?', {code: '54321', name: 'ccc'});

            const res = await send_req({province: '1'});

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('a');
            expect(res.body).toHaveProperty('b');
            expect(Object.keys(res.body).length).toBe(2);
            expect(res.body['a'][0]).toMatchObject({code: '12345', name: 'aaa', hasAcc: '0'});
            expect(res.body['b'][0]).toMatchObject({code: '09876', name: 'bbb', hasAcc: '1'});
        })
    })

    describe('PUT /', () => {
        afterEach(async () => {
            await DB.query('DELETE FROM postal_areas');
        })

        const send_req = (code = '12345', name = 'a', prev_code = '54321') => {
            return request(server)
            .put('/postal-areas')
            .set('x-auth-token', token)
            .send({code, name, prev_code});
        }
        
        it('should return 401 if no token provided', async () => {
            const res = await request(server).put('/postal-areas').send({});

            expect(res.status).toBe(401);
            expect(res.text).toMatch(/denied/i);
        })
        
        it.each(['1111', 'aaaaa', 'A#12b'])('should return 400 for invalid postal code %s', async (code) => {            
            const res = await send_req(code);

            expect(res.status).toBe(400);
        })

        it.each(['1', '-a1a', 'A#bcd'])('should return 400 for invalid postal area name %s', async (name) => {            
            const res = await send_req(undefined, name);

            expect(res.status).toBe(400);
        })

        it.each(['1111', 'aaaaa', 'A#12b'])('should return 400 for invalid previous postal code %s', async (prev_code) => {            
            const res = await send_req(prev_code);

            expect(res.status).toBe(400);
        })

        it('should return 400 if a postal area does not exist by prev_code', async () => {
            const res = await send_req();

            expect(res.status).toBe(400);
            expect(res.text).toMatch(/54321/);
        })

        it('should return 400 when trying to update with same values', async () => {
            await DB.query('INSERT INTO postal_areas SET ?', {code: '54321', name: 'a'});

            const res = await send_req('54321');

            expect(res.status).toBe(400);
            expect(res.text).toMatch(/same/);
        })

        it('should return 400 if new postal code is not unique', async () => {
            await DB.query('INSERT INTO postal_areas SET ?', {code: '54321', name: 'area-x'});
            await DB.query('INSERT INTO postal_areas SET ?', {code: '12345', name: 'b'});

            const res = await send_req();

            expect(res.status).toBe(400);
            expect(res.text).toMatch(/12345/);
        })

        it('should update and return 200 if valid details are provided and new code is unique', async () => {
            await DB.query('INSERT INTO postal_areas SET ?', {code: '54321', name: 'area-x'});

            const res = await send_req();

            expect(res.status).toBe(200);

            let pa_result = await DB.query('SELECT code, name FROM postal_areas WHERE code = 12345');
            expect(pa_result.query_output[0].name).toBe('a');
        })
    })
})