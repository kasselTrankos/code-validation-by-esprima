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
    readline = require('linebyline'),
    escope = require('escope');
var SERV ='';
var _files = [];
var OP = '';
var _ERR = [];

function ValidateNode(node, filename){
    return (node.expression
        && node.expression.right
        && node.expression.right.type
        && node.expression.right.type==='FunctionExpression'
        && findService(node, filename)
        && findThenNode(node)
    );
}

function findService(node, filename){
    var name = path.basename(filename);
    SERV = name.split('_')[0]+'Service';
    var f = esquery(node, '[object.name="'+SERV+'"]');
    if(f.length>0){
        OP = f[0].property.name;
        return true;
    }
    return false;
}
function findThenNode(node){
    var f = esquery(node, '[property.name="then"]');
    if(f.length>0){
        return true;
    }
    return false;
}
function get_line(filename, line_no, callback) {
    return callback(fs.readFileSync(filename).toString().split("\n")[line_no], line_no);

}
function gotTraza(node, file){
    if(OP==='getFile') return;
    var m = esquery(node, 'ExpressionStatement [property.name="setTrazaError"]');

    if(m.length>0){
        get_line(file, (m[0].property.loc.start.line-1), function(text, line){

        var patt = new RegExp('en la llamada al servicio '+OP);
        if(!patt.test(text)){
            _ERR.push({
                serv: SERV,
                op: OP,
                line: line
            });
          }
        });
    }else{
         _ERR.push({
            serv: SERV,
            op: OP,
            line: -1
        });
    }


};
function isTraza(filename){
    var srcCode = fs.readFileSync(filename);
    var ast = esprima.parse(srcCode.toString(), {
        loc: true
    });
    estraverse.traverse(ast, {
        enter: function(node, parent) {
            if(ValidateNode(node, filename)){
                gotTraza(node, filename);
            }
        }
    });
    if(_ERR.length>0){
        console.log('\nRevisa este archivo '+filename.cyan);
        for(var i = 0; i<_ERR.length; i++){
            if(_ERR[i].line===-1){
                console.log('\t EL servicio '+_ERR[i].serv.green+' no esta invovado el T3_TrazaService.setTrazaError en la opreción '+_ERR[i].op.yellow);
            }else{
               console.log('\t EL servicio '+_ERR[i].serv.green+' no tiene traza en la operación '+_ERR[i].op.yellow, ' en la linea: ', _ERR[i].line);
            }

        }
    }
    _ERR.length = 0;

}

dir.readFiles(process.cwd(), {
    match: /_controller.js$|_service.js$/,
    exclude: ['target', 'test']
    }, function(err, content, filename, next) {
        if (err) throw err;
        if(!(/test/.test( filename) || /target/.test(filename))) {
            if(/_controller.js$/.test(filename)){
                isTraza(filename);
            }
        }
        next();
    },
    function(err, files){
        if (err) throw err;
    }
);