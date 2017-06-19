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
    escope = require('escope');

var __m = 0;
var __states = [];
function ValidateState(node, filename){
    var _state = getState();
    var _cnt = getNameOfCNT(filename);
    stateValidator(getState(), node, function(err){

        console.log(`Validando state ${_state} CNT ${_cnt}`.yellow);
        var _s = 1;
        for(var i =0; i<err.loadCG.length;i++){
            console.log(`\t(${_s}) ${err.loadCG[i].title} en la linea ${err.loadCG[i].loc.start.line}`.grey);
            _s++;
        }
        for(var i =0; i<err.loadModule.length;i++){
            console.log(`\t(${_s}) ${err.loadModule[i].title} en la linea ${err.loadModule[i].loc.start.line}`.grey);
            _s++
        }

    });
}
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
var getState = function(){
    for(var i =0; i<process.argv.length; i++){
        if(process.argv[i]=='-s'){
            return process.argv[i+1];
        }
    }
    return false;
}
function isValid(filename){
    var srcCode = fs.readFileSync(filename);
    var ast = esprima.parse(srcCode.toString(), {
        loc: true
    });

    var _states;
    ///primero busco el STATE.
    eswalk(ast, function(node, parent) {
        if (node.type == 'ExpressionStatement' &&
            node.expression.type == 'CallExpression' &&
            node.expression.callee &&
            node.expression.callee.property &&
            node.expression.callee.property.name &&
            node.expression.callee.property.name == 'state') {
            //fs.writeFile('mierda.js' , escodegen.generate(node), function(err){});
            //jsonfile.writeFile(`all_states.json`, node, {spaces: 2}, function(err, obj) {});
            //console.log(node.expression.arguments);
            eswalk(node, function(_node, _parent){

               if (_node.type== 'CallExpression' &&
                _node.arguments &&
                _node.arguments[0] &&
                _node.arguments[0].value==getState()) {
                    _states = _node;

                }
            });
        }
    });

    if(!_states){
        var _state = getState();
        var _cnt = getNameOfCNT(filename);
        console.error(`No hay el state ${_state} en CNT ${_cnt}`.green);
        return false;
    }
    umount(_states, function(node, parent){
        ///se crea el JS del STATE todo muy clean :)
        var _obj = {
            "type": "Program",
            "body": [
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": "$stateProvider"
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "state"
                            }
                        },
                        "arguments":  _states.arguments
                    }
                }
            ],
            loc: _states.callee.loc,
            "sourceType": "script"
        };
        ///fs.writeFile('joderse.js' , escodegen.generate(_obj), function(err){});
        ValidateState(_obj, filename);
    });
}

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