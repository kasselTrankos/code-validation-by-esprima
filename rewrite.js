var esprima = require('esprima'),
	fs = require('fs'),
    eslint = require('eslint'),
	beautify = require('js-beautify').js_beautify,
	escodegen = require('escodegen');

 var srcCode = fs.readFileSync('undertakeCPTrendAnalysis_controller.js');
 var opts = {
        format: {
            indent: {
                style: '    ',
                base: 0,
                adjustMultilineComment: false
            },
            newline: '\n',
            space: ' ',
            json: false,
            renumber: true,
            hexadecimal: true,
            quotes: 'single',
            escapeless: false,
            compact: false,
            parentheses: true,
            semicolons: true,
            safeConcatenation: false,
            indent : {
              style: "  ",
              base: 0, // equivalent to String.repeat(indent.style, ~~0) under `indent`
              FunctionDeclaration: true, // equivalent to String.repeat(indent.style, ~~true) under `indent`
              Property: ',', // some constants for special styles
              SwitchCase: -1, // possibly even dedents through negative numbers,
              LogicalOR: true

          }
        },

        moz: {
            starlessGenerator: false,
            parenthesizedComprehensionBlock: false,
            comprehensionExpressionStartsWithAssignment: false
        },
        parse: null,
        comment: false,
        sourceMap: undefined,
        sourceMapRoot: null,
        sourceMapWithCode: false,
        file: undefined,
        sourceContent: srcCode.toString(),
        directive: false,
        verbatim: undefined
    };
var syntax = esprima.parse(srcCode.toString(), { tolerant: true, loc: true, range:true });
var nm = { format: {
  indent : {
      style: "  ",
      base: 0, // equivalent to String.repeat(indent.style, ~~0) under `indent`
      FunctionDeclaration: true, // equivalent to String.repeat(indent.style, ~~true) under `indent`
      Property: ',', // some constants for special styles
      SwitchCase: -1 // possibly even dedents through negative numbers
  },
  whitespace: {
    before: {
      CommaObjectExpression : true, // equivalent to "" under `whitespace`
      LogicalExpression: false, // equivalent to " " under `whitespace`
      FunctionDeclaration: "\n", // custom values
      LogicalOR : true,
    },
    after: {
      CommaObjectExpression : true,
      LogicalExpression: true,
      FunctionDeclaration: "\n",
      LogicalOR : false
   }
 }
}}
var newCode = escodegen.generate(syntax, nm);
/**/
/*var options = {
    "indent_size": 4,
    "indent_char": " ",
    "indent_with_tabs": true,
    "eol": "\n",
    "end_with_newline": false,
    "indent_level": 0,
    "preserve_newlines": true,
    "max_preserve_newlines": 10,
    "space_in_paren": false,
    "space_in_empty_paren": false,
    "jslint_happy": true,
    "space_after_anon_function": false,
    "brace_style": "collapse",
    "break_chained_methods": false,
    "keep_array_indentation": false,
    "unescape_strings": false,
    "wrap_line_length": 0,
    "e4x": false,
    "comma_first": false,
    "operator_position": "before-newline"
}*/
fs.writeFile('code11.js', newCode, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});