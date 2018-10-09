const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');

//Enable express
const app = express();

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'delta115',
        database: 'hummingbird' 
    }
});

//Enable body parser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

// //Enable Cors
app.use(cors());

app.post('/tutorize',(req,res)=>{
    const {email} = req.body;
    db('users')
    .where('email','=',email)
    .update({member_type: "tutor"})
    .then(ret=>console.log(ret));
  }
);

app.post('/register',(req,res)=>{
    const {email, username, password,phone,birth_date,
        street_addr,city,state,zip} = req.body;
    // console.log(email);
    // console.log(username);
    // console.log(password);
    // console.log(phone);
    // console.log(birth_date);
    // console.log(street_addr);
    // console.log(city);
    // console.log(state);
    // console.log(zip);
    const salt = bcrypt.genSaltSync(11);
    const pwCrypt = bcrypt.hashSync(password,salt);
    const fullname = username.split(' ')
    var retJson;
    db.transaction(trx => {
        trx.insert({
            pwcrypt: pwCrypt,
            email: email
        })
        .into('login')
        .returning('email')
        .then(data => {
            return trx('users')
            .returning('*')
            .insert({
                email: email, 
                firstname: fullname[0],
                lastname: fullname[1], 
                member_type: "student"
            })
            .then(user => {
                retJson = user[0];
                return trx('users_addtl')
                .returning('*')
                .insert({
                    id: user[0].id,
                    phone: phone,
                    birth_date: birth_date,
                    street_addr: street_addr,
                    city: city, 
                    state: state,
                    zip: zip
                })
                .then(ret => {
                    res.json(retJson);
                })
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('invalid'));
})

app.post('/signin',(req,res)=>{
    const {email, password} = req.body;
    db.select('email','pwcrypt')
    .from('login')
    .where('email','=', email)
    .then(data=>{
        //Username existence and password validity is checked here
        if ((data.length == 0)||(!(bcrypt.compareSync(password, data[0].pwcrypt)))){
            res.json("Invalid Entry");
        }
        //Input is good
        else {
            db.select('*')
            .from('users')
            .where('email','=',email)
            .then(entry=>{
            res.json(entry[0]);
            })
        }
    })
  }
);

//res.json(data[0].username
// // app.post('/signin',(req,res)=>{
// //     console.log(req.body)
// // })

app.listen(3000)