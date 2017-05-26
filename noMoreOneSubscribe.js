/*
 * Copyright (c) 2017 Alvaro Touzón
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
    _ = require('lodash'),
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

var _duplicates = [];
var _x = 0;
var _fName = '';
var _fErr = false;
function ValidateNode(node, filename){
    _fName = filename;
    _fErr = false;
    _duplicates = [];
    var m = esquery(node, 'ExpressionStatement [callee.object.name="T3_CommunicationService"] > [type="Literal"]');
    if(m.length>0){

        var _items = [];
        for(var i = 0; i<m.length; i++){
            _items.push(m[i].value);
        }
        if(hasDuplicates(_items)){
            _fErr = true;
            var _dups = getDuplicates(_items);
            var _t = [];
            for(var h = 0; h<_dups.length; h++){
                var text = text = _dups[h];
                var obj = {
                    text: text,
                    locations:[]
                }
                var t = esquery(node, 'ExpressionStatement [callee.object.name="T3_CommunicationService"] [value="'+text+'"]');
                for(var p=0; p<t.length; p++){
                    obj.locations.push(t[p]);
                }
                _t.push(obj);
            }

            /*if(t.length>0){
                jsonfile.writeFile('tttt.jsom', t, {spaces: 2}, function (err) {
                  console.error(err)
                });
            }*/

            _duplicates.push({
                filename:_fName,
                file: filename,
                name: path.basename(filename),
                duplicates: _dups,
                locations: t,
                evts: _t
            });
        }

    }
}
function get_line(filename, line_no, callback) {
    return callback(fs.readFileSync(filename).toString().split("\n")[line_no], line_no);
}
function hasDuplicates(a) {
  return _.uniq(a).length !== a.length;
}
function getDuplicates(array){
    var _f = '';
    var results = [];
    var sorted_arr = array.slice().sort();
    var _is = false;
    for(var i =0; i<array.length; i++){
        if (sorted_arr[i + 1] == sorted_arr[i]) {
            results.push(sorted_arr[i]);
        }

    }
    return  _.uniq(results);
}
function ValidPopups (filename){
    var srcCode = fs.readFileSync(filename);
    var ast = esprima.parse(srcCode.toString(), {
        loc: true
    });
    ValidateNode(ast, filename);
    if(_fErr){
        ConsoleErr();
    }
};
function ConsoleErr(){
    var _err = '';
    var _consoleIt=false;
    var name = '';

    for(var i =0, duplicate = _duplicates[i];  i<_duplicates.length; i++){
        _err+='\n\tExisten Subscrives duplicados sobre el  archivo '+duplicate.name.cyan;

        for(var t =0; t<duplicate.evts.length; t++){
            var _c  = 0;
            var _l = '';
            var _tieneDuplicados = false;

            for( var s=0; s<duplicate.evts[t].locations.length; s++){
                get_line(duplicate.filename, (duplicate.evts[t].locations[s].loc.start.line-1), function(text, line){

                    var patt = new RegExp('subscribe');
                    if(patt.test(text)){

                        _c++;

                        if(_c>1){
                            _tieneDuplicados = true;
                            _consoleIt=true;

                        }
                        _l+='\n\t\t\t '+s+' En la linea '+String(duplicate.evts[t].locations[s].loc.start.line).grey+ ' '+text;
                      }
                });

            }
            if(_tieneDuplicados){
                _err+= '\n\t\t - Se subscribe al evento '+duplicate.locations.length+' veces '+duplicate.evts[t].text.green+' en:';
                _err+=_l;
            }
        }

    }
    if(_consoleIt){
        console.log(_err);
    }else{
       console.log(`\tEl archivo esta OK ${duplicate.name}.`.green);
    }

}
dir.readFiles(process.cwd(), {
    match: /_controller.js$/,
    exclude: ['target', 'test']
    }, function(err, content, filename, next) {
        if (err) throw err;
        if(!(/test/.test( filename) || /target/.test(filename))) {
            if(/_controller.js$/.test(filename)){
                var name = path.basename(filename);

                console.log(`PROCESANDO: ${filename.grey}.`);
                ValidPopups(filename);
                if(!_fErr){
                    console.log(`\tEl archivo esta OK ${name}.`.green);
                    //_fErr = true;
                }
            }

        }

        next();
    },
    function(err, files){
        if (err) throw err;
        /*if(_duplicates.length>0){
            ConsoleErr();
        }*/

});
