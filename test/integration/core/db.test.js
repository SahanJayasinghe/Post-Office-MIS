const DB = require('../../../core/db');
// DB.handleConnection();

describe('query', () => {
    let table = 'postal_areas';

    beforeAll(() => { DB.connect(); })
    afterAll( async () => { await DB.disconnect(); })
    afterEach( async () => {
        await DB.query(`DELETE FROM postal_areas`); 
    })

    it('should insert a record to the postal_areas table', async () => {
        let test_obj = { code: '11111', name: 'a'};
        let result = await DB.query(`INSERT INTO ${table} SET ?`, test_obj);
        //console.log(result);
        expect(result.query_output).toBeDefined();
        let {affectedRows, serverStatus} = result.query_output;
        expect(affectedRows).toBe(1);
        expect(serverStatus).toBe(2);

        let pa_result = await DB.query(`SELECT * FROM ${table} WHERE code = ?`, test_obj.code);
        // console.log(pa_result);
        expect(pa_result.query_output).toBeDefined();
        expect(pa_result.query_output[0]).toMatchObject(test_obj);
    });

    it('should throw SQL error if UNIQUE property of a column is violated', async () => {
        let test_obj1 = {code: '11111', name: 'a'};
        let ins_result1 = await DB.query(`INSERT INTO ${table} SET ?`, test_obj1);
        let {affectedRows, serverStatus} = ins_result1.query_output;
        expect(affectedRows).toBe(1);
        expect(serverStatus).toBe(2);

        let test_obj2 = {code: '11111', name: 'b'};
        await expect(DB.query(`INSERT INTO ${table} SET ?`, test_obj2)).rejects.toThrow();
        // expect( async () => {
        //     await DB.query(`INSERT INTO ${table} SET ?`, test_obj2);
        // }).rejects.toThrow(); 
    });

    it('should update a row in postal_areas table', async () => {
        let test_obj = {code: '11111', name: 'a'};
        let ins_result1 = await DB.query(`INSERT INTO ${table} SET ?`, test_obj);
        let {affectedRows, serverStatus} = ins_result1.query_output;
        expect(affectedRows).toBe(1);
        expect(serverStatus).toBe(2);

        let update_result = await DB.query(`UPDATE ${table} SET name = ? WHERE code = ?`, ['b', test_obj.code]);
        // console.log(update_result);
        expect(update_result.query_output.changedRows).toBe(1);
        expect(update_result.query_output.serverStatus).toBe(2);

        let sel_result = await DB.query(`SELECT name FROM ${table} WHERE code = ?`, test_obj.code);
        expect(sel_result.query_output[0].name).toBe('b');
    });

    it('should throw SQL error if foreign key constraints are violated', async () => {
        let test_obj = {
            resident_key: 'abcd',
            number: '1',
            street: 'abc Rd.',
            sub_area: 'ab cd',
            postal_code: '11111'
        };
        await expect(DB.query(`INSERT INTO addresses SET ?`, test_obj)).rejects.toThrow();
    });
});

describe('call stored procedure', () => {

    beforeAll(() => { DB.connect(); })
    afterAll( async () => { await DB.disconnect(); })
    afterEach( async () => {
        await DB.query(`DELETE FROM parcels`);
        await DB.query(`DELETE FROM addresses`);
        await DB.query(`DELETE FROM postal_areas`); 
    })

    it('should return the output of a stored procedure', async () => {
        let pa_obj = { code: '11111', name: 'a'};
        await DB.query(`INSERT INTO postal_areas SET ?`, pa_obj);

        let address_obj = {
            resident_key: 'abcd',
            number: '1',
            street: 'abc Rd.',
            sub_area: 'ab cd',
            postal_code: pa_obj.code
        };
        let address_result = await DB.query('INSERT INTO addresses SET ?', address_obj);
        expect(address_result.query_output).toBeDefined();
        expect(address_result.query_output.serverStatus).toBe(2);
        let address_id = address_result.query_output.insertId;

        let parcel_obj = {
            receiver_id: address_id,
            receiver_name: 'a.b.',
            payment: '50.25',
            status: 'on-route-receiver',
            current_location: pa_obj.code,
            last_update: '2020-01-01 07:00:00',
            posted_location: pa_obj.code,
            posted_datetime: '2020-01-01 07:00:00'
        };

        let parcel_result = await DB.query('INSERT INTO parcels SET ?', parcel_obj);
        expect(parcel_result.query_output).toBeDefined();
        expect(parcel_result.query_output.serverStatus).toBe(2);

        let proc_result = await DB.query('CALL active_parcels_received(?,?)', [pa_obj.code, parcel_obj.status]);
        let parcel = proc_result.query_output[0][0];
        expect(proc_result.query_output[1].serverStatus).toBe(34);
        expect(parcel.receiver_id).toBe(parcel_obj.receiver_id);
        expect(parcel.current_code).toBe(parcel_obj.current_location);
        expect(parcel.current_area).toBe(pa_obj.name);
    });
});