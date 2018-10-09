const express = require('express');

const app = express();

let id = 6;

let entries = ["Team Name: ","Team Abbreviaton: ", "Head Coach: ","Owner: "];


process.stdout.write("Johny Johny\n");
process.stdin.on('data', x => {
    console.log(x.toString().trim());
})
// process.stdout.write("Eating sugar?\n");

// process.stdout.write("Telling lies?\n");

// process.stdout.write("Open wide\n");

// fetch('http://localhost:3000/search', {
//     method: 'post',
//     headers: {'Content-Type' : 'application/json'},
//     body: JSON.stringify({
//       mainquery: cryptr.encrypt(this.state.searchQuery),
//       exactquery: cryptr.encrypt(this.state.exactQuery),
//     //  omitquery: cryptr.encrypt(this.state.omitQuery)
//     })
//   })