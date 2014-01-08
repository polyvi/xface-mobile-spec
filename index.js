var fs = require('fs'),
    path = require('path'),
    child_process = require('child_process'),
    shell = require('shelljs');

function cleanProject(projPath) {
    if(fs.existsSync(projPath)) {
        shell.rm('-rf', projPath);
    }
    shell.mkdir('-p', projPath);
}

function exec(cmds, callback) {
    if(!Array.isArray(cmds)) {
        cmds = [cmds];
    }
    var index = 0;
    var next = function(err, stdout, stderr) {
        if(err) {
            callback(err);
            return;
        } else if(stdout) {
            console.log(stdout);
        }
        index += 1;
        if(index < cmds.length) {
            console.log('Executing command "' + cmds[index] + '"...');
            child_process.exec(cmds[index], {encoding: 'utf-8'}, next);
        } else {
            stdout = stdout || '';
            callback(null, stdout.trim());
        }
    };
    console.log('Executing command "' + cmds[index] + '"...');
    child_process.exec(cmds[index], {encoding: 'utf-8'}, next);
}

/**
 * 导出mobile-spec
 */
function exportSpecTest(projPath, dependenciesPluginPath) {
    var cmds = ['xmen create .',
            'xmen plugin add "' + dependenciesPluginPath + '"'],
        matchData,
        re = /<dependency.*name\s*=\s*"(.*?)".*?\/>|<dependency.*url\s*=\s*"(.*?)".*?\/>/gm;
    var content = fs.readFileSync(path.join(dependenciesPluginPath, 'plugin.xml'), 'utf-8');
    while((matchData = re.exec(content))) {
        var name = matchData[1],
            url = matchData[2];
        if(url) {
            (url.indexOf('.') == 0) && (url = path.join(dependenciesPluginPath, url));
            cmds.push('xmen plugin add ' + url);
        } else if(name) {
            cmds.push('xmen plugin add ' + name);
        }
    }
    cmds.push('xmen app export "' + projPath + '"');
    exec(cmds, function(err, info) {
        if(err) {
            throw err;
        }
        console.log('MobileSpec is exported at path "' + path.join(projPath, 'PluginTestCases.zip') + '".');
    });
}

/**
 * 生成平台安装包
 */
function generateSpecInstaller(projPath, dependenciesPluginPath, platforms, built) {
    var cmds = ['xmen create . com.polyvi.test HelloTest',
        'xmen platform add ' + platforms.join(' '),
        'xmen plugin add "' + dependenciesPluginPath + '"',
        'xmen app add test'];
    var packages = [],
        configFiles = [];
    built && platforms.forEach(function(p) {
        p = p.toLowerCase();
        var config = path.join(projPath, '..', 'build-' + p + '.json');
        var packagePath;
        if(p == 'android') {
            packagePath = path.join(projPath, 'PluginTestCases.apk');
        } else if (p == 'ios') {
            packagePath = path.join(projPath, 'PluginTestCases.ipa');
        } else {
            return;
        }
        configFiles.push(config);
        packages.push(packagePath);
        fs.writeFileSync(config, JSON.stringify({"output": {"package_path": packagePath}}), 'utf-8');
        cmds.push('xmen build ' + p + ' -p ' + config);
    });
    exec(cmds, function(err, info) {
        configFiles.forEach(function(f) {
            fs.existsSync(f) && shell.rm('-f', f);
        });
        if(err) {
            throw err;
        }
        built && console.log('MobileSpec installers are generated successfully at path ' + JSON.stringify(packages));
    });
}

/**
 * 导出mobile-spec或者生成mobile-spec安装包
 */
function main() {
    var args = process.argv,
        platforms,
        built = false,
        index;
    if((index = args.indexOf('--build')) != -1) {
        built = true;
        args.splice(index, 1);
    }
    if(args.length > 2) {
        platforms = args.slice(2);
    }

    var projPath = path.join(__dirname, 'temp-project'),
        dependenciesPluginPath = path.join(__dirname, 'dependencies-plugin');
    cleanProject(projPath);
    shell.cd(projPath);

    if(!shell.which('xmen')) {
        console.error('Can\'t find xmen-cli, you should install it using xsrc.');
        return;
    }

    if(platforms) {
        generateSpecInstaller(projPath, dependenciesPluginPath, platforms, built);
    } else {
        exportSpecTest(projPath, dependenciesPluginPath);
    }
}

main();
