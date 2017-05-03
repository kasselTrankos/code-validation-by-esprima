var linter = require("eslint").linter,
	fs = require('fs'),
	CLIEngine = require("eslint").CLIEngine,
	espree = require('espree'),
    SourceCode = require("eslint").SourceCode;
 var srcCode = fs.readFileSync('code1.js');
 var ast = espree.parse(srcCode.toString(), { tolerant: true, loc: true, range:true });
 //
 //var code = new SourceCode(srcCode, ast);
//console.log(ast);
var espree = require('espree');
var cli = new CLIEngine({
    rules: {
        'comma-dangle': 'error'
    },
    rulePaths:['lib/rules'],
    fix: true
});
var report = cli.executeOnFiles(["revisa/categorizationFulfillmentCP_controller.js", 'revisa/']);
var formatter = cli.getFormatter();
console.log(formatter(report.results));
CLIEngine.outputFixes(report);