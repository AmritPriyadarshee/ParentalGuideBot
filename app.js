const PAGE_ACCESS_TOKEN = require('./env_vars.js');
const request = require('request');
const imdb = require('imdb-api');
const rp = require('request-promise');
const cheerio = require('cheerio');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var init = true;
var gsender_psid = 0;

const options = {
  uri: 'www.google.com',
  transform: function (body) {
    return cheerio.load(body);
  }
};


module.exports = {

handleMessage: function handleMessage(sender_psid, received_message) {
  gsender_psid = sender_psid;
  let response;
  var arr = [];
  var text;

  //Introduction
  if (init == true) {
  	response = {"text": "Hi! I'm here to show you what type of content a movie has, so you can decide if it's appropriate to watch. Enter the title of a movie"}
    init = false;
  }

  //Receiving a movie name
  else if (received_message.text) {
  	text = (received_message.text).toLowerCase();

    //User types the exact ImdbId
    if (text[0] == 't' && text[1] == 't') {
      // console.log("Direct ID lookup TODO");
    }
    arr = lookup(text, sender_psid);
  }

  else {
  	console.log('Received unknown event');
    response = {"text": "I'm sorry. I don't recognize what you sent. Please make sure it is text"}
  } 
  
  // Send the response message
  module.exports.callSendAPI(response);    
},


// Handles postback response events
handlePostback: function handlePostback(sender_psid, received_postback) {
  gsender_psid = sender_psid;
  let response;
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload[0] === 't' && payload[1] === 't') {
    console.log("Found " + payload);
    var site = "https://www.imdb.com/title/" + payload + "/parentalguide";
    // console.log(site);

    options['uri'] = site;
    parse();
  }

  else {
  	response = "Something went wrong I think"
    module.exports.callSendAPI(response);
  }

},




// Sends response messages via the Send API
callSendAPI: function callSendAPI(response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": gsender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log("Message sent to user")
    } else {
      console.error("Unable to send message: " + err);
    }
  }); 
}
};



function lookup(movie, sender_psid) {
  console.log(movie);
  var x = [];
  imdb.search({name: movie}, {apiKey: PAGE_ACCESS_TOKEN.api_key, timeout : 3000}).then(
    function(res) {
      console.log("Found it");
      x = res.results;
      make_carousel(x, sender_psid);
    })

  .catch(
    function() {
      console.log("Lookup of movie yielded an error");
      response = {
        "text": "There were no movies found with that title. Please try again."
      }
      module.exports.callSendAPI(response);
    })
}



function make_carousel(input_array, sender_psid) {
  console.log("Making a carousel!");
  console.log(input_array.length);
  console.log(input_array);
  var lib_arr = [];

  //Populate our library
  for (var i = 0; i < input_array.length; i++) {
    var ele = input_array[i];

    var title = ele['title'];
    var id = ele['imdbid'];
    var pic = ele['poster'];
    var imdbid = ele['imdbid'];

    if (pic == "N/A") {
      pic = "https://m.media-amazon.com/images/M/MV5BNzI5OWU0MjYtMmMwZi00YTRiLTljMDAtODQ0ZGYxMDljN2E0XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg"
    }

    // console.log(title, id, pic);

    var lib = {
          "title":title,
          // "image_url":"https://m.media-amazon.com/images/M/MV5BNzI5OWU0MjYtMmMwZi00YTRiLTljMDAtODQ0ZGYxMDljN2E0XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg",
          "image_url":pic,
          // "subtitle":" ",
          "default_action": {
            "type": "web_url",
            "url": "https://www.imdb.com/title/" + imdbid + "/parentalguide",
            "webview_height_ratio": "compact",
          },
          "buttons":[
            {
              "type":"web_url",
              "url":"https://www.imdb.com/title/" + imdbid + "/parentalguide",
              "title":"View Guide on IMDB"
            },{
              "type":"postback",
              "title":"View Guide Here",
              "payload":id
            }              
          ]      
        }

    lib_arr.push(lib);
  }

  //Makes the carousel from the library
  response = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":lib_arr
      }
    }
  }
  module.exports.callSendAPI(response); 


}
var lists = [];

function parse() {
  rp(options)
      .then(function (data) {
        var sex_nudity = data('#advisory-nudity').children('.ipl-zebra-list').children('.ipl-zebra-list__item').text();
        sex_nudity = sex_nudity.replace(/\s+/g, " ");
        sex_nudity = sex_nudity.replace(/Edit/g, "\n");
        sex_nudity = sex_nudity.replace(/\s+/g, " ");

        setTimeout(function() {
          respond(sex_nudity, "Sex & Nudity");
        }, 0); 

        var violence = data('#advisory-violence').children('.ipl-zebra-list').children('.ipl-zebra-list__item').text();
        violence = violence.replace(/\s+/g, " ");
        violence = violence.replace(/Edit/g, "\n");
        violence = violence.replace(/  /g, " ");
        console.log(violence);
        // respond(violence, "Violence & Gore");

        setTimeout(function() {
          respond(violence, "Violence & Gore");
        }, 1000);

        var profanity = data('#advisory-profanity').children('.ipl-zebra-list').children('.ipl-zebra-list__item').text();
        profanity = profanity.replace(/\s+/g, " ");
        profanity = profanity.replace(/Edit/g, "\n");
        profanity = profanity.replace(/\s+/g, " ");
        
        setTimeout(function() {
          respond(profanity, "Profanity");
        }, 2000);

        var drugs = data('#advisory-alcohol').children('.ipl-zebra-list').children('.ipl-zebra-list__item').text();
        drugs = drugs.replace(/\s+/g, " ");
        drugs = drugs.replace(/Edit/g, "\n");
        drugs = drugs.replace(/\s+/g, " ");
        
        setTimeout(function() {
          respond(drugs, "Alcohol, Drugs & Smoking");
        }, 3000);
        var scary = data('#advisory-frightening').children('.ipl-zebra-list').children('.ipl-zebra-list__item').text();
        scary = scary.replace(/\s+/g, " ");
        scary = scary.replace(/Edit/g, "\n");
        scary = scary.replace(/\s+/g, " ");

        setTimeout(function() {
          respond(scary, "Frightening & Intense Scenes");
        }, 4000);
        

        function respond(data, category) {
          response = { 
            "text": category + "\n" + data.substr(0, 600)
            }
          console.log(category + " pt 0");
          module.exports.callSendAPI(response);
          wait(500);
          var i = 1;    
          if (data.length > 600) {
            while (600*(i-1) < data.length) {
              response = { 
              "text": data.substr(600*i, 600*(i+1) - 1)
              }
              
              // wait(500);
              module.exports.callSendAPI(response);
              wait(1000);
              console.log(i);  
              i++; 
            }
          }
        }
        

        })
      .catch(function (err) {
          console.log("fail");
    // REQUEST FAILED: ERROR OF SOME KIND
      });
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
