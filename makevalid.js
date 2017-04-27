/*
 * Copyright (c) 2012 Sergej Tatarincev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE , ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
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

var pushed = [];
let parentChain = [];
var oks = 0;
var cGetSpinner = 0;
var OP = '';
var SERV = '';
var getSpinners = [];
var closeSpinners = [];
var count = 0;
var toFile = '';

function gotOkPopupServices(node){
    if(OP==='getFile') return;
    var m = esquery(node, 'BlockStatement [arguments.0.name="$scope"]');
    var q = esquery(node, '[property.name="getSpinner"]');
    var s = esquery(node, 'FunctionExpression [property.name="CloseSpinner"]');

    var qh = esquery(node, '[property.name="openSpinner"]');
    var sh = esquery(node, 'FunctionExpression [property.name="closeSpinner"]');
    var _closeWithScope = false;

    if(m.length>1){
        for(var i=0; i<m.length; i++){
            if(m[i].callee
                && m[i].callee.property
                && m[i].callee.property.name
                && m[i].callee.property.name==='CloseSpinner'){
                _closeWithScope = true;
                break;
            }
        }
    }
    if((q.length===1 && m.length>0) || (qh.length===1)){

        getSpinners.push({
            str: SERV+'.'+OP,
            valid: true
        });
        cGetSpinner++;
    }else{
        getSpinners.push({
            str: SERV+'.'+OP,
            valid: false,
            loc: node.loc,
            sinScope:(m.length===0 && q.length===1 && qh.length===0)
        });
    }
    if(s.length===2 || sh.length===2){
        closeSpinners.push({
            str: SERV+'.'+OP,
            valid: true,
            removeSpiner: _closeWithScope
        });
    }else{
        closeSpinners.push({
            str: SERV+'.'+OP,
            valid: false,
            loc: node.loc,
            closes: s.length,
            removeSpiner: _closeWithScope
        });
    }

};

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


function ValidPopups (filename){
    //var filename = process.argv[2];
    var srcCode = fs.readFileSync(filename);
    var ast = esprima.parse(srcCode.toString(), {
        loc: true
    });
    estraverse.traverse(ast, {
        enter: function(node, parent) {
            if(node.type==='ExpressionStatement'){
                if(ValidateNode(node, filename)){
                    pushed.push(node);
                    gotOkPopupServices(node);


                    count++;
                }
            }
        }
    });
};
var toHtml = [];
var _tpl = '<html>\
    <head>\
        <meta charset="UTF-8">\
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">\
    </head>\
    <body>\
        <h1>Revisión uso PopupService en PRCL</h1>\
        <div class="row">\
            <div class="col-md-1"></div>\
            <div class="col-xs-9">\
                {{content}}\
            </div>\
            <div class="col-md-1"></div>\
        </div>\
    </body>\
</html>';
var popups ='<div class="panel panel-default">\
                <div class="panel-heading">\
                    <h3 class="panel-title">{{title}}</h3>\
                </div>\
                {{getSpinner}}\
                {{CloseSpinner}}\
            </div>';
var lists = '<div class="panel-body">\
                <h4>{{title}}</h4>\
                <ul class="list-group">\
                  {{elements}}\
                </ul>\
            </div>';

function showConsoleData(filename){
    console.log(colors.yellow('\n\n\nValidando el archivo: '+filename+'\n'));
    colors.setTheme({
      customError: ['red', 'underline', 'bgWhite'],
      counter: ['blue', 'underline', 'bgWhite']
    });

    console.log('PopupService.getSpinner($scope)');
    var ok = 0;
    var kos = 0;
    for(var i =0; i<getSpinners.length;i++){
        if(getSpinners[i].valid===true){
            ok++;
            console.log('\t', getSpinners[i].str.green);
        }else{
            kos++;
            var addStr = getSpinners[i].str+' line '+getSpinners[i].loc.start.line;
            if(getSpinners[i].sinScope){
                addStr += ' (sin $scope como parámetro) line '+getSpinners[i].loc.start.line;
            }
            console.log('\t', addStr.customError);
        }
    }
    console.log('\n\t\tOK:'+ok+'    KO:'+String(kos).cyan );
    ok = 0;
    var ckos = 0;
    console.log('\nPopupService.CloseSpinner()');
    for(var i =0; i<closeSpinners.length;i++){
        if(closeSpinners[i].valid===true){
            ok++;
            if(closeSpinners[i].removeSpiner){
                closeSpinners[i].str+=" /// Este método no lleva parametros.";
            }
            console.log('\t', closeSpinners[i].str.green);
        }else{
            ckos++;
            var _str=closeSpinners[i].str+' ('+closeSpinners[i].closes+' de 2) line '+closeSpinners[i].loc.start.line;
            if(closeSpinners[i].removeSpiner){
                _str+=" /// Este método no lleva parametros.";
            }
            console.log('\t', _str.customError);
        }
    }
    console.log('\n\t\tOK:'+ok+'    KO:'+String(ckos).cyan );
    console.log('\n\nTOTAL : '+ count);
    toHtml.push({
        title: filename,
        errGetSpinners: kos,
        errCloseSpinners: ckos,
        getSpinners:getSpinners,
        closeSpinners:closeSpinners,
        total: count
    });
    closeSpinners = [];
    getSpinners = [];
    count=0;

}
function generateHTML(){
    var html = '';

    for(var i=0; i<toHtml.length; i++){
        var tpl = (' ' + popups).slice(1);

        tpl = tpl.replace(/{{title}}/, toHtml[i].title);
        var list = (' ' + lists).slice(1);
        var ok = 0;
        var kos = 0;
        var element = '';
        for(var t=0; t<toHtml[i].getSpinners.length;t++){
            var _err = (toHtml[i].errGetSpinners>0) ? ' / '+toHtml[i].errGetSpinners : '';
            list = list.replace(/{{title}}/, 'PopupService.getSpinner($scope)'+_err);

            if(toHtml[i].getSpinners[t].valid===true){
                ok++;
                element+='<li class="list-group-item list-group-item-success">'+toHtml[i].getSpinners[t].str+'</li>';
            }else{
                kos++;
                var addStr = toHtml[i].getSpinners[t].str+' line '+toHtml[i].getSpinners[t].loc.start.line;
                if(toHtml[i].getSpinners[t].sinScope){
                    addStr += ' (sin $scope como parámetro) line '+toHtml[i].getSpinners[t].loc.start.line;
                }
                element+='<li class="list-group-item list-group-item-danger">'+addStr+'</li>'
            }
        }
        list = list.replace(/{{elements}}/, (kos===0)? '<li class="list-group-item list-group-item-success">Sin errores</li>':element);

        tpl = tpl.replace(/{{getSpinner}}/, list);
        list = (' ' + lists).slice(1);
        element = '';
        for(t=0; t<toHtml[i].closeSpinners.length;t++){
            var _err = (toHtml[i].errCloseSpinners>0) ? ' / '+toHtml[i].errCloseSpinners : '';
            list = list.replace(/{{title}}/, 'PopupService.CloseSpinner()'+_err);
            if(toHtml[i].closeSpinners[t].valid===true){
                ok++;

                if(toHtml[i].closeSpinners[t].removeSpiner){
                    toHtml[i].closeSpinners[t].str+=" /// Este método no lleva parametros.";
                }
                element+='<li class="list-group-item list-group-item-success">'+toHtml[i].closeSpinners[t].str+'</li>';
            }else{
                kos++;
                var _str=toHtml[i].closeSpinners[t].str+' ('+toHtml[i].closeSpinners[t].closes+' de 2) line '+toHtml[i].closeSpinners[t].loc.start.line;
                if(toHtml[i].closeSpinners[t].removeSpiner){
                    _str+=" /// Este método no lleva parametros.";
                }
                element+='<li class="list-group-item list-group-item-danger">'+_str+'</li>'
            }

        }
        list = list.replace(/{{elements}}/, (kos===0)? '<li class="list-group-item list-group-item-success">Sin errores</li>':element);
        tpl = tpl.replace(/{{CloseSpinner}}/, list);

        html+=tpl;

    }
    var generatedHTML = _tpl.replace(/{{content}}/, html);
    fs.writeFile('popupService.html', generatedHTML, function (err) {
        if (err)
            return console.log(err);
        console.log('Hello World > helloworld.txt');
    });
};




var allfiles = [];
dir.readFiles(process.cwd(), {
    match: /_controller.js$/,
    exclude: ['target', 'test']
    }, function(err, content, filename, next) {
        if (err) throw err;
        if(!(/test/.test( filename) || /target/.test(filename))) {
            ValidPopups(filename);
            showConsoleData(filename);
        }

        next();
    },
    function(err, files){
        if (err) throw err;
        generateHTML();
        //console.log('finished reading files:',files);
        //allfiles = files;
        //console.log(allfiles);
});
