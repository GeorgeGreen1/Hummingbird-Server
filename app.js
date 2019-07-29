const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');
const SquareConnect = require('square-connect');
const jwt = require('jsonwebtoken');
const defaultClient = SquareConnect.ApiClient.instance;

var oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = 'EAAAEPGvGJyi8kDABbj3JRf9GD1M14aCZ5ZBfNkyh4zX8RowEn086CuV1iNxm1aY';

//Token Format: Bearer <access_token>
verifyToken = (req,res,next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined'){
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from bearer array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        next();
    }else{
        // Forbidden
        res.sendStatus(403)
    }
}


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
                    return trx('user_settings')
                    .returning('*')
                    .insert({
                        notify_match: true,
                        display_email: true
                    })
                    .then(() => {
                        return trx('student_hours')
                        .returning('*')
                        .insert({
                            hours_remaining: 0,
                        })
                        .then(() => {
                            res.json(retJson);
                        })
                    })
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
            jwt.sign({email},'10magnet5',(err,token) =>{
                entry[0].token = token;
                res.json(entry[0]);
            })
            })
        }
    })
  }
);


app.post('/updateacct',(req,res)=>{
    const {meetAddress,city,zip,states,
           phone,billAddress,alt_phone,id,descr,edu_earned} = req.body;
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
        db('tutor_bg')
        .where('tutor_id','=',id)
        .update({
            description: descr,
            edu_earned: edu_earned
        })
        .then(()=>{
        db.select('users_addtl.id as id','users_addtl.meet_addr','users_addtl.city','users_addtl.zip','users_addtl.state','users_addtl.phone',
                'users_addtl.bill_addr','users_addtl.alt_phone','tutor_bg.description','tutor_bg.edu_earned')
        .from('users_addtl')
        .leftJoin('tutor_bg','users_addtl.id','tutor_bg.tutor_id')
        .where('id','=', id)
        .then(data=>{
            res.json(data[0])
        }
        )}
        )
    })
})



app.post('/addtutorsubj',(req,res)=>{
    const {id,subj,lvl} = req.body;
    db.transaction(trx => {
        trx('expertise')
        .returning('*')
        .insert({
            tutor_id: id,
            subject: subj,
            level: lvl
        })
        .then(ret => {
            res.json(ret);
        })
        .then(trx.commit)
        .catch(trx.rollback)
        })
        .catch(() => res.status(400).json('invalid'));
})

app.post('/rmtutorsubj',(req,res)=>{
    const {id,subj} = req.body;
    db.transaction(trx => {
        trx('expertise')
        .where({
            tutor_id: id,
            subject: subj.substr(0,subj.length-1)
          })
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


app.post('/getsettings',(req,res)=>{
    const {id,member_type} = req.body;
    db.select('*')
    .from('user_settings')
    .innerJoin('tutor_settings','user_settings.user_id','tutor_settings.user_id')
    .where({"user_settings.user_id": id})
    .then(entry=>{
        res.json(entry);
    })
});

app.post('/updatesettings',(req,res)=>{
    const {id,notify_match,match_available,display_email} = req.body;
    db('user_settings')
    .where('user_id','=',id)
    .update({notify_match,display_email})
    .then(ret=>{
        db('tutor_settings')
        .where('user_id','=',id)
        .update({match_available})
        .then(ret=>{
            console.log("success");
            res.json();
            }
        )}
    );
  }
);


app.post('/changepass',(req,res)=>{
    const {id,oldPass,newPass} = req.body;
    db.select('pwcrypt')
    .from('login')
    .where('id','=', id)
    .then(data=>{
        if (!(bcrypt.compareSync(oldPass, data[0].pwcrypt))){
            res.json("Invalid Password");
        }
        else {    
            const salt = bcrypt.genSaltSync(11);
            const pwCrypt = bcrypt.hashSync(newPass,salt);
            db('login')
            .where('id','=',id)
            .update({
                pwcrypt: pwCrypt
            })
            .then(()=>{
                res.json({ok:true});
                }
            );
        }
    })
  }
);

app.post('/gettutorbg',(req,res)=>{
    const {id} = req.body;
    db.select('*')
    .from('tutor_bg')
    .where('tutor_id','=',id)
    .then(entry=>{
        res.json(entry)
    });
})

app.post('/getuser',(req,res)=>{
    const {id} = req.body;
    db.select('firstname','lastname')
    .from('users')
    .where('id','=',id)
    .then(entry=>{
        res.json(entry[0])
    });
})

app.post('/usersearch',(req,res)=>{
    const {firstname,lastname,id} = req.body;
    var searchObj = {};
    // Check if query contains first name
    if (firstname !== ""){
        searchObj.firstname = firstname;
    }
    // Check if query contains last name
    if (lastname !== ""){
        searchObj.lastname = lastname;
    }
    // Check if query contains id
    if (id !== -1){
        searchObj.id = id;
    }
    db.select('*')
    .from('users')
    .where(searchObj)
    .then(results=>{
        console.log(results);
        res.json(results);
    });    
})


app.post('/admintutorsearch',(req,res)=>{
    const {subject,level} = req.body;
    let response = [];
    db.select('id','firstname','lastname','email',knex.raw('ARRAY_AGG(expertise.subject) as subject'),knex.raw('ARRAY_AGG(expertise.level) as level'))
    .from('users')
    .innerJoin('expertise','users.id','expertise.tutor_id')
    .where({subject: subject})
    .andWhere('level','>=',level)
    .groupBy('users.id')
    .then(entry=>{
        for (let i = 0; i<entry.length;i++){
            response.push({
                id: entry[i].id,
                name: entry[i].firstname + " " + entry[i].lastname,
                email: entry[i].email 
            })
        }
        console.log(response);
        res.json(response);
    })
})

app.post('/getprofileinfo',(req,res)=>{
    const {profile_id,querier_id,querier_type} = req.body;
    let responseEntry;
    db.select('users.id','users.firstname','users.lastname','users.email','users.member_type')
    .from('users')
    .where('users.id','=',profile_id)
    .then(entry=>{
        if ((entry.length===0)||(entry[0].member_type === 'admin')||((querier_type !== 'admin')&& (entry[0].member_type === querier_type))){
            res.json(null);
        }
        else{
            let user = entry[0];
            // Admin retrieves user info
            if (querier_type === 'admin'){
                if (user.member_type === 'tutor'){
                    db.select('users_addtl.phone', 
                            'users_addtl.bill_addr','users_addtl.city','users_addtl.state','users_addtl.zip',
                            knex.raw('ARRAY_AGG(expertise.subject) as subject'),knex.raw('ARRAY_AGG(expertise.level) as level')) 
                            .from('users_addtl')
                            .leftJoin('expertise','users_addtl.id','expertise.tutor_id')
                            .where('users_addtl.id','=',user.id)
                            .groupBy('users_addtl.phone','users_addtl.bill_addr','users_addtl.city','users_addtl.state','users_addtl.zip')
                            .then(entryTwo=>{
                                console.log(entryTwo);
                                responseEntry = entryTwo[0];
                                db.select('description','edu_earned','years_exp') 
                                .from('tutor_bg')
                                .where('tutor_id','=',user.id)
                                .then(desc=>{
                                responseEntry.id = user.id;
                                responseEntry.member_type = user.member_type;
                                responseEntry.firstname = user.firstname;
                                responseEntry.lastname = user.lastname;
                                responseEntry.email = user.email; 
                                responseEntry.edu_earned = desc[0].edu_earned;
                                responseEntry.years_exp = desc[0].years_exp;
                                responseEntry.description = desc[0].description;
                                res.json(responseEntry);
                                })
                            })
                } else {
                    db.select('users_addtl.phone', 
                    'users_addtl.bill_addr','users_addtl.city','users_addtl.state','users_addtl.zip') 
                    .from('users_addtl')
                    .where('users_addtl.id','=',user.id)
                    .then(addtlEntry=>{
                        responseEntry = addtlEntry[0];
                        responseEntry.id = user.id;
                        responseEntry.member_type = user.member_type;
                        responseEntry.firstname = user.firstname;
                        responseEntry.lastname = user.lastname;
                        responseEntry.email = user.email;
                        res.json(responseEntry);
                    })
                }
            // Tutor or student retrieves user info
            }else{
                db.select('date')
                .from('session')
                .where({'tutor_id': querier_id,
                        'student_id': profile_id})
                .orWhere(
                    {'tutor_id': profile_id,
                    'student_id': querier_id})
                .then(sessionEntry =>{
                    if (sessionEntry.length !== 0){
                        responseEntry = sessionEntry[0];
                        if (querier_type === 'tutor'){
                            res.json(user);
                        }
                        else{
                            db.select(
                                knex.raw('ARRAY_AGG(expertise.subject) as subject'),knex.raw('ARRAY_AGG(expertise.level) as level')) 
                                .from('users_addtl')
                                .leftJoin('expertise','users_addtl.id','expertise.tutor_id')
                                .where('users_addtl.id','=',user.id)
                                .then(entryTwo=>{
                                    responseEntry = entryTwo[0];
                                    responseEntry.id = user.id;
                                    responseEntry.member_type = user.member_type;
                                    responseEntry.firstname = user.firstname;
                                    responseEntry.lastname = user.lastname;
                                    responseEntry.email = user.email;
                                    res.json(responseEntry);
                                })
                        }
                    }
                    else {
                        res.json(null);
                    }                
                })
            }
    }
    })
})

app.post('/tutorize',(req,res)=>{
    const {user_id} = req.body;
    db('users')
    .where('id','=',user_id)
    .update({member_type: 'tutor'})
    .then(()=>{
        db.transaction(trx =>
        trx('tutor_bg')
            .returning('*')
            .insert({
                tutor_id: user_id,
                edu_earned: 0,
                years_exp: 0,
                description: ""
            })
            .then(() => {
               return trx('tutor_settings')
                .returning('*')
                .insert({
                    user_id: user_id,
                    match_available: true
                })
                .then(() => {
                    return trx('student_hours')
                    .where({
                        user_id: user_id
                      })
                    .del()
                    .then(() =>{
                        res.json();
                    }
                )
            })
        })
    )
    })
})

app.post('/sendnotif',(req,res)=>{
    const {recip_id, mesg} = req.body;
    db.transaction(trx => {
        trx('notif')
        .returning('*')
        .insert({
            recip_id: recip_id,
            mesg: mesg,
            time: new Date()
        })
        .then(ret => {
            res.json(ret);
        })
        .then(trx.commit)
        .catch(trx.rollback)
        })
        .catch(() => res.status(400).json('invalid'))
})

app.post('/getnotif',(req,res)=>{
    const {id} = req.body;
    db.select('*')
    .from('notif')
    .where('recip_id','=',id)
    .orderBy('time','desc')
    .then(entry=>{
        res.json(entry)
    });
})  

app.post('/deletenotif',(req,res)=>{
    const {id,time} = req.body;
    db.transaction(trx => {
        trx('notif')
        .where({
            recip_id: id,
            time: new Date(time)
          })
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

//Matching Mechanism

app.post('/getmatchedtutors',(req,res)=>{
    const {id} = req.body;
    db.select('firstname','lastname','email','id')
    .from('match','users')
    .innerJoin('users','users.id','match.tutor_id')
    .where('student_id','=',id)
    .orderBy('lastname','asc')
    .then(entry=>{
        res.json(entry)
        }
    )
})


app.post('/getmatchedstudents',(req,res)=>{
    const {id} = req.body;
    db.select('firstname','lastname','email','id')
    .from('match','users')
    .innerJoin('users','users.id','match.student_id')
    .where('tutor_id','=',id)
    .orderBy('lastname','asc')
    .then(entry=>{
        res.json(entry)
        }
    )
})

app.post('/registermatch',(req,res)=>{
    const {tutor_id,student_id} = req.body;
    db.transaction(trx => {
        trx('match')
        .returning('*')
        .insert({
            tutor_id: tutor_id,
            student_id: student_id
        })
        .then(retValA => {
            let mesg = "You have a new matched "
            return trx('notif')
            .returning('*')
            .insert({
                recip_id: student_id + " tutor",
                mesg: mesg,
                time: new Date()
            })
            .then(() => {
                return trx('notif')
                .returning('*')
                .insert({
                    recip_id: tutor_id,
                    mesg: mesg + " student",
                    time: new Date()
                })
                .then(() => {
                    res.json(retValA);
                })
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
        })
        .catch(() => res.status(400).json('invalid'));
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

// // This may be changeable to use group by instead of removedup
// app.post('/getstudents',(req,res)=>{
//     const {id} = req.body;
//     db.select('id','tutor_id','firstname','lastname')
//     .from('study','users')
//     .innerJoin('users','users.id','study.student_id')
//     .where('tutor_id','=',id)
//     .orderBy('study_id','asc')
//     .then(entry=>{
//         res.json(removeDup(entry))
//     })
// })

app.get('/getallsubj',(req,res)=>{
    db.select('name')
    .from('subjects')
    .then(entry=>{
        res.json(entry);
    });
})



// Make sure this works, put the subj and levels altogether on the frontend
app.get('/getalltutors',(req,res)=>{
    db.select('id','firstname','lastname','email',knex.raw('ARRAY_AGG(expertise.subject) as subject'),knex.raw('ARRAY_AGG(expertise.level) as level'))
    .from('users')
    .innerJoin('expertise','users.id','expertise.tutor_id')
    .where('member_type','=','tutor')
    .groupBy('users.id')
    .then(entry=>{
        res.json(entry)
    })
})

app.post('/getmysubjects',(req,res)=>{
    const {id} = req.body;
    db.select('subject','level')
    .from('expertise')
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

app.post('/getmyhours',(req,res)=>{
    const {id} = req.body;
    db.select('*')
    .from('student_hours')
    .where('user_id','=',id)
    .then(entry=>{
        res.json(entry[0].hours_remaining)
    });
})
  
// app.post('/addsession',(req,res)=>{
//     const {date, subject, student_id, tutor_id, comments, course, hours, verified } = req.body;
//     const dt = new Date(date);
//     db.transaction(trx => {
//         trx.insert({
//             date: date,
//             subject: subject,
//             student_id: student_id,
//             tutor_id: tutor_id,
//             course: course,
//             hours: hours,
//             comment: comments,
//             week_of: getWeekMark(dt),
//             verified: verified
//         })
//         .into('session')
//         .returning('*')
//         .then(entry => {
//             res.json(entry);
//         })
//         .then(trx.commit)
//         .catch(trx.rollback)
//     })
// })



app.post('/getmytutors',(req,res)=>{
    const {id} = req.body;
    let dt;
    db.select('users.firstname','users.lastname','users.email','users.id')
    .from('session')
    .innerJoin('users','session.tutor_id','=','users.id')
    .groupBy('users.firstname','users.lastname','users.email','users.id')
    .where({
        student_id: id,
    })
    .then(entry=>{
            // for (let i = 0; i<entry.length; i++){
            //     dt = new Date(entry[i].date);
            //     entry[i].date = (dt.getMonth()+1) + '/' + dt.getDate() + '/' + dt.getFullYear();
            // }
            res.json(entry)
        })
    }
)


app.post('/getmystudents',(req,res)=>{
    const {id} = req.body;
    let dt;
    db.select('users.firstname','users.lastname','users.email','users.id')
    .from('session')
    .innerJoin('users','session.student_id','=','users.id')
    .groupBy('users.firstname','users.lastname','users.email','users.id')
    .where({
        tutor_id: id,
    })
    .then(entry=>{
            // for (let i = 0; i<entry.length; i++){
            //     dt = new Date(entry[i].date);
            //     entry[i].date = (dt.getMonth()+1) + '/' + dt.getDate() + '/' + dt.getFullYear();
            // }
            res.json(entry)
        })
    }
)

app.post('/getpastsessions',(req,res)=>{
    const {member_type,id} = req.body;
    let dt;
    db.select('session.date','session.subject','users.firstname','users.lastname','users.email')
    .from('session')
    .innerJoin('users',"session."+((member_type==="student")?"tutor_id":"student_id"),'=','users.id')
    .orderBy('session.date','desc')
    .where(member_type+'_id',"=",id)
    .then(entry=>{
        for (let i = 0; i<entry.length; i++){
            dt = new Date(entry[i].date);
            entry[i].date = (dt.getMonth()+1) + '/' + dt.getDate() + '/' + dt.getFullYear();
        }
        res.json(entry)
    })
    }
)

app.post('/gettutorsessions',(req,res)=>{
    const {id} = req.body;
    let dt;
    db.select('session.date','session.subject','users.firstname','users.lastname','users.email')
    .from('session')
    .innerJoin('users','session.student_id','=','users.id')
    .orderBy('session.date','desc')
    .where({
        tutor_id: id,
    })
    .then(entry=>{
        for (let i = 0; i<entry.length; i++){
            dt = new Date(entry[i].date);
            entry[i].date = (dt.getMonth()+1) + '/' + dt.getDate() + '/' + dt.getFullYear();
        }
        console.log(entry);
        res.json(entry)
    })
    }
)

app.post('/getstudentsessions',(req,res)=>{
    const {id} = req.body;
    let dt;
    db.select('session.date','session.subject','users.firstname','users.lastname','users.email')
    .from('session')
    .innerJoin('users','session.tutor_id','=','users.id')
    .orderBy('session.date','desc')
    .where({
        student_id: id,
    })
    .then(entry=>{
        for (let i = 0; i<entry.length; i++){
            dt = new Date(entry[i].date);
            entry[i].date = (dt.getMonth()+1) + '/' + dt.getDate() + '/' + dt.getFullYear();
        }
        res.json(entry)
    })
    }
)


// app.post('/gettutorconnections',(req,res)=>{
//     const {id} = req.body;
//     let dt;
//     db.select('student_id')
//     .from('log_connection')
//     .where('tutor_id','=',id)
//     .then(entry=>{
//         db.select('users.email','users.firstname','users.lastname')
//         .from('users')
//         .whereIn('id',entry.map(item=>{return item.student_id}))
//         .then(entry_alpha=>{
//             res.json(entry_alpha)
//         })
//     })
//     }
// )


app.post('/getunverifiedsessions',(req,res)=>{
    const {id} = req.body;
    let dt;
    db.select('session.date','session.week_of','session.subject','session.comment','session.course','session.hours','session.verified','users.firstname','users.lastname')
    .from('session')
    .innerJoin('users','session.student_id','=','users.id')
    .orderBy('session.week_of','desc')
    .where('verified','=',false)
    .then(entry=>{
        for (let i = 0; i<entry.length; i++){
            dt = new Date(entry[i].date);
            entry[i].date = (dt.getMonth()+1) + '/' + dt.getDate() + '/' + dt.getFullYear();
        }
        res.json(entry)
    })
    }
)
// Get verified sessions
app.post('/getuserverifiedsessions',(req,res)=>{
    const {id} = req.body;
    let dt;
    let tutorSessions = {};
    db.select('session.date','session.week_of','session.subject','session.comment','session.course','session.hours','session.verified','users.firstname','users.lastname')
    .from('session')
    .innerJoin('users','session.student_id','=','users.id')
    .orderBy('session.date','desc')
    .where({
        tutor_id: id,
        verified: true
    })
    .then(entry=>{
        db.select('firstname','lastname')
        .from('users')
        .where('id','=',id)
        .then(tutor=>{
            for (let i = 0; i<entry.length; i++){
                dt = new Date(entry[i].date);
                entry[i].date = (dt.getMonth()+1) + '/' + dt.getDate() + '/' + dt.getFullYear();
            }
            tutorSessions.sessions = entry;
            tutorSessions.name = tutor[0].firstname + " " + tutor[0].lastname;
            res.json(tutorSessions)
        })
    })
})

// Get all verified sessions
app.get('/getallverifiedsessions',(req,res)=>{
    let dt;
    db.select('session.date','session.hours','users.firstname','users.lastname','users.id')
    .from('session')
    .innerJoin('users','session.tutor_id','=','users.id')
    .orderBy('session.date','desc')
    .where('verified','=',true)
    .then(entry=>{
        for (let i = 0; i<entry.length; i++){
            dt = new Date(entry[i].date);
            entry[i].date = (dt.getMonth()+1) + '/' + dt.getDate() + '/' + dt.getFullYear();
        }
        res.json(entry)
    })
})

// app.post('/verify',(req,res)=>{
//     const {week} = req.body;
//     const wk = new Date(week);
//     db('session')
//     .where('week_of','=',wk)
//     .update({verified: true})
//     .then(entry=>{
//         res.json(entry);
//     })
//     }
// )

// app.post('/search',(req,res)=>{
//     const {id} = req.body;
//     db.select('expertise.subject','expertise.level','user.id','user.email','user.firstname','user.lastname')
//     .from('expertise')
//     .innerJoin('users','expertise.tutor_id','=','users.id')
//     .orderBy('session.week_of','desc')
//     .then(entry=>{
//         console.log(entry)
//     }
//     )
//     }
// )

app.post('/jobpost',(req,res) =>{
    const {id,school,course,lvl,subject,comments} = req.body;
    const dt = new Date();
    db.transaction(trx => {
        db.select('firstname','lastname')
        .from('users')
        .where('id','=',id)
        .then(user_name =>{
            return (
                trx.insert({
                        user_id: id,
                        stud_name: user_name[0].firstname + " " + user_name[0].lastname,
                        school: school,
                        course: course,
                        subject: subject,
                        level: lvl,
                        comments: comments,
                        date: dt
                    })
                    .into('job_postings')
                    .returning('')
                    .then(()=>{
                        res.json(user_name);
                    }))
        })
        .then(trx.commit)
        .catch(trx.rollback)
        })
        .catch(item => {
            console.log(item);
            res.status(400).json('invalid')});
    }
)

app.get('/getpostings',(req,res)=>{
    db.select('*')
    .from('job_postings')
    .orderBy('date','desc')
    .then(entries=>{
        res.json(entries);
    });
})


app.post('/deleteposting',(req,res)=>{
    const {req_id} = req.body;
    db.transaction(trx => {
        trx('job_postings')
        .where({
            request_id: req_id,
          })
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

const open_shifts_request = (id) =>{
    var shift_query = new SquareConnect.ShiftQuery();
    var shift_filter = new SquareConnect.ShiftFilter();
    var search_shifts_request = new SquareConnect.SearchShiftsRequest();
    shift_filter['employee_id'] = Array(id);
    shift_filter['status'] = "OPEN";
    shift_query['filter'] = shift_filter;
    search_shifts_request['query'] = shift_query;
    return search_shifts_request;
}

const build_shift_obj = (id,rate,date,start_time,end_time) => {
    var shift = new SquareConnect.Shift();
    var shift_wage = new SquareConnect.ShiftWage();
    var dt = new Date(date);
    var start = start_time.split(':');
    var end = end_time.split(':');
    shift['employee_id'] = id;
    shift['location_id'] = "GPW35V7F3C52M";
    shift['start_at'] = new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),parseInt(start[0]),parseInt(start[1]));
    // Cross date
    if (parseInt(end[0])<parseInt(start[0])){
        dt.setDate(dt.getDate()+1);    
    }
    shift['end_at'] = new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),parseInt(end[0]),parseInt(end[1]));
    shift_wage['hourly_rate'] = rate;
    shift_wage['title'] = 'Tutor';
    shift['wage'] = shift_wage;
    return shift;
}

// app.post('/log-shift',(req,res)=>{
//     const {id,start_time,end_time} = req.body;
//     const employees_api = new SquareConnect.EmployeesApi();
//     const labor_api = new SquareConnect.LaborApi();
//     var idempotency_key = require('crypto').randomBytes(64).toString('hex');
//     var wage_params = {
//         employeeId: id
//     }
//     labor_api.listEmployeeWages(wage_params).then(entry=>{
//          var emp_rate = entry.employee_wages[0].hourly_rate;
//          var body = new SquareConnect.CreateShiftRequest();
//          body['shift'] = build_shift_obj(id,emp_rate);
//          body['idempotency_key'] = idempotency_key;
//          labor_api.createShift(body).then(ret=>{
//             db.transaction(trx => {
//                 trx.insert({
//                     date: date,
//                     subject: subject,
//                     student_id: student_id,
//                     tutor_id: tutor_id,
//                 })
//                 .into('session')
//                 .returning('*')
//                 .then(entry => {
//                     res.json(entry);
//                 })
//                 .then(trx.commit)
//                 .catch(trx.rollback)
//             })
//          })
//     })
//     }
// )

app.post('/logsession',(req,res)=>{
    const {tutor_id,start_time,end_time,
            subject,email,date} = req.body;
    const employees_api = new SquareConnect.EmployeesApi();
    const labor_api = new SquareConnect.LaborApi();
    var idempotency_key = require('crypto').randomBytes(64).toString('hex');
    var logDate = new Date(date);
    db.select('employee_id')
    .from('tutor_square')
    .where('tutor_id','=',tutor_id)
    .then(entry =>{
            var wage_params = {
                employeeId: entry[0].employee_id
            }
            labor_api.listEmployeeWages(wage_params).then(wage=>{   
                var emp_rate = wage.employee_wages[0].hourly_rate;
                var employee_id = entry[0].employee_id;
                var body = new SquareConnect.CreateShiftRequest();
               body['shift'] = build_shift_obj(employee_id,emp_rate,date,start_time,end_time);
               body['idempotency_key'] = idempotency_key;
               labor_api.createShift(body).then(ret=>{
                    db.select('id')
                    .from('users')
                    .where('email','=',email)
                    .then(user=> {
                        db.transaction(trx => {
                            trx.insert({
                                date: logDate,
                                subject: subject,
                                student_id: user[0].id,
                                tutor_id: tutor_id,
                                start_time: start_time,
                                end_time: end_time
                            })
                            .into('session')
                            .returning('*')
                            .then(item => {
                                return trx.select('*')
                                .from('log_connection')
                                .where({
                                    student_id: user[0].id,
                                    tutor_id: tutor_id
                                })
                                .then(log=>{
                                    if (log[0] === undefined){
                                        return trx('log_connection')
                                        .returning('*')
                                        .insert({
                                            log_date: logDate,
                                            student_id: user[0].id,
                                            tutor_id: tutor_id
                                        })
                                        .then(ret=>{
                                            res.json(ret);
                                        })
                                    }
                                    else{
                                        return trx('log_connection')
                                        .where('log_date','=',log[0].log_date)
                                        .update({
                                            log_date: logDate,
                                        })
                                        .then(ret=>{
                                            res.json(ret);
                                        })
                                    }
                                })
                            })
                            .then(trx.commit)
                            .catch(trx.rollback)
                        })
                    }
                    )
               })
        })
    })
})

// Square Payment
app.post('/process-payment',(req,res)=>{
	var {nonce,id,hours_added} = req.body;

	var idempotency_key = require('crypto').randomBytes(64).toString('hex');

	// Charge the customer's card
	var transactions_api = new SquareConnect.TransactionsApi();
	var request_body = {
		card_nonce: nonce,
		amount_money: {
			amount: 0, // $0.00 charge
			currency: 'USD'
		},
		idempotency_key: idempotency_key
    };
    console.log("Json")
	transactions_api.charge("GPW35V7F3C52M", request_body).then(function(data) {
        db.select('*')
        .from('student_hours')
        .where('id','=',id)
        .then(entry=>{
            db('student_hours')
            .where('id','=',id)
            .update({hours_remaining: entry[0].hours_remaining+hours_added})
            .then(()=>{
                var json= JSON.stringify(data);
                res.json({
                    'title': 'Payment Successful',
                    'result': json
            })});
	}, function(error) {
		res.json({
			'title': 'Payment Failure',
			'result': error.response.text
		});
	});

});
})

module.exports = app;