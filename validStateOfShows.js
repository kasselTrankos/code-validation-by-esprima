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
    stateValidator(getState(), node);
}

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
    //console.error('ASXD;DFASKIDASRFKIDSGFIDFSGOIg',_states);

    if(!_states){
        console.error('no _states');
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
        ValidateState(_obj);

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