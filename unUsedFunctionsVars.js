var dir = require('node-dir'),
	fs = require('fs'),
	path = require('path'),
	colors = require('colors'),
	jshint = require('jshint').JSHINT;

function jshinter(filename){
	var name = path.basename(filename);
	/*var source = fs.readFileSync(filename).toString();
	JSHINT([source], {

	  "unused": true
	}, {});
	if(unused){
		console.log('Hay errores en :', name.green);
		console.log('\t Arr is ',JSHINT.data().unused);
		for(var i = 0; i< JSHINT.data().unused.length; i++){
			console.log('\t - function ',JSHINT.data().unused[i].name.cyan, ' line ', String(JSHINT.data().unused[i].line).cyan);
		}

	}*/
	fs.readFile(filename, function(err, data) {
		if(err) {
                console.log('Error: ' + err);
                return;
            }

            if(jshint(data.toString(),{unused: true})) {
                console.log('File '.green + path.basename(filename) + ' has no errors.  Congrats!'.green);
            } else {

                console.log('');
                var out = jshint.data(),
                	unused = out.unused,
                    errors = out.errors;
                if(unused){
                	console.log('Errors in file ' + path.basename(filename).yellow);
                	for(var i = 0; i< unused.length; i++){
						console.log('\t - Sin usar!!! ',unused[i].name.grey, ' line ', String(unused[i].line).cyan);
					}
                	console.log('\t-----------------------------------------');
                }
                /*for(var j=0;j<errors.length;j++) {
                    console.log(errors[j].line + ':' + errors[j].character + ' -> ' + errors[j].reason + ' -> ' + errors[j].evidence);
                }

                // List globals
                console.log('');
                console.log('Globals: ');
                for(j=0;j<out.globals.length;j++) {
                    console.log('    ' + out.globals[j]);
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