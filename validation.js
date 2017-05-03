var esprima = require('esprima'),
	fs = require('fs'),
	esvalid = require("esvalid");
var srcCode = fs.readFileSync('undertakeCPTrendAnalysis_controller.js');
try{
	var syntax = esprima.parse(srcCode.toString(), { tolerant: true, loc: true });
	if(syntax.errors.length > 0){
		var _err = 'Invalid code. Total issues: ' + syntax.errors.length;
	    for (i = 0; i < errors.length; i += 1) {
	        console.log(syntax.errors[i].index, syntax.errors[i].description);
	    }
	}else{
		console.log('no ERROR');
	}
} catch (e) {

    console.log('line', e.lineNumber, e.description);
}

