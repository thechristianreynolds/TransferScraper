const express = require('express');
const cheerio = require('cheerio');
const http = require('http');
const bodyParser = require('body-parser');
const fs = require('fs');
const request = require('request');
const rp = require('request-promise-native');
const app = express();
app.use(bodyParser);



const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

const url1 = '__EVENTTARGET=gdvInstWithEQ&__EVENTARGUMENT=Page%24'
const url2 = fs.readFileSync('schoolpages.txt').toString();
const courseurl1 = '__EVENTTARGET=gdvInstWithEQ%24ctl';
const courseurl2 = fs.readFileSync('coursepages.txt');

let options = {
    url: 'https://tes.collegesource.com/publicview/TES_publicview01.aspx?rid=1bc75ce2-df3e-4e64-baba-dd0f1eff5628&aid=5a1dd94e-cc36-4f55-81c3-98186e4be965',
    method: 'POST',
    headers: headers,
    body: url1 + '2' + url2 
}

const server = http.createServer(function (req, res) {
    res.write('<h1>We out here</h1>');
    console.log("write to console");
});

server.listen(3000, function () {
    console.log("Server started on port 3000");
});

rp(options)
    .then(function(response) {
        const $ = cheerio.load(response);
        let schoolNames = $('a.gdv_boundfield_uppercase');
        let schools = [];
        for(let i = 0; i < schoolNames.length; i++){
            schools[i] = {
                name: schoolNames.eq(i).text(),
                href: schoolNames.eq(i).attr('href').substring(42, 44),
                courses: ''
            }
        }
        return schools;
    })
    .then(function(response2) {
        for(let i = 0; i < response2.length; i++){
            processData(response2, i)
            .then(function(awaitedcourses) {
                response2[i].courses = awaitedcourses;
                console.log(response2[i]);
            })
        }
    })
    .catch(function(error) {
        console.log(error);
    });

    
async function processData(array, index) {
    try {
        let courseOptions = {
            url: 'https://tes.collegesource.com/publicview/TES_publicview01.aspx?rid=1bc75ce2-df3e-4e64-baba-dd0f1eff5628&aid=5a1dd94e-cc36-4f55-81c3-98186e4be965',
            method: 'POST',
            headers: headers,
            body: courseurl1 + array[index].href + courseurl2 
        }
        let response = await rp(courseOptions);
        const $2 = cheerio.load(response);
        let awaitedcourses = $2('td.gdv_boundfield_uppercase').text().replace(/\s\s+/g, ' ');
        return awaitedcourses;
    } catch (error) {
        
    }
}