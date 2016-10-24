/* jshint ignore:start */
var Promise = require('bluebird');
/* jshint ignore:end */
let ESCAPE = require('./escapeChar.js');
let http = require('http');
var req = require('request');
var request = Promise.promisify(req.post);
var ncp = require("copy-paste");
var beep = require('beepbeep');

//====================================================
//  Inject below in console of the browser
//====================================================

// var xhr = new XMLHttpRequest(); document.querySelector('body').addEventListener('keyup', function(e){if(e.keyCode == 67){xhr.open('GET', 'http://localhost:3000/');xhr.send(null); } });

// In the address bar at the right end should be a 'shield' icon, 
//you can click on that to run insecure content.
ncp.copy(`var xhr = new XMLHttpRequest(); 
  document.querySelector('body').addEventListener('keyup', function(e){
    if(e.keyCode == 67){
      xhr.open('GET', 'http://localhost:3000/');
      xhr.send(null); 
    } 
  });`, 
  function(){
    console.log('injection script copied');
});



http.createServer(function(/*req, res*/){
  app();
}).listen(3000);

function app(){
  var str = ncp.paste();
  for(var key in ESCAPE){
    str = str.replace(key, ESCAPE[key]);
  }
  return splitAndClean(str)
    .then((cleanedTexts) => {
      return requestForEach(cleanedTexts);
    })
    .then((array) => {
      var result = joinWithNewLine(array);
      for(var key in ESCAPE){
        result = result.replace(ESCAPE[key], key);
      }
      ncp.copy(result, function () {
        beep();
        console.log(result);
      });
    })
    .catch((err) => {
      beep(2);
      console.log("err :::\n", err);
    });
}




//====================================================
//  Public
//====================================================

function splitAndClean(text){
  var texts = text.split('.');
  var cleanedTexts = texts
    .map((text) => {
      return text.replace(/(\r\n|\n|\r)/gm,"");
    })
    .filter((text) => {
      return !!text;
    });
  return Promise.resolve(cleanedTexts);
}


function requestForEach(array){
  return Promise.resolve(array)
    .then((array)=>{
      return Promise.all(array.map(translate));
    });
}


function joinWithNewLine(array){
  let result = array.join('\n');
  return result;
}

function translate(str) {
  if(str.length > 200){
    return Promise.resolve(str);
  }
  return request({
      url: 'http://labspace.naver.com/api/n2mt/translate',
      form: {
        source:'en',
        target:'ko',
        text: str
      }
    })
    .then((httpResponse) => {
      let translatedText = JSON.parse(httpResponse.body).message.result.translatedText;
      return translatedText;
    });
}



// const readline = require('readline');
// var text = 
// `

// `;

// readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);

// process.stdin.on('keypress', (str, key) => {
//     splitAndClean(ncp.paste())
//       .then((cleanedTexts) => {
//         return requestForEach(cleanedTexts);
//       })
//       .then((array) => {
//         var result = joinWithNewLine(array);
//         ncp.copy(result, function () {
//           console.log(result);
//         });
//       })
//       .catch((err) => {
//         console.log("err :::\n", err);
//       });
// });




