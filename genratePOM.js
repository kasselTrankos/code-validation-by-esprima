var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    dir = require('node-dir');
var _modules = '',
_xml =`<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.telefonica.coco.pom</groupId>
        <artifactId>pom-Angular</artifactId>
        <version>1.1.0-7</version>
    </parent>
    <groupId>com.telefonica.prcl.cgt</groupId>
    <artifactId>cgt</artifactId>
    <version>3.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <name>cnt-ManageCPInformation</name>
    <properties>
        <revision>2</revision>
        <entrega>1</entrega>
        <tecnologia.implementacion>JEE</tecnologia.implementacion>
        <tipo.activo>cnt</tipo.activo>
        <cnt.name>ManageCPInformation</cnt.name>
        <cnt.target>wls</cnt.target>
        <m2eclipse.wtp.contextRoot>CGT</m2eclipse.wtp.contextRoot>
    </properties>
    <build>
        <plugins>
            <plugin>
                  <groupId>org.apache.maven.plugins</groupId>
                  <artifactId>maven-jar-plugin</artifactId>
                  <version>2.6</version>
            </plugin>
        </plugins>
    </build>
    <modules>
        {{modules}}
    </modules>
</project>`
;
var push = function(filename){
    var _path = path.relative(process.cwd(), filename);
    if(_path!=='pom.xml'){
        _modules+=`\n\t\t<module>${path.dirname(_path)}</module>`;
    }

};
dir.readFiles(process.cwd(), {
    match: /^pom.xml$/,
    exclude: ['target', 'test']
    }, function(err, content, filename, next) {
        if (err) throw err;
        if(!(/test/.test( filename) || /target/.test(filename))) {
            if(/pom.xml$/.test(filename)){
                push(filename);
            }
        }
        next();
    },
    function(err, files){
        if (err) throw err;
        var xml = _xml.replace(new RegExp(/\{\{modules\}\}/, 'g'), _modules);
        fs.writeFile('pom.xml', xml, (err) => {
            if (err) throw err;

            console.log("The file was succesfully saved!");
        });
    }
);
