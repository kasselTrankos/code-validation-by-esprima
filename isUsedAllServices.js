var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    esprima = require('esprima'),
    esquery = require('esquery'),
    dir = require('node-dir'),
    escodegen = require('escodegen'),
    CircularJSON = require('circular-json'),
    util = require('util'),
    recursive = require('recursive-readdir'),
    jsonfile = require('jsonfile'),
    esmangle = require('esmangle'),
    estraverse = require('estraverse'),
    escope = require('escope');
var SERV ='';
var _files = [];
function showConsoleData(filename){


}
var _c = 0;
var _ops= [];
var _found = [];
function addOperation(node, name){
    var m = esquery(node, 'AssignmentExpression [object.name="'+name+'"]');
    if(m.length>0
        && node.expression.right
        && node.expression.right.type=="FunctionExpression"){
            _ops.push(node.expression.left.property.name);
        _c++;
    }

}
function findService(node){
    var f = esquery(node, '[object.name="'+SERV+'"]');

    if(f.length>0){
        _found.push(f[0].property.name);
        return true;
    }
    return false;
}
function compareIntoController(filename){
    var srcCode = fs.readFileSync(filename);
    var ast = esprima.parse(srcCode.toString(), {
        loc: true
    });
    var name = path.basename(filename);
    estraverse.traverse(ast, {
        enter: function(node, parent) {
            if(node.type==='ExpressionStatement'){
                findService(node, SERV);
            }
        }
    });
    if(_found.length>0){
        var _founded = false;


        for(var i =0; i<_ops.length;i++){
            _founded = false;
            for(var t = 0; t<_found.length; t++){
                if(_ops[i]===_found[t]
                    || _ops[i]=='saveFilesInNAS'
                    || _ops[i]=='setPreviousData'
                    || _ops[i]=='getPreviousView'
                    || _ops[i]=='getPreviousFunctionality'
                    || _ops[i]=='getPreviousData'){
                    _founded=true;
                }
            }
            if(!_founded){
                //console.log(_ops);
                console.log('\n - sobre el ',name.split('.')[0].split('_')[0].cyan);
                console.log('\tNO existe esta OP ', _ops[i].yellow);
                break;
            }
        }
        if(_founded){
           // console.log('\tTodo Muy bien'.green);
        }

    }
}
function getAllOperations(filename){
    var srcCode = fs.readFileSync(filename);
    var ast = esprima.parse(srcCode.toString(), {
        loc: true
    });
    var name = path.basename(filename);
    SERV = name.split('_')[0]+'Service';

    estraverse.traverse(ast, {
        enter: function(node, parent) {
            if(node.type==='ExpressionStatement'){
                addOperation(node, SERV);
            }
        }
    });

}
dir.readFiles(process.cwd(), {
    match: /_controller.js$|_service.js$/,
    exclude: ['target', 'test']
    }, function(err, content, filename, next) {
        if (err) throw err;
        if(!(/test/.test( filename) || /target/.test(filename))) {
            if(/_service.js$/.test(filename)){
                getAllOperations(filename);

                compareIntoController(filename.replace('service', 'controller'));
                _ops = [];
                _found = [];
            }
        }
        next();
    },
    function(err, files){
        if (err) throw err;
    }
);