define(function(require,exports,module){
    var IC = require('../ic/infoCenter');
    var ic = new IC({moduleName:'Flowjs'});
(function(global){var _qc={};global.Qiyi=global.Qiyi||{};(function (module) {
    var _Object = function() {};
    var proto = {};
    proto.superclass = Object;
    proto.callsuper = function(methodName) {
        var _this = this, args;
        if (!this._realsuper) {
            this._realsuper = this.superclass;
        } else {
            this._realsuper = this._realsuper.prototype.superclass;
        }
        if (typeof methodName == "string") {
            args = Array.prototype.slice.call(arguments, 1);
            _this._realsuper.prototype[methodName].apply(_this, args);
        } else {
            args = Array.prototype.slice.call(arguments, 0);
            _this._realsuper.apply(_this, args);
        }
        this._realsuper = null;
    };
    _Object.prototype = proto;
    module.__2=_Object;
})(_qc);(function (module) {
    var _Object = module.__2;
    var Class = function(data) {
        var superclass = data.extend || _Object;
        var superproto = function() {};
        var plugins = data.plugins || [];
        superproto.prototype = superclass.prototype;
        var constructor = data.construct || function() {};
        var properties = data.properties || {};
        var methods = data.methods || {};
        var statics = data.statics || {};
        var isAbstract = data.isAbstract === true;
        var proto = new superproto();
        var key;
        for (key in proto) {
            if (proto.hasOwnProperty(key)) {
                delete proto[key];
            }
        }
        for (key in properties) {
            proto[key] = properties[key];
        }
        for (key in methods) {
            proto[key] = methods[key];
        }
        for (var i = 0; i < plugins.length; i++) {
            var plugin = plugins[i];
            for (key in plugin) {
                proto[key] = plugin[key];
            }
        }
        if (!isAbstract) {
            for (var method in proto) {
                if (proto[method] == Class.abstractMethod) {
                    throw new Error("Abstract method [" + method + "] is not implement.");
                }
            }
        }
        proto.constructor = constructor;
        proto.superclass = superclass;
        constructor.prototype = proto;
        for (key in statics) {
            constructor[key] = statics[key];
        }
        return constructor;
    };
    Class.abstractMethod = function() {
        throw new Error("Not implement.");
    };
    module.__1=Class;
})(_qc);(function (module) {
    var Class = module.__1;
    var EventPlugin = Class({
        methods: {
            on: function(type, listener) {
                this._ep_createList();
                var realListener = function(ev) {
                    listener(ev);
                };
                type = type.toLowerCase();
                this._ep_lists[type] = this._ep_lists[type] || [];
                this._ep_lists[type].push({
                    type: type,
                    listener: listener,
                    realListener: realListener
                });
                return this;
            },
            un: function(type, listener) {
                this._ep_createList();
                if (type) {
                    type = type.toLowerCase();
                    var listeners = this._ep_lists[type];
                    if (listeners) {
                        var len = listeners.length, isRemoveAll = !listener;
                        if (listeners && listeners.length > 0) {
                            if (isRemoveAll === true) {
                                this._ep_lists[type] = [];
                            } else {
                                listeners.forEach(function(obj, index) {
                                    if (obj.listener === listener) {
                                        listeners.splice(index, 1);
                                    }
                                });
                            }
                        }
                    }
                } else {
                    this._ep_clearList();
                }
                return this;
            },
            fire: function(ev) {
                this._ep_createList();
                var type = ev.type.toLowerCase();
                var data = ev.data;
                var listeners = this._ep_lists[type];
                if (listeners && listeners.length > 0) {
                    listeners.forEach(function(obj, index) {
                        obj.listener({
                            type: type,
                            data: data
                        });
                    });
                }
                return this;
            },
            _ep_clearList: function() {
                this._ep_lists = null;
            },
            _ep_createList: function() {
                if (!this._ep_lists) {
                    this._ep_lists = {};
                }
            }
        }
    });
    module.__4=EventPlugin;
})(_qc);(function (module) {
    var extend = function(target, source) {
        for (var p in source) {
            if (source.hasOwnProperty(p)) {
                target[p] = source[p];
            }
        }
        return target;
    };
    module.__5=extend;
})(_qc);(function (module) {
    module.__9={
        isArray: Array.isArray || function(arg) {
            return Object.prototype.toString.call(arg) == "[object Array]";
        },
        log: function() {
            var args = Array.prototype.slice.call(arguments, 0);
            var str = args.join("");
            ic.log(str);
        },
        error: function() {
            var args = Array.prototype.slice.call(arguments, 0);
            var str = args.join("");
            ic.error(str);
        }
    };
})(_qc);(function (module) {
    var tool = module.__9;
    module.__8={
        check: function(struct, data) {
            var self = this;
            if (!struct) {
                return true;
            }
            var result = true;
            for (var key in struct) {
                var item = struct[key];
                var err;
                if (struct[key].empty !== true && self.isEmpty(struct[key], data[key])) {
                    err = "字段[" + key + "]值为空";
                    tool.error(err);
                    throw new Error(err);
                } else if (struct[key].empty === true && self.isEmpty(struct[key], data[key])) {
                    continue;
                } else if (struct[key].type == "number" && typeof data[key] != "number") {
                    err = "字段[" + key + "]不是数字";
                    tool.error(err);
                    throw new Error(err);
                } else if (struct[key].type == "string" && typeof data[key] != "string") {
                    err = "字段[" + key + "]不是字符串";
                    tool.error(err);
                    throw new Error(err);
                } else if (struct[key].type == "array") {
                    if (!self.checkArray(struct[key], data[key])) {
                        err = "字段[" + key + "]值与定义不符";
                        tool.error(err);
                        throw new Error(err);
                    }
                } else if (struct[key].type == "object") {
                    if (!self.checkObject(struct[key].struct, data[key])) {
                        err = "字段[" + key + "]值与定义不符";
                        tool.error(err);
                        throw new Error(err);
                    }
                }
            }
            return result;
        },
        checkArray: function(rule, data) {
            var self = this;
            if (tool.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (!self.checkData(rule.item, item)) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        checkObject: function(rule, data) {
            return this.check(rule, data);
        },
        isEmpty: function(rule, data) {
            if (data === undefined) {
                return true;
            }
            if (rule.type == "object") {
                return data === null;
            } else if (rule.type == "array") {
                return data.length === 0;
            } else {
                return data === "" || data === undefined || data === null;
            }
        },
        checkData: function(rule, data) {
            if (rule.type == "number" && typeof data == "number") {
                return true;
            } else if (rule.type == "string" && typeof data == "string") {
                return true;
            } else if (rule.type == "boolean" && typeof data == "boolean") {
                return true;
            } else if (rule.type == "array") {
                return this.checkArray(rule.item, data);
            } else if (rule.type == "object") {
                return this.checkObject(rule.struct, data);
            }
            return false;
        }
    };
})(_qc);(function (module) {
    var Class = module.__1;
    var EventPlugin = module.__4;
    var checkData = module.__8;
    var extend = module.__5;
    var tool = module.__9;
    var Step = Class({
        plugins: [ new EventPlugin() ],
        isAbstract: true,
        construct: function(options) {
            options = options || {};
            this._data = {
                __id: Date.now(),
                description: options.description
            };
            this.__struct = this._describeData();
            this.__next = null;
            this.__end = false;
            this.__pausing = false;
            this.__callback = null;
        },
        methods: {
            enter: function(data, callback) {
                this.__pausing = false;
                if (!this.__checkInput(data)) {
                    throw new Error("Data error.");
                }
                var _this = this;
                this._process(data, function(err, result) {
                    if (!_this.__checkOutput(result)) {
                        throw new Error("Result error.");
                    }
                    var cb = function() {
                        callback(err, result);
                    };
                    if (!_this.__pausing) {
                        cb();
                    } else {
                        _this.__callback = cb;
                    }
                });
            },
            destroy: function() {},
            _process: Class.abstractMethod,
            _describeData: function() {
                return {};
            },
            next: function(step) {
                if (step) {
                    if (!this.isEnd()) {
                        this.__next = step;
                        this.end();
                    }
                } else {
                    return this.__next;
                }
            },
            end: function() {
                this.__end = true;
            },
            isEnd: function() {
                return this.__end;
            },
            data: function(data) {
                if (arguments.length === 0) {
                    return this._data;
                } else {
                    extend(this._data, data);
                }
            },
            getStruct: function() {
                return this.__struct;
            },
            pause: function() {
                this.__pausing = true;
            },
            resume: function() {
                this.__pausing = false;
                if (this.__callback) {
                    this.__callback();
                }
            },
            __checkInput: function(data) {
                tool.log("Check", "input data for", this._data.description);
                return checkData.check(this.__struct.input, data);
            },
            __checkOutput: function(data) {
                tool.log("Check", "output data for", this._data.description);
                return checkData.check(this.__struct.output, data);
            }
        }
    });
    module.__7=Step;
})(_qc);(function (module) {
    var Class = module.__1;
    var Step = module.__7;
    var Begin = Class({
        extend: Step,
        construct: function(options) {
            this.callsuper(options);
        },
        isAbstract: true
    });
    module.__6=Begin;
})(_qc);(function (module) {
    var Class = module.__1;
    var Step = module.__7;
    var extend = module.__5;
    var Condition = Class({
        extend: Step,
        construct: function(options) {
            options = options || {};
            this.callsuper(options);
            this._cases = options.cases || {};
            this._default = options.defaultCase;
        },
        isAbstract: true,
        methods: {
            _select: function(condition, data) {
                var fn = this._cases[condition] || this._default;
                fn(data);
            },
            cases: function(data) {
                if (data) {
                    if (data.cases) {
                        extend(this._cases, data.cases);
                    }
                    if (data.defaultCase) {
                        this._default = data.defaultCase;
                    }
                } else {
                    return {
                        defaultCase: this._default,
                        cases: this._cases
                    };
                }
            }
        }
    });
    module.__11=Condition;
})(_qc);(function (module) {
    var Class = module.__1;
    var Condition = module.__11;
    var extend = module.__5;
    var Input = Class({
        extend: Condition,
        construct: function(options) {
            options = options || {};
            this.callsuper(options);
            this._inputs = options.inputs || {};
            this._binded = false;
        },
        isAbstract: true,
        methods: {
            _once: function(callback) {
                if (!this._binded) {
                    this._binded = true;
                    callback();
                }
            },
            inputs: function(data) {
                var tmp = {};
                tmp.cases = data.inputs;
                return this.cases(tmp);
            }
        }
    });
    module.__10=Input;
})(_qc);(function (module) {
    var Class = module.__1;
    module.__12=Class({
        construct: function() {
            this._queue = [];
            this._event = {};
        },
        methods: {
            enqueue: function(obj) {
                this._queue.push(obj);
            },
            dequeue: function() {
                var _this = this;
                if (this._queue.length === 0) {
                    this.end();
                    return null;
                } else {
                    return this._queue.splice(0, 1)[0];
                }
            },
            isEmpty: function() {
                return this._queue.length === 0;
            },
            end: function(data) {
                this.fire("end", data);
            },
            on: function(type, callback) {
                if (!this._event[type]) {
                    this._event[type] = [];
                }
                this._event[type].push(callback);
            },
            fire: function(type, data) {
                if (this._event[type]) {
                    for (var i = 0; i < this._event[type].length; i++) {
                        this._event[type][i](data);
                    }
                }
            },
            clear: function() {
                this._queue = [];
            }
        }
    });
})(_qc);(function (module) {
    var Class = module.__1;
    var tool = module.__9;
    var FlowData = Class({
        construct: function(options) {
            this._data = {};
        },
        methods: {
            getData: function(dataNames) {
                var result = {};
                var now = (new Date()).getTime();
                if (tool.isArray(dataNames)) {
                    var length = dataNames.length;
                    for (var i = 0; i < length; i++) {
                        var name = dataNames[i];
                        if (this._data.hasOwnProperty(name)) {
                            result[name] = this._data[name];
                        }
                    }
                } else {
                    result[dataNames.toString()] = this._data[dataNames.toString()];
                }
                return result;
            },
            setData: function(dataName, data) {
                this._data[dataName] = data;
                return false;
            }
        }
    });
    module.__13=FlowData;
})(_qc);(function (module) {
    var Class = module.__1;
    var EventPlugin = module.__4;
    var extend = module.__5;
    var Begin = module.__6;
    var Step = module.__7;
    var Input = module.__10;
    var Condition = module.__11;
    var Queue = module.__12;
    var Data = module.__13;
    var tool = module.__9;
    var reserve = [];
    var Flow = Class({
        plugins: [ new EventPlugin() ],
        construct: function(options) {
            options = options || {};
            this.__begin = new Begin({
                description: "Begin",
                struct: {}
            });
            this.__steps = options.steps || {};
            this.__stepInstances = {};
            this.__queue = new Queue();
            this.__timer = null;
            this.__prev = this.__begin;
            this.__data = new Data();
            this.__interfaces = {};
            this.__pausing = {};
            this.__working = {};
            for (var key in this) {
                reserve.push(key);
            }
        },
        isAbstract: true,
        methods: {
            init: Class.abstractMethod,
            implement: function(stepName, options) {
                var StepClass = Class({
                    extend: this.__steps[stepName],
                    construct: options.construct || function(options) {
                        this.callsuper(options);
                    },
                    methods: options.methods
                });
                this.__stepInstances[stepName] = new StepClass({
                    description: stepName
                });
            },
            destroy: function() {
                var ins = this.__stepInstances;
                for (var stepName in ins) {
                    if (ins.hasOwnProperty(stepName)) {
                        var step = ins[stepName];
                        var stepData = this.__getStepData(step);
                        try {
                            step.destroy(stepData);
                        } catch (e) {}
                    }
                }
            },
            _go: function(step, data, options) {
                var _this = this;
                if (this.__timer) {
                    clearTimeout(this.__timer);
                }
                if (typeof step == "string") {
                    var stepName = step;
                    step = this.__stepInstances[step];
                }
                if (step) {
                    if (options) {
                        if (step instanceof Condition) {
                            step.cases(options);
                        }
                        if (step instanceof Input) {
                            step.inputs(options);
                        }
                    }
                    this.__queue.enqueue({
                        step: step,
                        data: data
                    });
                    if (this.__prev) {
                        this.__prev.next(step);
                    }
                    this.__prev = step;
                    if (this.__sync) {
                        var item = this.__queue.dequeue();
                        var stepData = this.__getStepData(item.step);
                        extend(stepData, item.data);
                        this.__process(item.step, stepData);
                        this.__timer = setTimeout(function() {
                            step.end();
                        }, 0);
                    } else {
                        this.__timer = setTimeout(function() {
                            step.end();
                            _this.__start();
                        }, 0);
                    }
                } else {
                    this.__timer = setTimeout(function() {
                        _this.__prev.end();
                        _this.__start();
                    }, 0);
                }
            },
            _pause: function() {
                for (var key in this.__working) {
                    if (this.__working.hasOwnProperty(key)) {
                        this.__working[key].pause();
                        this.__pausing[key] = this.__working[key];
                        delete this.__working[key];
                    }
                }
                this.__queue.clear();
            },
            _resume: function() {
                for (var key in this.__pausing) {
                    if (this.__pausing.hasOwnProperty(key)) {
                        this.__pausing[key].resume();
                        this.__working[key] = this.__pausing[key];
                        delete this.__pausing[key];
                    }
                }
            },
            _sync: function(callback) {
                this.__sync = true;
                callback();
                this.__sync = false;
            },
            _steps: function() {
                return this.__steps;
            },
            _addStep: function(name, StepClass) {
                this.__steps[name] = StepClass;
            },
            _addInterface: function(name, fn) {
                if (reserve.indexOf(name) != -1) {
                    throw new Error("Reserve property : " + name);
                }
                this[name] = fn;
                this.__interfaces[name] = fn;
            },
            _getData: function(keys) {
                return this.__data.getData(keys);
            },
            __start: function() {
                var item = this.__queue.dequeue();
                if (item) {
                    var data = this.__getStepData(item.step);
                    extend(data, item.data);
                    this.__process(item.step, data);
                }
            },
            __process: function(step, data) {
                this.__working[step.data().__id] = step;
                this.__enter(step, data, function(result) {
                    delete this.__working[step.data().__id];
                    if (result) {
                        this.__saveData(result);
                    }
                    if (!this.__sync) {
                        var next = this.__getNext(step);
                        if (next) {
                            this.__process(next.step, next.data);
                        }
                    }
                });
            },
            __saveData: function(result) {
                for (var key in result) {
                    if (result.hasOwnProperty(key)) {
                        this.__data.setData(key, result[key]);
                    }
                }
            },
            __getNext: function(step) {
                var result = step.__result, next = null;
                var item = this.__queue.dequeue();
                if (item) {
                    var data = this.__getStepData(item.step);
                    extend(data, item.data);
                    next = {
                        step: item.step,
                        data: data
                    };
                } else {
                    var ns = step.next();
                    if (ns) {
                        next = {
                            step: ns,
                            data: this.__getStepData(ns)
                        };
                    }
                }
                return next;
            },
            __getStepData: function(step) {
                var struct = step.getStruct();
                var dataNames = [];
                if (struct && struct.input) {
                    for (var key in struct.input) {
                        if (struct.input.hasOwnProperty(key)) {
                            dataNames.push(key);
                        }
                    }
                }
                return this.__data.getData(dataNames);
            },
            __enter: function(step, data, callback) {
                var _this = this;
                var enterData = {};
                extend(enterData, data);
                step.enter(enterData, function(err, result) {
                    if (result == enterData) {
                        var errmsg = "Can not use enterData as result";
                        tool.error(errmsg);
                        throw new Error(errmsg);
                    }
                    for (var key in enterData) {
                        delete enterData[key];
                    }
                    step.__result = result;
                    callback.call(_this, result);
                });
            }
        }
    });
    module.__3=Flow;
})(_qc);(function (module) {
    window.Flowjs = {
        V: "0.1.0",
        Class: module.__1,
        Flow: module.__3,
        Step: module.__7,
        Condition: module.__11,
        Input: module.__10
    };
})(_qc);})(this);
});