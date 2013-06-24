var path = require('path');
var JSHINT = require("jshint").JSHINT;
var suffix = 'js';
var nodejsSvnPath = path.normalize('RIA/node');
var option = {
    "bitwise": false, //如果为true，禁用位运算符
    "curly": true, //如果为true，for，if，while等要使用{}来明确代码块
    "eqeqeq": false, //如果为true，所有比较使用3等号
    "evil": true, //如果为true，允许使用eval
    "forin": false, //如果为true，不允许for in在没有hasOwnProperty时使用
    "immed": true, //如果为true，自执行函数要用（）括起来
    "indent": 4, //缩进字符个数
    "latedef": true, //如果为true，不允许先使用后定义
    "laxbreak": true, //如果为true，不检查换行
    "maxerr": 15, //错误阈值
    "maxlen": 120, //每行最多字符数
    "noarg": true, //如果为true，禁用arguments.caller and arguments.callee
    "noempty": false, //禁止出现空代码块
    "nomen": false, //如果为true，不允许在名称首部和尾部加下划线
    "plusplus": false, //如果为true，禁用自增运算和自减运算
    "undef": true, //如果为true，要求所有的非全局变量，在使用前都被声明
    "unused": false, //如果为true，要求所有定义的变量都被使用过
    "trailing": true, //如果为true，不允许代码后面出现尾随的空格
    "asi": false, //如果是false，会检查行尾有没有分号
    "boss": false, //如果为false，不允许在if，for，while里面在比较时编写赋值语句
    "eqnull": true, //如果为false，不允许使用"== null"作比较
    "funcscope": false, //如果为false，不允许访问在if，for，while代码块里面定义的变量
    "loopfunc": true, //如果为false，不允许在循环中定义方法
    "white": false, //如果为false，不会使用严格的空白检查
    "scripturl": true, //如果为false，不允许出现script,比如javascript:...
    "sub": true, //如果为true，允许使用各种下标来访问对象
    "newcap": false, //如果为true，要求使用构造函数生成要用new（不能忘记写new）
    "debug": true, //如果为true，不允许代码中出现debugger的语句
    "supernew": false //如果为false，不允许使用诡异的构造器比如new function() { … }和new Object
};
var globals = {};


var syntaxCheck = function(files) {
    var totalCount = files.length;
    var count = totalCount;
    var jsErrNum = 0;
    var errMsgs = '';
    if (totalCount > 0) {
        var filePath = path.normalize(files[0].name);
        console.log('nodejsSvnPath: ' + nodejsSvnPath);
        console.log('filePath: ' + filePath);
        if (filePath.indexOf(nodejsSvnPath) === 0) {
            option.node = true;
            globals = {
                "lib": true,
                "it": true,
                "describe": true
            };
        } else {
            option.browser = true;
            globals = {
                "Q": true,
                "Qiyi": true,
                "seajs": true,
                "define": true,
                "lib": true,
                "console": true,
                "Flowjs": true,
                "escape": true,
                "alert": true
            };
        }
        console.log(option);
        for (var i = 0; i < count; i++) {
            var file = files[i];
            var source = file.content;
            var fileInfo = '\n    ----FILE : ' + file.name + '----\n';

            var success = JSHINT(source, option, globals);
            if (!success) {
                var errors = JSHINT.errors;
                var len = errors.length;
                jsErrNum += len;
                errMsgs += fileInfo;
                for (var j = 0; j < len; j++) {
                    var err = errors[j];
                    if (err) {
                        var singleErrStr = 'Line ' + err.line + ', Column ' + err.character +
                            ', E ' + err.code + ': ' + err.reason + '\n';
                        errMsgs += singleErrStr;
                    }
                }
            }
        }
    }
    return errMsgs;
};

exports.syntaxCheck = syntaxCheck;