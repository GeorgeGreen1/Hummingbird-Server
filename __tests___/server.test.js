const request = require('supertest');
const app = require('../app');

describe('Retrieves user supplemental info', () => {
    test('It should response the POST method', (done) => {
        request(app).post("/getacct")
        .send({id:1})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then(response => {
            var ret = response.body;
            expect(ret.id).toBe(1);
            expect(ret.phone).toBe("123-555-5555");
            expect(ret.birth_date).toBe("1987-01-01T06:00:00.000Z");
            expect(ret.meet_addr).toBe("Monster Jam University");
            expect(ret.bill_addr).toBe("1 Goldberg Ave");
            expect(ret.city).toBe("Paxton");
            expect(ret.state).toBe("IL");
            done();
        })
    });
})

describe('Retrieves user settings', () => {
    test('It should response the POST method', (done) => {
        request(app).post("/getsettings")
        .send({id:5,member_type:'tutor'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then(response => {
            var ret = response.body[0];
            expect(ret.notify_match).toBe(false);
            expect(ret.display_email).toBe(false);
            expect(ret.match_available).toBe(true);
            done();
        })
    });
})

describe('Retrieves tutor BG', () => {
    test('It should response the POST method', (done) => {
        request(app).post("/gettutorbg")
        .send({id:16})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then(response => {
            var ret = response.body[0];
            expect(ret.edu_earned).toBe(2);
            expect(ret.years_exp).toBe(1);
            expect(ret.description).toBe("Alpha");
            done();
        })
    });
})

describe('Retrieves notification', () => {
    test('It should response the POST method', (done) => {
        request(app).post("/getnotif")
        .send({id:16})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then(response => {
            var ret = response.body;
            expect(ret.length).toBe(2);
            done();
        })
    });
})

describe('Retrieves subjects', () => {
    test('It should response the POST method', (done) => {
        request(app).get("/getallsubj")
        .then(response => {
            var ret = response.body;
            expect(ret.length).toBe(14);
            done();
        })
    });
})

describe("Retrieves a tutor's subjects of their expertise", () => {
    test('It should response the POST method', (done) => {
        request(app).post('/getmysubjects')
        .send({id:5})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .then(response => {
            var ret = response.body;
            expect(ret.length).toBe(2);
            done();
        })
    });
})