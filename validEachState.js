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

var toHTML = false,
    cdn = 'https://cdnjs.cloudflare.com/ajax/libs/mini.css/2.3.2/mini-default.min.css',
    str = '',
    html = '<html><head><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"></head>';
    html+='<body><h1>State revisión</h1><div class="row"><div class="col-md-8 col-md-offset-1">{body}</div></div></body></html>';
init();
function init(){
    if(process.argv.lastIndexOf('-o')>=0){
        toHTML = true;
    }
}

function query(ast, cnt, callback){
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
                    params(_node.arguments, _node.arguments[0].loc, cnt, function(e){
                        if(e.safe===false) safe = false;
                        _err.push(e);
                    });
                }
            });
        }
    });
    callback(_err, safe);     
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
        return false;
    }
    if(toHTML){
        str+=`<h3>Corrige los siguientes errores del CNT <span class="text-success">${_cnt}</span></h3>`;
    }else{
        console.log(`\nCorrige los siguientes errores del CNT ${_cnt}`.cyan);
    }
    
    for(var i =0 ; i<e.length; i++){
        if(e[i].safe){
            //console.log(`\tState: ${e[i].state} OK`.green);
            continue;
        }else{
            if(toHTML){
                str+=`<div class="row">`;
                str+=`<div class="col-sm-10 col-sm-offset-1">`;
                str+=`<p>State: <span class="text-danger">${e[i].state}</span></p>`;
                str+=`<ol class="col-sm-8 col-sm-offset-1">`;
            }else{
                console.log(`\tState:` ,`${e[i].state}`.green);
            }
            for(var t = 0; t<e[i].errors.length; t++){
                if(toHTML){
                    str+=`<li>${e[i].errors[t].reference} en linea ${e[i].errors[t].loc.start.line}</li>`;
                }else{
                    console.log(`\t\t(${t+1}) ${e[i].errors[t].reference} en linea ${e[i].errors[t].loc.start.line}`);
                }
            }
            if(toHTML){
                str+=`</ol></div></div>`;
            }
        }
    }
};
function isValid(filename){
    
    var srcCode = fs.readFileSync(filename);
    var ast = esprima.parse(srcCode.toString(), {
        loc: true
    });
    query(ast, getNameOfCNT(filename), function(e, safe){
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
        if(toHTML){
            fs.writeFile('resultados.html', html.replace('{body}', str), function(err){});
        }
    }
);