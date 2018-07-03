const imdb = require('imdb-api');
const key = '93a81067'

// var res = imdb.get({name: 'avatar'}, {apiKey: key, timeout: 3000});
var resp = [];
exports.resp = resp;
movie1 = 'azdf';


module.exports = {
	 
	lookup: function lookup (movie) { imdb.search({name: movie}, {apiKey: '93a81067', timeout: 3000})
		.then( 
			(eps) => {
				// console.log("1: Starting promise");
				module.exports.update(eps.results);
				// console.log("4: Variable updated");

				// console.log("Resp is " + module.exports.resp);
				console.log(eps);
				// if (eps === ImdbError) {
					// console.log()
				// }

				return 20;
			})
		.catch(console.log);
	},

	update: function update(input) {
		// console.log("2: Starting to update variable");
		module.exports.resp = input;
		// console.log("3: Variable updated");
	// console.log("Resp is: \n");
	// console.log(resp);
	},
	resp: resp
}

// console.log(resp);
module.exports.lookup(movie1);
// console.log(module.exports.resp);
// setTimeout(function() {
// 	console.log("Movie.js sees resp as: ");
// 	console.log(module.exports.resp);
//     }, 4000);