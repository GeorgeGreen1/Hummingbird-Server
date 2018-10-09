var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var season_name = "2018" + "-" + "2019" + "-" + "regular"

let auth = Buffer.from('2d0ff46c-f739-41ed-821a-668c11'+':'+'A101sesame!').toString('base64')
let req = new XMLHttpRequest();
req.open('GET',`https://api.mysportsfeeds.com/v1.0/pull/nfl/${season_name}/daily_player_stats.json?fordate=${'20180910'}&position=${'qb'}`);
req.setRequestHeader('Content-Type','application/json');
req.setRequestHeader('Authorization',`Basic ${auth}`);
req.send();
var body = req.response;
var buudy = JSON.parse(body);

// var pos = 'wr';
// var day = '20180910';
// var season_name = "2018" + "-" + "2019" + "-" + "regular";

// // request Request 
// (function(callback) {
//     'use strict';
        
//     const httpTransport = require('https');
//     const responseEncoding = 'utf8';
//     const httpOptions = {
//         hostname: 'www.mysportsfeeds.com',
//         port: '443',
//         path: `https://api.mysportsfeeds.com/v1.0/pull/nfl/${season_name}/daily_player_stats.json?fordate=${day}&position=${pos}`,
//         method: 'GET',
//         headers: {"Authorization":"Basic " + Buffer.from('2d0ff46c-f739-41ed-821a-668c11'+':'+'A101sesame!').toString('base64') }
//     };
//     httpOptions.headers['User-Agent'] = 'node ' + process.version;
 
//     const request = httpTransport.request(httpOptions, (res) => {
//         let responseBufs = [];
//         let responseStr = '';
        
//         res.on('data', (chunk) => {
//             if (Buffer.isBuffer(chunk)) {
//                 responseBufs.push(chunk);
//             }
//             else {
//                 responseStr = responseStr + chunk;            
//             }
//         }).on('end', () => {
//             responseStr = responseBufs.length > 0 ? 
//                 Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
            
//             callback(null, res.statusCode, res.headers, responseStr);
//         });
        
//     })
//     .setTimeout(0)
//     .on('error', (error) => {
//         callback(error);
//     });
//     request.write("")
//     request.end();
    

// })((error, statusCode, headers, body) => {
//     console.log('ERROR:', error); 
//     console.log('STATUS:', statusCode);
//     console.log('HEADERS:', JSON.stringify(headers));
//     console.log('BODY:', body);
// });

