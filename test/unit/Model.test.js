const DB = require('../../core/db');
const Model = require('../../core/Model');

describe('Model file', () => {
    DB.query = jest.fn().mockResolvedValue({});

    describe('select', () => {
        it('should call query fn with select sql statement', async () => {
            await Model.select('table', 'field1, field2');

            expect(DB.query).toHaveBeenCalled();
            expect(DB.query.mock.calls[0][0]).toMatch(/field1, field2/);
            expect(DB.query.mock.calls[0][0]).toMatch(/table/);
            expect(DB.query.mock.calls[0][0]).toMatch(/SELECT/);
            expect(DB.query.mock.calls[0][1]).toBe(null);
        })

        it('should call query fn with bind parameters', async () => {
            await Model.select('table', 'f1, f2', 'c1 = ?, c2 = ?', ['p1', 'p2']);

            expect(DB.query).toHaveBeenCalled();
            expect(DB.query.mock.calls[1][0]).toMatch(/f1, f2/);
            expect(DB.query.mock.calls[1][0]).toMatch(/c1 = \?,/);
            expect(DB.query.mock.calls[1][0]).toMatch(/select/i);
            expect(DB.query.mock.calls[1][1]).toEqual(['p1', 'p2']);
        })
    })

    describe('insert', () => {
        it('should call query fn with insert sql statement and insert object', async () => {
            let ins_obj = {key1: 'value1', key2: 'value2'};
            await Model.insert('table', ins_obj);

            expect(DB.query).toHaveBeenCalled();
            expect(DB.query.mock.calls[2][0]).toMatch(/table/);
            expect(DB.query.mock.calls[2][0]).toMatch(/insert/i);
            expect(DB.query.mock.calls[2][1]).toEqual(ins_obj);
        })
    })

    describe('update', () => {
        it('should call query fn with update sql statement and params', async () => {
            let params = ['p1', 'p2'];
            await Model.update('table', 'f1 = ?', 'c1 = ?', params);

            expect(DB.query).toHaveBeenCalled();
            expect(DB.query.mock.calls[3][0]).toMatch(/table/);
            expect(DB.query.mock.calls[3][0]).toMatch(/update/i);
            expect(DB.query.mock.calls[3][0]).toMatch(/f1 = \?/);
            expect(DB.query.mock.calls[3][1]).toEqual(params);
        })
    })

    describe('call_procedure', () => {
        it('should call query fn with correct procedure and params', async () => {
            let params = ['p1', 'p2'];
            await Model.call_procedure('proc_name', params);

            let q_marks = DB.query.mock.calls[4][0].match(/\?/g);
            let bind_count = ( q_marks || [] ).length;
            expect(bind_count).toBe(params.length);
            expect(DB.query.mock.calls[4][0]).toMatch(/proc_name/);
            expect(DB.query.mock.calls[4][1]).toEqual(params);
        })
    })
})