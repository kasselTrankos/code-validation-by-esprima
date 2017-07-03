var esquery = require('esquery'),
	jsonfile = require('jsonfile'),
	esnode = require('esnode'),
	esquery = require('esquery'),
	eswalk = require('eswalk'),
	colors = require('colors'),
	_ = require('lodash'),
	fs = require('fs');
var _plusParams = {
	createEconomicCustomerProblem: ['cgtCategorizeEconomicCPOut'],
	detResolBOFeaAndJustEconomicCP: ['cgtComposeCustomCPNotificationOut'],
	modifyEconomicCustomerProblem: ['cgtCategorizeEconomicCPOut'],
	composeCustomCPNotification: ['cgtEditTemplateOut']
};
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
var isExtraParams = function(name, param, loc, callback){
	var _return = [], _exist = false;
	if(_plusParams[name]){

		for(var i=0; i<_plusParams[name].length; i++){
			if(_plusParams[name][i]==param){
				_exist = true;
			}
		}
		//console.log(name, _plusParams[name], param, _exist);
	}
	callback(_exist);
}
var includeExtraParams = function(name, param, loc, callback){
	var _return = [], _exist = false;
	if(_plusParams[name]){
		for(var i=0;i< _plusParams[name].length; i++){
			if(_plusParams[name][i]==param){
				_noexist = true;
			}
		}
	}
	callback(_exist);
}
var validParams = function(node, name, stateName, callback){
	var _return = true, _returns =[];

	if(node.value.type!=='ObjectExpression'){
		_returns.push({
			reference: `La url esta mal definida es "${node.value.value}" y debiera ser "/${stateName}"`,
			loc: node.loc
		});
	}else{
		var _valid = false;
		var _params = [];
		for(var i=0; i<node.value.properties.length; i++){
			_params.push(node.value.properties[i].key.name);
			if(node.value.properties[i].key.name===`cgt${stateName.charAt(0).toUpperCase()+stateName.slice(1)}In`){
				_valid =true;
			}else{
				var param = node.value.properties[i].key.name;
				isExtraParams(name, param, node.value.properties[i].loc, function(e){

					if(!e){
						_returns.push({
							reference: `Que hace este parámetro ${param} `,
							loc: node.value.properties[i].loc
						});
					}
				})
				// _returns.push({
				// 	reference: `Que hace este parámetro ${node.value.properties[i].key.name} `,
				// 	loc: node.value.properties[i].loc
				// });
			}

			

			
		}
		if(_plusParams[name]){
			for(var i=0;i<_plusParams[name].length; i++){
				_isIn = false;
				for(var t=0; t<_params.length; t++){
					if(_plusParams[name][i]==_params[t]){
						_isIn = true;
					}
				}
				if(!_isIn){
					_returns.push({
						reference: `Te falta este parámetro extra ${_plusParams[name][i]} `,
						loc: node.value.loc
					});
				}
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
	if(_name==='initCNTState' || _name==='initStateCNT'){
		callback({
			state: _name,
			errors: [],
			safe: true
		});
		return false;
	}
	var _stateName = _name.split('.').slice(-1)[0];
	var _err = [], _existsURL = false, 
	_existsTemplateURL =false, _existsLoadCG = false,
	_existsParams = false, _existsView = false;

	for(var i=0; i<node[1].properties.length; i++){
		if(node[1].properties[i].key.name=='resolve' && _name!='initCNTState'){
			_existsLoadCG = true;
			validLoadCG(node[1].properties[i], _name, _stateName,  function(e){
				if(e!==true){
					_err.push(e);
				}
			});
		}
		
		if(node[1].properties[i].key.name=='url' && _name!='initCNTState'){
			_existsURL =true;
			validUrl(node[1].properties[i], _name, _stateName,  function(e){
				if(e!==true){
					_err.push(e);
				}
			});
		}
		if(_name.split('.').length >1 && 
			_name!='initCNTState' &&
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
			_name!='initCNTState' &&
			node[1].properties[i].key.name=='templateUrl'){
			
			_existsTemplateURL = true;
			validTemplateURL(node[1].properties[i], _name, _stateName,  function(e){
				if(e!==true){
					_err.push(e);
				}
			});
		}
		if(node[1].properties[i].key.name=='params' &&
			_name!='initCNTState'
			){
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
		state: _name,
		errors: _err,
		safe: _err.length===0
	});
	
};
module.exports = params;