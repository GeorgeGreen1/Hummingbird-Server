const express = require('express');
const bodyparser = require('body-parser');

//Enable express
const app = express();

//Enable body parser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.post('/rodgers',(req,res)=>{
    console.log(req.body)
    res.send('Success');
})

app.get('/playerone',(req,res)=> {
    res.send("Fliffingthwick Edgersbrattley");
});
app.get('/playertwo',(req,res)=> {
    res.send("Knightingsbarrow Toffington");
});
app.get('/playerthree',(req,res)=> {
    res.send("John Mallettsby-Gray");
});
app.get('/playerfour',(req,res)=> {
    res.send("David East Burrington Longmeritshire");
});

app.listen(3000);