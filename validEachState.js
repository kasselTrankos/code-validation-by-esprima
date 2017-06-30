var fs = require('fs'),
    stateValidator = require('./lib/state/validation'),
    path = require('path'),
    colors = require('colors'),
    eswalk = require('eswalk'),
    esprima = require('esprima'),
    traverse = require("ast-traverse"),
    esquery = require('esquery'),
    dir = require('node-dir'),
    umount = require('./umount'),
    escodegen = require('escodegen'),
    CircularJSON = require('circular-json'),
    util = require('util'),
    recursive = require('recursive-readdir'),
    jsonfile = require('jsonfile'),
    esmangle = require('esmangle'),
    estraverse = require('estraverse'),
    readline = require('linebyline'),
    escope = require('escope'),
    params = require('./lib/state/params');


function query(node, callback){
    var _q = 'CallExpression [callee.property.name="state"]';
    var _m = esquery(node, _q);
    var _err = [], safe = true;

    if(_m.length>0){
        jsonfile.writeFile(`m0.json`,  _m[0], {spaces: 4}, function(err, obj) {});

        for(var i =0; i<_m.length; i++){
            params(_m[i].arguments, _m[i].arguments[0].loc, function(e){
                if(e.safe===false) safe = false;
                _err.push(e);
            });
        }
    }   
    callback(_err, safe);     
};
var print = function(e, safe, filename){
    console.log(filename);
    if(safe==true){
        console.log(`El state ${filename} esta OK`.green);
        return false;
    }
     console.log(`Corrige los siguientes errores del ${filename}`.cyan);
    for(var i =0 ; i<e.length; i++){
        if(e[i].safe){
            console.log(`\tState: ${e[i].state} OK`.green);
            continue;
        }else{
            console.log(`\tCorrije los erores del State: ${e[i].state}`.gray);
            for(var t = 0; t<e[i].errors.length; t++){
                console.log(`\t\t${e[i].errors[t].reference} en linea ${e[i].errors[t].loc.start.line}`.gray);
            }
        }
        
        
    }
};

function isValid(filename){
    var srcCode = fs.readFileSync(filename);
    var ast = esprima.parse(srcCode.toString(), {
        loc: true
    });
    query(ast, function(e, safe){
        print(e, safe, filename);
    });
};


dir.readFiles(process.cwd(), {
    match: /^app.js$/,
    exclude: ['target', 'test']
    }, function(err, content, filename, next) {
        if (err) throw err;
        if(!(/test/.test( filename) || /target/.test(filename))) {
            if(/app.js$/.test(filename)){
                isValid(filename);
            }
        }
        next();
    },
    function(err, files){
        if (err) throw err;
    }
);