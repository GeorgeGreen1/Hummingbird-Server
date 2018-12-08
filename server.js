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
    .then(ret=>console.log("New Tutor"));
  }
);

app.post('/register',(req,res)=>{
    const {email, firstName, lastName, password,phone,birth_date,
        meet_addr,bill_addr,city,state,zip} = req.body;
    const salt = bcrypt.genSaltSync(11);
    const pwCrypt = bcrypt.hashSync(password,salt);
    var retJson;
    db.transaction(trx => {
        trx.insert({
            pwcrypt: pwCrypt,
            email: email
        })
        .into('login')
        .returning('id')
        .then(user_login => {
            return trx('users')
            .returning('*')
            .insert({
                id: user_login[0],
                email: email, 
                firstname: firstName,
                lastname: lastName, 
                member_type: "student"
            })
            .then(user_users => {
                retJson = user_users[0];
                return trx('users_addtl')
                .returning('*')
                .insert({
                    id: user_users[0].id,
                    phone: phone,
                    birth_date: birth_date,
                    meet_addr: meet_addr,
                    bill_addr: bill_addr,
                    city: city, 
                    state: state,
                    zip: zip
                })
                .then(() => {
                    res.json(retJson);
                })
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(() => res.status(400).json('invalid'));
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

app.post('/updateacct',(req,res)=>{
    const {meetAddress,city,zip,states,
           phone,billAddress,alt_phone,id} = req.body;
    //Username existence and password validity is checked here
    db('users_addtl')
    .where('id','=',id)
    .update({phone: phone,
                alt_phone: alt_phone,
                meet_addr: meetAddress,
                bill_addr: billAddress,
                city: city,
                state: states,
                zip: zip})
    .then(()=>{
        db.select('meet_addr','city','zip','state','phone','bill_addr','alt_phone')
        .from('users_addtl')
        .where('id','=', data[0].id)
        .then(data=>{
            res.json(data[0])
        })
    });
})



app.post('/addtutorsubj',(req,res)=>{
    const {id,subj,lvl} = req.body;
    db.transaction(trx => {
        trx.select('id')
        .from('subjects')
        .where('name','=',subj)
        .then(ret =>{
            return trx('expertise')
                    .returning('*')
                    .insert({
                        tutor_id: id,
                        subject: ret[0].id,
                        level: lvl
                    })
                    .then(ret => {
                        res.json(ret);
                    })
            }
        )
        .then(trx.commit)
        .catch(trx.rollback)
        })
        .catch(() => res.status(400).json('invalid'));
})

app.post('/rmtutorsubj',(req,res)=>{
    const {id,subj,lvl} = req.body;
    db.transaction(trx => {
        trx('expertise')
        .where('subject','=',subj)
        .del()
        .then(ret =>{
            res.json(ret);
            }
        )
        .then(trx.commit)
        .catch(trx.rollback)
        })
        .catch(() => res.status(400).json('invalid'));
})

app.post('/getacct',(req,res)=>{
    const {id} = req.body;
    db.select('*')
    .from('users_addtl')
    .where('id','=',id)
    .then(entry=>{
        res.json(entry[0])
    });
})

app.post('/getnotif',(req,res)=>{
    const {id} = req.body;
    db.select('*')
    .from('notif')
    .where('recip_id','=',id)
    .then(entry=>{
        res.json(entry)
    });
})  

app.post('/gettutors',(req,res)=>{
    const {id} = req.body;
    db.select('course','firstname','email')
    .from('study','users')
    .innerJoin('users','users.id','study.tutor_id')
    .where('student_id','=',id)
    .orderBy('study_id','asc')
    .then(entry=>{
        res.json(entry)
        }
    )
})

removeDup = (arr) => {
    var obj = {};

    for ( var i=0, len=arr.length; i < len; i++ ){
        obj[arr[i]['id']] = arr[i];
    }

    no_dup = new Array();
    for ( var key in obj ){
        no_dup.push(obj[key]);
    }
    return no_dup;
}

app.post('/getstudents',(req,res)=>{
    const {id} = req.body;
    db.select('id','tutor_id','firstname','lastname')
    .from('study','users')
    .innerJoin('users','users.id','study.student_id')
    .where('tutor_id','=',id)
    .orderBy('study_id','asc')
    .then(entry=>{
        res.json(removeDup(entry))
    })
})

app.get('/getallsubj',(req,res)=>{
    db.select('name')
    .from('subjects')
    .then(entry=>{
        res.json(entry);
    });
})

app.post('/getmysubjects',(req,res)=>{
    const {id} = req.body;
    db.select('name','level')
    .from('expertise','subjects')
    .innerJoin('subjects','subjects.id','expertise.subject')
    .where('tutor_id','=',id)
    .then(entry=>{
        res.json(entry);
    });
})

// LOOK INTO WEEK OF
// This script is released to the public domain and may be used, modified and
// distributed without restrictions. Attribution not necessary but appreciated.
// Source: https://weeknumber.net/how-to/javascript
Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                          - 3 + (week1.getDay() + 6) % 7) / 7);
  }

getWeekMark = (date) =>{
    const diff = date.getDay() - 1;
    date.setDate(date.getDate() - diff);
    return date;
}
  
app.post('/addsession',(req,res)=>{
    const {date, subject, student_id, tutor_id, comments, course, hours, verified } = req.body;
    const dt = new Date(date);
    db.transaction(trx => {
        trx.insert({
            date: date,
            subject: subject,
            student_id: student_id,
            tutor_id: tutor_id,
            course: course,
            hours: hours,
            comment: comments,
            week_of: getWeekMark(dt),
            verified: verified
        })
        .into('session')
        .returning('*')
        .then(entry => {
            res.json(entry);
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
})

app.post('/getsession',(req,res)=>{
    const {id} = req.body;
    db.select('session.date','session.week_of','session.subject','session.course','session.hours','session.verified','users.firstname','users.lastname')
    .from('session')
    .innerJoin('users','session.student_id','=','users.id')
    .orderBy('session.week_of','desc')
    .then(entry=>{
        res.json(entry)
    })
    }
)


app.post('/verify',(req,res)=>{
    const {week} = req.body;
    const wk = new Date(week);
    db('session')
    .where('week_of','=',wk)
    .update({verified: true})
    .then(entry=>{
        res.json(entry);
    })
    }
)

app.listen(3000)