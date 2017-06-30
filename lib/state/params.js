var esquery = require('esquery'),
	jsonfile = require('jsonfile'),
	esnode = require('esnode'),
	esquery = require('esquery'),
	eswalk = require('eswalk'),
	_ = require('lodash'),
	fs = require('fs');

var validTemplateURL = function(node, name, stateName, callback){
	var _return = true;
	if(!(node.key &&
		node.key.name=='templateUrl' &&
		node.value &&
		node.value.callee.object &&
		node.value.callee.object.name &&
		node.value.callee.object.name=='T3_UrlServiceProvider' &&
		node.value.callee.property &&
		node.value.callee.property.name &&
		node.value.callee.property.name=='loadUrlTemplate' &&
		node.value.arguments &&
		node.value.arguments[0] &&
		node.value.arguments[0].value==stateName)
	){
		_return  = {
			reference: `Revisa la views debe ser esta: templateUrl: T3_UrlServiceProvider.loadUrlTemplate('${stateName}'),`,
			loc: node.loc
		};
	}
	callback(_return);
	return _return;
	//jsonfile.writeFile(`${name}.json`,  node, {spaces: 4}, function(err, obj) {});
};
var validUrl = function(node, name, stateName, callback){
	var _return = true;
	if(node.value.value!==`/${stateName}` ||
		node.value.type!=='Literal'){
		_return  = {
			reference: `La url esta mal definida es "${node.value.value}" y debiera ser "/${stateName}"`,
			loc: node.loc
		}
	}
	callback(_return);
	return _return;
};
var _c =0;
var validViews = function(node, name, stateName, callback){
	var _return = true;
	
	if(!(node.type==='Property' &&
		node.value.properties &&
		node.value.properties[0] &&
		node.value.properties[0].key.value==stateName &&
		node.value.properties[0].value &&
		node.value.properties[0].value.properties &&
		node.value.properties[0].value.properties[0] &&
		node.value.properties[0].value.properties[0].key.name=='templateUrl' &&
		node.value.properties[0].value.properties[0].value &&
		node.value.properties[0].value.properties[0].value.callee &&
		node.value.properties[0].value.properties[0].value.callee.object &&
		node.value.properties[0].value.properties[0].value.callee.object.name=='T3_UrlServiceProvider' &&
		node.value.properties[0].value.properties[0].value.callee.property &&
		node.value.properties[0].value.properties[0].value.callee.property.name=='loadUrlTemplate' &&
		node.value.properties[0].value.properties[0].value &&
		node.value.properties[0].value.properties[0].value.arguments &&
		node.value.properties[0].value.properties[0].value.arguments[0] &&
		node.value.properties[0].value.properties[0].value.arguments[0].value==stateName)
	){
		console.log(node.value.properties[0].value.properties[0].value.callee.property.name);
		_return  = {
			reference: `Revisa la views debe ser esta: views: {
				'${stateName}':{
					templateUrl: T3_UrlServiceProvider.loadUrlTemplate('${stateName}')
				}
			}`,
			loc: node.loc
		};
	}
	callback(_return);
	return _return;
	
};
var validLoadCG = function(node, name, stateName, callback){
	var _existsCG = false;
	var _return = true;
	var _m = esquery(node, 'ArrayExpression [callee.property.name="loadCG"]');
	for(var i=0; i<_m[0].arguments[0].elements.length; i++){
		if(_m[0].arguments[0].elements[i].properties[0].value.value===stateName){
			_existsCG = true;
			break;
		}
	}
	if(!_existsCG){
		_return  = {
			reference: `Incluye la dependencía ${stateName}`,
			loc: _m[0].loc
		};
	}
	callback(_return);
	return _return;
};
var validParams = function(node, name, stateName, callback){
	var _return = true, _returns =[];

	if(node.value.type!=='ObjectExpression'){
		_returns.push({
			reference: `La url esta mal definida es "${node.value.value}" y debiera ser "/${stateName}"`,
			loc: node.loc
		});
	}else{
		var _valid = false;
		for(var i=0; i<node.value.properties.length; i++){
			if(node.value.properties[i].key.name===`cgt${stateName.charAt(0).toUpperCase()+stateName.slice(1)}In`){
				_valid =true;
			}else{
				_returns.push({
					reference: `Que hace este parámetro ${node.value.properties[i].key.name} "cgt${stateName.charAt(0).toUpperCase()+stateName.slice(1)}In`,
					loc: node.value.properties[i].loc
				});
			}
		}
		if(!_valid){
			_returns.push({
				reference: `Te falta este parámetro cgt${stateName.charAt(0).toUpperCase()+stateName.slice(1)}In`,
				loc: node.loc
			});
		}
	}

	callback(_returns);
	return _returns;
};

var params = function(node, loc, callback){
	var _name = node[0].value;
	var _stateName = _name.split('.').slice(-1)[0];
	var _err = [], _existsURL = false, 
	_existsTemplateURL =false, _existsLoadCG = false,
	_existsParams = false, _existsView = false;
	for(var i=0; i<node[1].properties.length; i++){
		if(node[1].properties[i].key.name=='resolve'){
			_existsLoadCG = true;
			validLoadCG(node[1].properties[i], _name, _stateName,  function(e){
				if(e!==true){
					_err.push(e);
				}
			});
		}
		
		if(node[1].properties[i].key.name=='url'){
			_existsURL =true;
			validUrl(node[1].properties[i], _name, _stateName,  function(e){
				if(e!==true){
					_err.push(e);
				}
			});
		}
		if(_name.split('.').length >1 && 
			node[1].properties[i].key.name=='views'){
			_existsView = true;
			validViews(node[1].properties[i], _name, _stateName,  function(e){
				if(e!==true){
					_err.push(e);
				}
			});
		}
		//
		
		if(_name.split('.').length==1 && 
			node[1].properties[i].key.name=='templateUrl'){
			
			_existsTemplateURL = true;
			validTemplateURL(node[1].properties[i], _name, _stateName,  function(e){
				if(e!==true){
					_err.push(e);
				}
			});
		}
		if(node[1].properties[i].key.name=='params'){
			_existsParams = true;
			validParams(node[1].properties[i], _name, _stateName,  function(e){
				for(var i =0; i<e.length; i++){
					_err.push(e[i]);
				}
			});
		}
	}
	if(!_existsURL){
		_err.push({
			reference: `No existe la definición de URL, muy MAL`,
			loc: loc
		});
	}
	if(_name.split('.').length>1 &&
		!_existsView){
		_err.push({
			reference: `No existe la definición de VIEWS, muy MAL`,
			loc: loc
		});
	}
	if(_name.split('.').length==1 &&
		!_existsTemplateURL){
		(node[0]);
		_err.push({
			reference: `No existe la definición de templateUrl!!!, muy MAL`,
			loc: loc
		});
	}
	if(!_existsParams){
		_err.push({
			reference: `No existe la definición de PARAMS, muy MAL`,
			loc: loc
		});
	}
	callback({
		state: _stateName,
		errors: _err,
		safe: _err.length===0
	});
	
};
module.exports = params;