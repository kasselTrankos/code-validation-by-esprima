"use strict";

module.exports = function(context) {
    function validateComma(node, property) {
        var items = node[property];
        //console.log(items.length);
        if(items.length > 1){
            items.forEach(function(item){
                //console.log(item);
            });
        }
    }
  return {
      "VariableDeclaration": function(node) {
       // nodes.VariableDeclaration = function(node) {
            validateComma(node, "declarations");
        //};
      }
  };

};

module.exports.schema = [];