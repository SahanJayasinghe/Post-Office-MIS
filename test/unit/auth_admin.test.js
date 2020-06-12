const auth_admin = require('../../middleware/auth_admin');
const Admin = require('../../app/models/Admin');

describe('auth_admin middleware unit test', () => {
    it('should populate req.admin with admin id', () => {
        let token = Admin.generate_admin_token(1);

        const req = { header: jest.fn().mockReturnValue(token) };
        const res = {};
        const next = jest.fn();

        auth_admin(req, res, next);

        expect(req.admin).toBe(1);
        expect(next).toHaveBeenCalled();
    })
})