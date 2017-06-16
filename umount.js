var jsonfile = require('jsonfile'),
    fs = require   ('fs'),
    esprima = require('esprima');

var umount = function(node, callback){
    /*var _node = getLast(node);
    fs.writeFile(`nnn.js`, escodegen.generate(_node), function(err) {

    });*/
    //callback();
    callback('done');
}
var getLast = function(node, parent, key){
    if (key == 'parent') return;
    Object.keys(node).forEach(function(key) {
        if (key == 'parent') return;
        var child = node[key];
        if (Array.isArray(child)) {
            child.forEach(function(c, k) {
                if (c && typeof c.type === 'string') {
                    getLast(c, child, k);
                }
            });
        } else if (child && typeof child.type == 'string') {
            getLast(child, node, key);
        }
      // `prop` is the property name
      // `data[prop]` is the property value
    });
    return node;
}

module.exports = umount;