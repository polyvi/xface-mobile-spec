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

/**
 * cmd表示一个命令，数组类型，第一个元素为命令名称，第二个元素为命令的参数
 * Example: ['xmen', ['create', '.', 'com.polyvi.test', 'HelloTest']]
 */
function spawn(cmd, callback) {
    var output = '', error = '',
        opt = [];
    (cmd.length > 1) && (opt = cmd[1]);
    console.log('Executing command "' + [cmd[0]].concat(opt).join(' ') + '"...');
    var child = child_process.spawn(cmd[0], opt);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        output += data;
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        error += data;
    });
    child.on('close', function(code) {
        if(code === 0) {
            callback(null, output, null);
        } else {
            callback(new Error(error), null, error);
        }
    });
}

function exec(cmds, callback) {
    if(!Array.isArray(cmds[0])) {
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
            spawn(cmds[index], next);
        } else {
            stdout = stdout || '';
            callback(null, stdout.trim());
        }
    };
    spawn(cmds[index], next);
}

/**
 * 导出mobile-spec
 */
function exportSpecTest(projPath, dependenciesPluginPath) {
    var cmds = [
            ['xmen', ['create', '.']],
            ['xmen', ['plugin', 'add', dependenciesPluginPath]]
        ],
        matchData,
        re = /<dependency.*name\s*=\s*"(.*?)".*?\/>|<dependency.*url\s*=\s*"(.*?)".*?\/>/gm;
    var content = fs.readFileSync(path.join(dependenciesPluginPath, 'plugin.xml'), 'utf-8');
    while((matchData = re.exec(content))) {
        var name = matchData[1],
            url = matchData[2];
        if(url) {
            (url.indexOf('.') == 0) && (url = path.join(dependenciesPluginPath, url));
            cmds.push(['xmen', ['plugin', 'add', url]]);
        } else if(name) {
            cmds.push(['xmen', ['plugin', 'add', name]]);
        }
    }
    cmds.push(['xmen', ['app', 'export', projPath]]);
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
    var cmds = [
        ['xmen', ['create', '.', 'com.polyvi.test HelloTest']],
        ['xmen', ['platform', 'add'].concat(platforms)],
        ['xmen', ['plugin', 'add', dependenciesPluginPath]],
        ['xmen', ['app', 'add', 'test']]
    ];
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
        cmds.push(['xmen', ['build', p, '-p', config]]);
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
