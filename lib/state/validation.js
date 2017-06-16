var esquery = require('esquery'),
	jsonfile = require('jsonfile'),
	eswalk = require('eswalk'),
	_ = require('lodash'),
	fs = require('fs');

var ERR = [];

var validLoadCGS = function(node, rules, callback){
	var _q0 = 'ArrayExpression [callee.property.name="loadCG"]';
    var m0 = esquery(node, _q0);
    var _err = [];
    if(m0.length>0){
    	//console.log(m0[0]);
    	//jsonfile.writeFile(`m0.json`,  m0[0].arguments[0].elements, {spaces: 2}, function(err, obj) {});
    	var elms = m0[0].arguments[0].elements;
    	for(var i =0; i<elms.length; i++){
    		if(!isInLoadCGs(elms[i], rules.loadCG)){
    			_err.push({
    				title: `Falta de importar la dependencia, o esta mal importada: "${elms[i].properties[0].value.value}"`,
    				loc: elms[i].loc
    			});
    		}
    	}
        //jsonfile.writeFile(`m0.json`,  m0[0].arguments[0].elements, {spaces: 2}, function(err, obj) {});
    }
    callback(_err);
};

var validLoadModule = function(node, rules, callback){
	var _q0 = '[callee.property.name="loadModule"]';
    var m0 = esquery(node, _q0);
    var _err = [], _act = [];

    if(m0.length>0){
    	//jsonfile.writeFile(`m0.json`,  m0[0].arguments[0].elements, {spaces: 2}, function(err, obj) {});

    	for(var i =0; i<m0.length; i++){

    		if(!isInRules(m0[i].arguments[0].value, rules.loadModule)){
    			_err.push({
    				title: `Sobra el module: "${m0[i].arguments[0].value}"`,
    				loc: m0[i].loc
    			});
    		}else{
    			_act.push({
    				str: m0[i].arguments[0].value,
    				loc: m0[i].loc
    			});
    		}
    	}
    }
    for(var t =0; t<rules.loadModule.length; t++){
		if(!isInArr(rules.loadModule[t], _act)){
			_err.push({
				title: `Falta de añadir el module: "${rules.loadModule[t]}"`
			});
		}
	}
    callback(_err);
}
var validProperties = function(ast, rules, callback){
	var _err = [], _url = false, _params = false, _paramsValues = [];
	eswalk(ast, function(node, parent) {
		//url
		if(node.type=='Property' &&
			node.key &&
			node.key.name=='url'){
			_url =true;
			if(node.value.value!=rules.url){
				_err.push({
					title: `URL mal definida es "${node.value.value}" y debiera ser "${rules.url}"`
				});
			}
		}
		if(node.type=='Property' &&
			node.key &&
			node.key.name=='params'){
			_params =true;
			if(node.value.type == 'ObjectExpression' &&
				node.value.properties &&
				node.value.properties.length>0){

				for(var i=0; i<node.value.properties.length;i++){
					_paramsValues.push(node.value.properties[i].key.name);
				}
				if(!_.isEqual(_paramsValues.sort(), rules.params.sort())){
					var str = '';
					for(t =0; t<rules.params.length; t++){
						str+='{';
						str+=''+rules.params[t]+': null'
						if(t<rules.params.length-1){
							str+=',';
						}
						str+='}';
					}
					_err.push({
						title: `Tienes mal los params, revisa como debe quedar:  "${str}"`
					});
				}

			}

		}
		//prams
	});
	if(!_url){
		_err.push({
			title: `No esta definido la url, ??? grave`
		});
	}
	if(!_params){
		_err.push({
			title: `No esta definido los params????, ??? grave`
		});
	}
	callback(_err);
};
var validLoadCommonComponent = function(node, rules, callback){
	var _q0 = '[callee.property.name="loadCommonComponent"]';
    var m0 = esquery(node, _q0);
    var _err = [], _act = [];
    jsonfile.writeFile(`m0.json`,  m0[0], {spaces: 2}, function(err, obj) {});

    if(m0[0].arguments &&
    	m0[0].arguments.length>0 &&
    	m0[0].arguments[0].elements &&
    	m0[0].arguments[0].elements.length>0){
    	if(m0[0].arguments[1]){
    		m0[0].arguments[0].elements.push(m0[0].arguments[1]);
    	}

    	for(var i =0; i<m0[0].arguments[0].elements.length; i++){

    		if(!isInRules(m0[0].arguments[0].elements[i].value, rules.loadCommonComponent)){
    			_err.push({
    				title: `Sobra el module: "${m0[0].arguments[0].elements[i].value}"`,
    				loc: m0[0].arguments[0].elements[i].loc
    			});
    		}else{
    			_act.push({str: m0[0].arguments[0].elements[i].value, loc: m0[0].arguments[0].elements[i].loc});
    		}
    	}
    }

	for(var t =0; t<rules.loadCommonComponent.length; t++){
		if(!isInArr(rules.loadCommonComponent[t], _act)){
			_err.push({
				title: `Falta de añadir el module: "${rules.loadCommonComponent[t]}"`
			});
		}
	}

    callback(_err);
}
var isInArr= function(item, arr){
	for(var i = 0;i<arr.length; i++){
		if(arr[i].str===item){
			return true;
		}
	}
	return false;
};
var isInRules = function(item, arr){
	for(var i = 0;i<arr.length; i++){
		if(arr[i]===item){
			return true;
		}
	}
	return false;
}
var isInLoadCGs = function(item, rules){
	for(var i = 0;i<rules.length; i++){
		if(rules[i].name===item.properties[0].value.value && rules[i].tipos==item.properties[1].value.value){
			return true;
		}
	}
	return false;
}
var loadRules = function(state, callback){
	jsonfile.readFile(`./patternStates/${state}.json`, function(err, obj) {
	  	callback(obj)
	})
}



var validation = function(state, node, callback){
	loadRules(state, function(rules){
		var _err = {
			loadCG: [],
			loadModule:[],
			loadCommonComponent:[],
			properties: []
		};
		validLoadCGS(node, rules, function(err){
			_err.loadCG = err;
		});
		validLoadModule(node, rules, function(err){
			_err.loadModule = err;
		});
		validLoadCommonComponent(node, rules, function(err){
			_err.loadCommonComponent = err;
		});
		validProperties(node, rules, function(err){
			_err.properties = err;
		});
		jsonfile.writeFile(`errores forzados.json`, _err, {spaces: 2}, function(err, obj) {});
	});
};


module.exports = validation;
