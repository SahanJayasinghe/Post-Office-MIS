const helper = require('../../core/helper');

describe('helper functions', () => {

    describe('get_address_array', () => {
        let address_obj = {
            number: "1/B",
            street: "a Rd.",
            sub_area: "a b c",
            postal_area: "a",
            postal_code: "11111"
        };

        it('should return all defined address fields in order', () => {
            let result = helper.get_address_array(address_obj);
            expect(result.length).toBe(5);
            expect(result).toEqual(Object.values(address_obj));
        });

        it('should not contain null fields', () => {
            address_obj.sub_area = null;
            let result = helper.get_address_array(address_obj);
            expect(result.length).toBe(4);
            expect(result).not.toContain(address_obj.sub_area);
        });

        it('should contain name if provided', () => {
            address_obj.sub_area = null;
            let name = "Kamal Perera";
            let result = helper.get_address_array(address_obj, name);
            expect(result.length).toBe(5);
            expect(result).toContain(name);
        });
    });

    describe('dt_local', () => {
        it('should return the local datetime string for the given ISO dt string', () => {
            let dt_obj = new Date();
            dt_obj.setMilliseconds(0);
            let dt_iso = dt_obj.toISOString();
            let result = helper.dt_local(dt_iso);
            
            let result_dt_obj = new Date(result);
            expect(result_dt_obj.getTime()).toBe(dt_obj.getTime());
        });
    });

    describe('current_dt_str', () => {
        it('should return the current datetime in String format', () => {
            let result = helper.current_dt_str();
            let result_dt_obj = new Date(result);

            let now = new Date();
            expect(result_dt_obj.getTime()).toBeLessThan(now.getTime());
            expect(result_dt_obj.getTime()).toBeCloseTo(now.getTime(), -4);
        });
    });

    describe('get_dt_str', () => {
        it('should return datetime string for the dt object', () => {
            let dt_obj = new Date();
            dt_obj.setMilliseconds(0);
            let result = helper.get_dt_str(dt_obj);
            let result_dt_obj = new Date(result);

            expect(result_dt_obj.getTime()).toBe(dt_obj.getTime());
        });
    });

    describe('validate_currency', () => {
        it('should return false to strings with non-digit characters', () => {
            let result = helper.validate_currency('a23#.cde');
            expect(result).toBeFalsy();
        });

        it('should return false to numeric values without exactly two decimal places', () => {
            let result = helper.validate_currency('22.578');
            expect(result).toBeFalsy();
        });

        it('should return false to numeric values greater than 9999.99', () => {
            let result = helper.validate_currency('10000.00');
            expect(result).toBeFalsy();
        });

        it('should return true to numeric values with exactly two decimal places', () => {
            let result = helper.validate_currency('0.57');
            expect(result).toBeTruthy();
        });
    });

    describe('validate_id_name', () => {
        it('should return false to a non-numeric id', () => {
            let test_arr = [null, '', undefined, 'a', 'a%', '{a}'];
            test_arr.forEach(element => {
                let result = helper.validate_id_name({id: element, name: 'a'});
                expect(result).toBeFalsy();            
            });
        });

        it('should return false to an invalid name', () => {
            let test_arr = [null, '', undefined, 1, 'a%', '{a}'];
            test_arr.forEach(element => {
                let result = helper.validate_id_name({id: 1, name: element});
                expect(result).toBeFalsy();            
            });
        });

        it('should return true to valid name and id', () => {
            let result = helper.validate_id_name({id: 1, name: 'a.b. perera'});
            expect(result).toBeTruthy();
        });
    });

    describe('validate_number_postal_area', () => {
        it('should return false to an invalid house number', () => {
            let test_arr = [null, '', undefined, 'a%', '{a}', '23 a'];
            test_arr.forEach(element => {
                let result = helper.validate_number_postal_area({number: element, postal_area: 'a,11111'});
                expect(result).toBeFalsy();
            });
        });

        it('should return false to an invalid postal area', () => {
            let test_arr = [null, '', undefined, 'a%', '{a}', 'a,1111', 'a,'];
            test_arr.forEach(element => {
                let result = helper.validate_number_postal_area({number: '23/a', postal_area: element});
                expect(result).toBeFalsy();
            });
        });
        
        it('should return true for valid input', () => {
            let result = helper.validate_number_postal_area({number: '23/a', postal_area: 'a,11111'});
            expect(result).toBeTruthy();
        });
    });

    describe('validate_address', () => {
        get_test_address = () => {
            return address_obj = {
                number: "1/B",
                street: "a Rd.",
                sub_area: "a b c",
                postal_area: "a,11111",
            };
        }
        
        it('should return false for invalid house numbers', () => {
            let test_arr = [null, undefined, '', 'a%', '{a}', '23 a'];
            let test_obj = get_test_address();
            test_arr.forEach(element => {
                test_obj.number = element;
                let result = helper.validate_address(test_obj);
                expect(result).toBeFalsy();
            });
        });
        
        it('should return false for invalid street names', () => {
            let test_arr = [null, undefined, 'a%', '{a}'];
            let test_obj = get_test_address();
            test_arr.forEach(element => {
                test_obj.street = element;
                let result = helper.validate_address(test_obj);
                expect(result).toBeFalsy();
            });
        });

        it('should return false for invalid sub area names', () => {
            let test_arr = [null, undefined, 'a%', '{a}'];
            let test_obj = get_test_address();
            test_arr.forEach(element => {
                test_obj.sub_area = element;
                let result = helper.validate_address(test_obj);
                expect(result).toBeFalsy();
            });
        });

        it('should return false for postal areas with wrong format', () => {
            let test_arr = [null, undefined, 'a%', 'a,1111', 'a,b,c'];
            let test_obj = get_test_address();
            test_arr.forEach(element => {
                test_obj.postal_area = element;
                let result = helper.validate_address(test_obj);
                expect(result).toBeFalsy();
            });
        });

        it('should return true for a valid address', () => {
            let test_obj = get_test_address();
            let result = helper.validate_address(test_obj);
            expect(result).toBeTruthy();
        })
    });

    describe('validate_money_order', () => {
        get_sample_mo = () => {
            return mo_obj = {
                sender_name: 'a',
                receiver_name: 'b',
                receiver_postal_code: '11111',
                amount: '123.45',
                price: '6.78',
                expire_after: 1,
                posted_location: '22222'
            }
        }

        it('should return false for invalid name formats', () => {
            let test_obj = get_sample_mo();
            let test_arr = [null, '', undefined, 1, 'a%', '{a}'];
            test_arr.forEach(element => {
                test_obj.sender_name = element;
                let result = helper.validate_money_order(test_obj);
                expect(result).toBeFalsy();
            });
        });

        it('should return false for invalid postal code formats', () => {
            let test_obj = get_sample_mo();
            let test_arr = [null, '', undefined, 1, 'a%', '1111'];
            test_arr.forEach(element => {
                test_obj.receiver_postal_code = element;
                let result = helper.validate_money_order(test_obj);
                expect(result).toBeFalsy();
            });
        });

        it('should return false for invalid money order amounts', () => {
            let test_obj = get_sample_mo();
            let test_arr = [null, '', undefined, 1.234, 'a%', 0.00, -24, 50000.01];
            test_arr.forEach(element => {
                test_obj.amount = element;
                let result = helper.validate_money_order(test_obj);
                expect(result).toBeFalsy();
            });
        });

        it('should return false for invalid expiration periods', () => {
            let test_obj = get_sample_mo();
            let test_arr = [null, '', undefined, 1.2, 'a%', -24, 25];
            test_arr.forEach(element => {
                test_obj.expire_after = element;
                let result = helper.validate_money_order(test_obj);
                expect(result).toBeFalsy();
            });
        });

        it('should return true if all money order fields are valid', () => {
            let test_obj = get_sample_mo();
            let result = helper.validate_money_order(test_obj);
            expect(result).toBeTruthy();
        });
    });

    describe('expiration_check', () => {
        it('should return false for is_expired and a future date time as expiration', () => {
            let now = new Date();
            let test_dt = new Date();
            test_dt.setMonth(test_dt.getMonth() - 2);
            let result = helper.expiration_check(test_dt.toISOString(), 3);
            // console.log(result);
            expect(result[0]).toBeFalsy();

            let expired_dt_obj = new Date(result[1]);
            expect(expired_dt_obj.getTime()).toBeGreaterThan(now.getTime());
        });

        it('should return true for is_expired and a past date time as expiration', () => {
            let now = new Date();
            let test_dt = new Date();
            test_dt.setMonth(test_dt.getMonth() - 3);
            let result = helper.expiration_check(test_dt.toISOString(), 2);
            // console.log(result);
            expect(result[0]).toBeTruthy();

            let expired_dt_obj = new Date(result[1]);
            expect(expired_dt_obj.getTime()).toBeLessThan(now.getTime());
        });
    });
    
});