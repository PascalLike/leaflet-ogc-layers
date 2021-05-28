var concat = require('concatenate-files');
var minifier = require('minifier')
var fs = require("fs");

// fs.unlink('dist/OgcMapLayer.js', function(err) {
//    if (err) {
//        return console.error(err);
//    }
// });
// fs.unlink('dist/OgcMapLayer.min.js', function(err) {
//    if (err) {
//        return console.error(err);
//    }
// });

concat([
	'src/OgcLayer.js',
	'src/OgcMapsLayer.js',
	'src/OgcTilesLayer.js',
	], 
	'dist/OgcLayers.js', { separator: ';' }, function(err, result) {

		var input = 'dist/OgcLayers.js'
		minifier.minify(input, {
			output: 'dist/OgcLayers.min.js'
		})
		console.log("Done")

	});

