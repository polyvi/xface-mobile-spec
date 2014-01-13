#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    child_process = require('child_process'),
    shell = require('shelljs'),
    et = require('elementtree');

var AUTO_TEST_FRAMEWORK_FILES = [
    'jasmine.css',
    'jasmine.js',
    'test-runner.js',
    'html' /*folder*/
];

/**
 * 获取repo set
 */
function getRepos(dependenciesPluginPath) {
    var repos = [];

    var content = fs.readFileSync(path.join(dependenciesPluginPath, 'plugin.xml'), 'utf-8');
    var doc = new et.ElementTree(et.XML(content));
    var element = doc.getroot();
    var dependencys = element.findall('dependency');

    console.log("---------------all repos-----------------");
    for(var i=0; i< dependencys.length;i++)
    {
        e =   dependencys[i];
        console.log(e.attrib.subdir);
        repos.push(e.attrib.subdir);
    }
    console.log("---------------end repos-----------------");

    return repos;
}

function mergeAutoTestDir(srcDir, destDir) {
    var children = fs.readdirSync(destDir);
    children.forEach(function(child) {
        // framework files are not be processed
        if(AUTO_TEST_FRAMEWORK_FILES.indexOf(child) != -1) return;
        var srcFilePath = path.join(srcDir, child);
        var destFilePath = path.join(destDir, child);

        if('pages' == child && fs.existsSync(destDir, 'pages', 'all.html')) {
            fs.readdirSync(path.join(destDir, 'pages')).forEach(function(c) {
                if(c != 'all.html') shell.cp('-rf', path.join(srcDir, 'pages', c), path.join(destDir, 'pages'));
            });
        }
        else if('tests' == child) {
                fs.readdirSync(destFilePath).forEach(function(js) {
                    shell.cp('-rf', path.join(srcDir, 'tests', js), path.join(destDir, 'tests'));
                });
        }
    });
}

function mergeDir(srcDir, destDir) {
    var srcFilePath = path.join(srcDir, '*');
    shell.cp('-rf', srcFilePath, destDir);
}


function mergeAllDir(srcDir, destDir) {

    destDir = path.join(destDir, 'test');
    if(!fs.existsSync(destDir)) return;

    var children = fs.readdirSync(destDir);

    children.forEach(function(child) {
        // framework files are not be processed

        var srcFilePath = path.join(srcDir, child);
        var destFilePath = path.join(destDir, child);
        if(fs.statSync(destFilePath).isDirectory())
        {
            if(child=='autotest')
            {
                mergeAutoTestDir(srcFilePath, destFilePath);
            } else
            {
                mergeDir(srcFilePath, destFilePath);
            }
        }
    });

 }

/**
 * 将mobile-spec的测试集同步到各个对应的plugin repo
 */
function main() {

    var src = path.join(__dirname, 'cordova-mobile-spec'),
        dependenciesPluginPath = path.join(src, 'dependencies-plugin');
    var pwd  =   __dirname;

    //TODO: check pwd

    var finish = function(err, stdout, stderr) {
        if(err) {
            console.log(err);
        } else if(stdout) {
            var repos = getRepos(dependenciesPluginPath),
                dest;
            repos.forEach(function(repo){
                console.log("------------------------- merge " + repo+"-------------------------------------");
                dest = path.join(pwd, repo);
                mergeAllDir(src, dest);
                console.log('--------------------------- end ' + repo + '----------------------------------');
            })
        }
    }

    if(fs.existsSync(src))
    {
        shell.cd(src);
        child_process.exec('git pull', {encoding: 'utf-8'}, finish );
    } else  {
        child_process.exec('git clone https://github.com/apache/cordova-mobile-spec.git', {encoding: 'utf-8'}, finish);
    }
}

main();
