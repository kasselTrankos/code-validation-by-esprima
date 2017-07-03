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


function query(ast, callback){
    var _err = [], safe = true;
    eswalk(ast, function(node, parent) {
        if (node.type == 'ExpressionStatement' &&
            node.expression.type == 'CallExpression' &&
            node.expression.callee.property &&
            node.expression.callee.property.name &&
            node.expression.callee.property.name == 'state') {
            eswalk(node, function(_node, _parent){
               if (_node.type== 'CallExpression' &&
                _node.callee &&                            
                _node.arguments &&
                _node.arguments[0] &&
                _node.arguments[0].type &&
                _node.arguments[0].type=='Literal' &&
                _node.arguments[1] &&
                _node.arguments[1].type &&
                _node.arguments[1].type=='ObjectExpression') {
                    params(_node.arguments, _node.arguments[0].loc, function(e){
                        if(e.safe===false) safe = false;
                        _err.push(e);
                    });
                }
            });
        }
    });
    callback(_err, safe);     
    //jsonfile.writeFile(`m0.json`,  _states, {spaces: 4}, function(err, obj) {});
    // var _q = 'MemberExpression [callee.property.name="state"]';
    // var _m = esquery(node, _q);
    // var _err = [], safe = true;

    // if(_m.length>0){
    //     //jsonfile.writeFile(`m0.json`,  _m[0], {spaces: 4}, function(err, obj) {});
        
    //     for(var i =0; i<_m.length; i++){
    //         // fs.writeFile(`file_${i}.js`, escodegen.generate(_m[i]), function (err) {
    //         //     if (err) return console.log(err);
    //         // });
    //         params(_m[i].arguments, _m[i].arguments[0].loc, function(e){
    //             if(e.safe===false) safe = false;
    //             _err.push(e);
    //         });
    //     }
    // }   
    // callback(_err, safe);     
};
var getNameOfCNT = function(filename){
    var e = filename.split(path.sep);
    var patt = new RegExp(/^cnt\-.*/);
    for(var i = 0; i<e.length; i++){
        if(patt.test(e[i])){
            return e[i].split('-')[1];
        }
    }
    return 'no CNT';
};
var print = function(e, safe, filename){
    var _cnt = getNameOfCNT(filename);
    if(safe==true){
        //console.log(`El state ${filename} esta OK`.green);
        return false;
    }
     console.log(`\nCorrige los siguientes errores del CNT ${_cnt}`.cyan);
    for(var i =0 ; i<e.length; i++){
        if(e[i].safe){
            //console.log(`\tState: ${e[i].state} OK`.green);
            continue;
        }else{
            console.log(`\tState:` ,`${e[i].state}`.green);
            for(var t = 0; t<e[i].errors.length; t++){
                console.log(`\t\t(${t+1}) ${e[i].errors[t].reference} en linea ${e[i].errors[t].loc.start.line}`);
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

        if(!(/test/.test( filename) || /target/.test(filename) || /cnt-ManageCPInformation/.test(filename))) {
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