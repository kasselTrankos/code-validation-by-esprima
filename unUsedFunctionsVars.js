var dir = require('node-dir'),
	fs = require('fs'),
	path = require('path'),
	colors = require('colors'),
	jshint = require('jshint').JSHINT;

function jshinter(filename){
	var name = path.basename(filename);
	fs.readFile(filename, function(err, data) {
		if(err) {
                console.log('Error: ' + err);
                return;
            }

            if(jshint(data.toString(),{
            	unused: true,
            	freeze: true,
            	globals:['CNT']
            })) {
                console.log('File '.green + path.basename(filename) + ' has no errors.  Congrats!'.green);
            } else {

                console.log('');
                var out = jshint.data(),
                	freeze = out.freeze,
                	unused = out.unused,
                    errors = out.errors;
                if(unused){
                	console.log('Errors in file ' + path.basename(filename).yellow);
                	for(var i = 0; i< unused.length; i++){
						console.log('\t - Sin usar!!! ',unused[i].name.grey, ' line ', String(unused[i].line).cyan);
					}

                }
                if(freeze){
                	console.log(freeze);
                }
                console.log('\t-----------------------------------------');
                /*if(errors){
                	for(var j=0;j<errors.length;j++) {
	                    console.log(errors[j].line + ':' + errors[j].character + ' -> ' + errors[j].reason + ' -> ' + errors[j].evidence);
	                }
                }*/
            }

	});
}


dir.readFiles(process.cwd(), {
    match: /_controller.js$|_service.js$/,
    exclude: ['target', 'test']
    }, function(err, content, filename, next) {
        if (err) throw err;
        if(!(/test/.test( filename) || /target/.test(filename))) {
            if(/_controller.js$/.test(filename)){
                jshinter(filename);
            }
        }
        next();
    },
    function(err, files){
        if (err) throw err;
    }
);