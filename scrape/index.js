const rp = require('request-promise');
const cheerio = require('cheerio');

const options = {
  uri: 'www.google.com',
  transform: function (body) {
    return cheerio.load(body);
  }
};


rp(options)
    .then(function (data) {
    	// console.log(data);
      var result = data('#advisory-violence').children('.ipl-zebra-list').children('.ipl-zebra-list__item').text();
      console.log(result);

	// REQUEST SUCCEEDED: DO SOMETHING
    })
    .catch(function (err) {
        console.log("fail");
	// REQUEST FAILED: ERROR OF SOME KIND
    });


// rp(options);
// 
