﻿var version = '1.1.2';
window.onbeforeunload = function(){
    return 'Sure?';
};
var Logger = {
    ctimestamp:Date.now(),
    ptimestamp:Date.now(),
    checklogs:[],
    pricelogs:[],
    check:function(string){
        var elem = $('#log_cont');
        var _this = this;
        var date = new Date();
        var now = date.getTime();
        if(_this.checklogs.length > 200){
            _this.checklogs.splice(0,1);
        }
        _this.checklogs.push('[' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds() + '][' + (now - _this.ctimestamp) + ']' + string);
        elem.html(_this.checklogs.join('<br/>'));
        elem[0].scrollTop = 100000;
        _this.ctimestamp = now;
    },
    price:function(string){
        var elem = $('#pricelog_cont');
        var _this = this;
        var date = new Date();
        var now = date.getTime();
        if(_this.pricelogs.length > 100){
            _this.pricelogs.splice(0,1);
        }
        _this.pricelogs.push('[' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds() + '][' + (now - _this.ptimestamp) + ']' + string);
        elem.html(_this.pricelogs.join('<br/>'));
        elem[0].scrollTop = 100000;
        _this.ptimestamp = now;
        this.check(string);
    }
};

var LayoutBuilder = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            var configCont = $('<div id="config_cont" data-elem-type="cont"/>');
            var css = {
                width:'200px',
                height:'200px',
                position:'fixed',
                bottom:'0',
                right:'0',
                border:'1px solid #eeeeee',
                padding:'10px',
                background:'white',
                opacity:'0.3',
                textAlign:'left',
                zIndex:'9999'
            };
            configCont.css(css);
            var logCont = $('<div id="log_cont" data-elem-type="cont"/>');
            logCont.css($.extend(css,{
                width:'400px',
                height:'150px',
                left:'0',
                whiteSpace:'nowrap',
                overflow:'hidden',
                overflowY:'auto'
            }));
            var pricelogCont = $('<div id="pricelog_cont" data-elem-type="cont"/>');
            pricelogCont.css($.extend(css,{
                bottom:'190px'
            }));
            $('body').append(configCont);
            $('body').append(logCont);
            $('body').append(pricelogCont);
            var conts = $('div[data-elem-type=cont]');
            conts.mouseenter(function(e){
                conts.css('opacity','0.8');
            });
            conts.mouseleave(function(e){
                conts.css('opacity','0.3');
            });
            callback(null,{configCont:configCont});
        },
        _describeData:function(){
            return {
                output:{
                    configCont:{
                        type:'object'
                    }
                }
            };
        }
    }
});

var ConfigDrawer = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            var cont = data.configCont;
            cont.html(version);

            var startTime = $('<div><input id="start_time" style=/></div>');
            cont.append(startTime);
            startTime = startTime.find('input');
            startTime.attr('placeholder','User start time..');

            var startPrice = $('<div><input id="start_price"/></div>');
            cont.append(startPrice);
            startPrice = startPrice.find('input');
            startPrice.attr('placeholder','Start when..');

            var maxPrice = $('<div><input id="max_price"/></div>');
            cont.append(maxPrice);
            maxPrice = maxPrice.find('input');
            maxPrice.attr('placeholder','Max price..');

            var isTrue = $('<div>真实出价<input id="is_true" type="checkbox" /></div>');
            cont.append(isTrue);

            var isAutoLogin = $('<div>自动登录<input id="is_autologin" type="checkbox" /></div>');
            cont.append(isAutoLogin);

            var status = $('<div id="status"/>');
            cont.append(status);
            callback(null,{
                isTrue:isTrue,
                isAutoLogin:isAutoLogin,
                startTime:startTime,
                status:status,
                maxPrice:maxPrice,
                startPrice:startPrice
            });
        },
        _describeData:function(){
            return {
                input:{
                    configCont:{
                        type:'object'
                    }
                },
                output:{
                    isTrue:{
                        type:'object'
                    },
                    isAutoLogin:{type:'object'},
                    startTime:{
                        type:'object'
                    },
                    startPrice:{type:'object'},
                    maxPrice:{type:'object'},
                    status:{
                        type:'object'
                    }
                }
            };
        }
    }
});

var GetInfo = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            var pid = location.href.match(/\/(\d+)\.html/)[1];
            var user = 'seon';
            callback(null,{pid:pid,user:user});
        },
        _describeData:function(){
            return {
                output:{
                    pid:{type:'string'},
                    user:{type:'string',empty:true}
                }
            };
        }
    }
});

var DetailViewer = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            var priceElem = $($('#ctl00_ContentPlaceHolder1_lb_nowPrice')[0] || $('.ni_tbold1')[0]);
            var pid = data.pid;
            priceElem.click(function(){
                window.open('http://dev.guanyu.us:927/lpai/info?pid=' + pid);
            });
            callback();
        },
        _describeData:function(){
            return {
                input:{
                    pid:{type:'string'}
                }
            };
        }
    }
});

var doCheck = function(pid,callback){
    $.ajax({
        url:'http://www.lpai.com.cn/Process/BidShow.ashx',
        data:{
            pId:pid,
            x:'0'
        },
        type:'get',
        dataType:'json',
        cache:false,
        success:function(info){
            var currInfo = info.Tables[0].Rows[0];
            callback(currInfo);
        }
    });
};

var Check = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            var _this = this;
            var requests = {};
            var retry = 0;
            var send = function(rid){
                requests[rid] = {
                    timer:0,
                    timeout:false
                };
                Logger.check('开始查询产品信息:' + retry + '(' + rid + ')');
                var d1 = Date.now();
                doCheck(data.pid,function(currInfo){
                    for(var rid in requests){
                        clearTimeout(requests[rid].timer);
                    }
                    if(callback){
                        d2 = Date.now();
                        delay = d2 - d1;
                        if(currInfo.state == '0'){
                            var currPrice = parseFloat(currInfo.now_price);
                            var currUser = decodeURIComponent(currInfo.set_price_people);
                            var countdown = parseInt(currInfo.seconds) * 1000;
                            Logger.check(delay + ' | ' + currUser + ' | <span style="color:red;">' + countdown + '</span>(' + rid + ')');
                            callback(null,{isOk:true,isEnd:false,delay:delay,currPrice:currPrice,currUser:currUser,countdown:countdown});
                        }
                        else{
                            callback(null,{isOk:true,isEnd:true,delay:delay});
                        }
                        callback = null;
                    }
                });
                requests[rid].timer = setTimeout(function(){
                    retry++;
                    if(retry > 3){
                        if(callback){
                            //超时失败超过次数后，走失败流程
                            Logger.price('超时重试次数超限(' + d1 + ')');
                            callback(null,{isOk:false});
                            callback = null;
                        }
                        return;
                    }
                    requests[rid].timeout = true;
                    send(Date.now());
                },150);
            };
            var rid = Date.now();
            send(rid);
        },
        _describeData:function(){
            return {
                input:{
                    pid:{type:'string'},
                    timeout:{type:'number'}
                },
                output:{
                    isOk:{type:'boolean'},
                    isEnd:{type:'boolean',empty:true},
                    currPrice:{type:'number',empty:true},
                    currUser:{type:'string',empty:true},
                    countdown:{type:'number',empty:true},
                    delay:{type:'number',empty:true}
                }
            };
        }
    }
});

var OverrunLog = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            Logger.check('出价次数超出限制!');
            callback();
        }
    }
});

var EndLog = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            Logger.check('End!');
            callback();
        }
    }
});

var ErrorLog = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            Logger.check('检查产品状态超时!');
            callback();
        }
    }
});

var Delay = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            var minus = 2000;
            if(data.countdown > 20000){
                minus = data.countdown - 20000;
            }
            if(document.webkitVisibilityState == 'hidden'){
                minus += 2000;
            }
            setTimeout(callback,data.countdown - data.delay - data.priceTime - minus);
        },
        _describeData:function(){
            return {
                input:{
                    delay:{type:'number'},
                    countdown:{type:'number'},
                    priceTime:{type:'number'}
                }
            };
        }
    }
});

var Config = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            callback(null,{
                timeout:300,
                priceTime:0,
                pricePrice:'0',
                priceMax:5000,
                realPrice:false,
                autoLogin:false,
                priced:0
            });
        },
        _describeData:function(){
            return {
                output:{
                    timeout:{type:'number'},
                    priceTime:{type:'number'},
                    realPrice:{type:'boolean'},
                    pricePrice:{type:'string'},
                    priced:{type:'number'}
                }
            };
        }
    }
});

var CheckResult = Flowjs.Class({
    extend:Flowjs.Condition,
    construct:function(options){
        this.callsuper(options);
        this._endTimes = 0;
    },
    methods:{
        _process:function(data,callback){
            if(data.isOk){
                if(data.isEnd){
                    this._endTimes++;
                    if(this._endTimes > 25){
                        this._select('end');
                    }
                    else{
                        Logger.price('检查是否真的结束了(' + this._endTimes + ')');
                        this._select('retry');
                    }
                }
                else{
                    this._endTimes = 0;
                    this._default();
                }
            }
            else{
                this._select('error');
            }
        },
        _describeData:function(){
            return {
                input:{
                    isOk:{type:'boolean'},
                    isEnd:{type:'boolean',empty:true}
                }
            };
        }
    }
});

var IsPrice = Flowjs.Class({
    extend:Flowjs.Condition,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            if(data.currUser == data.user){
                Logger.check('已经是当前出价人。');
                this._default();
            }
            else{
                var userNumMap = {
                    '0':1000,
                    '1':1000,
                    '2':1000,
                    '3':1000,
                    '4':1000,
                    '5':1000,
                    '6':1000
                };
                var startTime = data.priceTime || userNumMap[data.userNum];
                if(document.webkitVisibilityState == 'hidden'){
                    startTime += 1000;
                }
                Logger.check('出价条件：' + startTime + '(' + data.userNum + ')');
                var realCountdown = data.countdown - data.delay;
                var actPrice = parseFloat($('.ni_pprice').html().substring(1));
                var startPrice = data.pricePrice;
                if(data.currPrice < startPrice){
                    Logger.check('未达到最低出价价格');
                    this._default();
                }
                else if(data.priceMax <= data.priced){
                    this._select('出价次数超限');
                }
                else if(realCountdown <= startTime){
                    this._select('达到出价条件');
                }
                else if(data.countdown <= 2000){
                    this._select('进入危险区间，立即重新检查');
                }
                else{
                    this._default();
                }
            }
        },
        _describeData:function(){
            return {
                input:{
                    currPrice:{type:'number'},
                    priceTime:{type:'number'},
                    countdown:{type:'number'},
                    userNum:{type:'number'},
                    delay:{type:'number'},
                    currUser:{type:'string'},
                    user:{type:'string',empty:true},
                    pricePrice:{type:'string'},
                    priceMax:{type:'number'},
                    priced:{type:'number'}
                }
            };
        }
    }
});

var IsStopHelper = Flowjs.Class({
    extend:Flowjs.Condition,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            if(!data.realPrice){
                this._select('虚拟出价，无需取消出价器');
            }
            else if(data.isOk){
                if(data.isEnd){
                    Logger.check('竞拍结束。。');
                    this._select('取消自动出价器');
                }
                else if(data.currUser == data.user){
                    Logger.check('自动出价器出价成功');
                    this._select('取消自动出价器');
                }
                else if(data.countdown > 5000){
                    Logger.check('本次出价器没有出价');
                    this._select('取消自动出价器');
                }
                else{
                    this._default();
                }
            }
            else{
                this._default();
            }
        },
        _describeData:function(){
            return {
                input:{
                    isOk:{type:'boolean'},
                    isEnd:{type:'boolean'},
                    countdown:{type:'number'},
                    currUser:{type:'string'},
                    user:{type:'string',empty:true},
                    realPrice:{type:'boolean'}
                }
            };
        }
    }
});

var Price = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
        this._times = 0;
    },
    methods:{
        _process:function(data,callback){
            if(!data.user){
                callback(null,{priced:0});
                return;
            }
            var _this = this;
            var pid = data.pid;
            var timeout = data.timeout;
            if(data.realPrice){
                var requests = {};
                var send = function(rid){
                    Logger.check('[' + _this._times + ']开始出价(' + rid + ')');
                    requests[rid] = {
                        timer:0,
                        timeout:false
                    };
                    $.ajax({
                        url: '/Process/MemberSetPrice.aspx',
                        data: { "pid": pid },
                        type: "get",
                        dataType: "html",
                        cache: false,
                        success:function(s){
                            clearTimeout(requests[rid].timer);
                            if(callback){
                                if(data == "5"){
                                    Logger.check('已结束。(' + rid + ')');
                                }
                                else if(s.indexOf("success") != -1 || s == '2'){
                                    _this._times++;
                                    Logger.check('[' + _this._times + ']出价成功(' + rid + ')');
                                }
                                else{
                                    Logger.check('[' + _this._times + ']出价失败：' + s + '(' + rid + ')');
                                }
                                if(!requests[rid].timeout){
                                    callback(null,{priced:_this._times});
                                    callback = null;
                                }
                            }
                        }
                    });
                    requests[rid].timer = setTimeout(function(){
                        requests[rid].timeout = true;
                        Logger.check('[' + _this._times + ']出价超时(' + rid + ')');
                        send(Date.now());
                    },timeout);
                };
                var rid = Date.now();
                var priceTimer = setTimeout(function(){
                    send(rid);
                },300);
                setTimeout(function(){
                    doCheck(data.pid,function(currInfo){
                        if(currInfo.seconds > data.priceTime){
                            Logger.check('哈哈，省一次~');
                            clearTimeout(priceTimer);
                            callback(null,{priced:_this._times});
                        }
                    });
                },50);
            }
            else{
                Logger.check('[' + _this._times + ']模拟出价。');
                callback(null,{priced:_this._times});
            }
        },
        _describeData:function(){
            return {
                input:{
                    pid:{type:'string'},
                    timeout:{type:'number'},
                    realPrice:{type:'boolean'},
                    user:{type:'string',empty:true},
                    priceTime:{type:'number'}
                },
                output:{
                    priced:{type:'number'}
                }
            };
        }
    }
});

var StartHelper = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            if(!data.user){
                callback();
                return;
            }
            var _this = this;
            var pkey = 'p' + data.pid;
            if(!this.hasOwnProperty('_times')){
                var savedTimes = localStorage.getItem(pkey);
                if(savedTimes){
                    this._times = parseInt(savedTimes);
                }
                else{
                    this._times = 0;
                }
            }
            _this._times++;
            localStorage.setItem(pkey,this._times);
            var pid = data.pid;
            var timeout = data.timeout;
            if(data.realPrice){
                var requests = {};
                var send = function(rid){
                    Logger.check('[' + _this._times + ']启动自动出价器(' + rid + ')');
                    requests[rid] = {
                        timer:0,
                        timeout:false
                    };
                    $.ajax({
                        url: 'http://c.5pai.com/HelperAction.aspx',
                        data: {
                            operation:'add',
                            start_reason:'1',
                            price_value:'0.00',
                            method:'1',
                            clicks:'1',
                            ProductId:pid
                        },
                        type: "get",
                        dataType: "html",
                        cache: false,
                        success:function(s){
                            if(!requests[rid].timeout){
                                Logger.check('[' + _this._times + ']启动自动出价器成功(' + rid + ')');
                                clearTimeout(requests[rid].timer);
                                callback();
                            }
                        }
                    });
                    requests[rid].timer = setTimeout(function(){
                        requests[rid].timeout = true;
                        Logger.check('[' + _this._times + ']启动自动出价器超时(' + rid + ')');
                        send(Date.now());
                    },timeout);
                };
                var rid = Date.now();
                send(rid);
            }
            else{
                Logger.check('[' + _this._times + ']模拟出价。');
                callback();
            }
        },
        _describeData:function(){
            return {
                input:{
                    pid:{type:'string'},
                    timeout:{type:'number'},
                    realPrice:{type:'boolean'},
                    user:{type:'string',empty:true}
                }
            };
        }
    }
});

var StopHelper = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            var _this = this;
            var requests = {};
            var pid = data.pid;
            var timeout = data.timeout;
            var send = function(rid){
                Logger.check('取消自动出价器(' + rid + ')');
                requests[rid] = {
                    timer:0,
                    timeout:false
                };
                $.ajax({
                    url: 'http://c.5pai.com/HelperAction.aspx',
                    data: {
                        operation:'delete',
                        ProductId:pid
                    },
                    type: "get",
                    dataType: "html",
                    cache: false,
                    success:function(s){
                        if(!requests[rid].timeout){
                            Logger.check('取消自动出价器成功(' + rid + ')');
                            clearTimeout(requests[rid].timer);
                            callback();
                        }
                    }
                });
                requests[rid].timer = setTimeout(function(){
                    requests[rid].timeout = true;
                    Logger.check('取消自动出价器超时(' + rid + ')');
                    send(Date.now());
                },timeout);
            };
            var rid = Date.now();
            send(rid);
        },
        _describeData:function(){
            return {
                input:{
                    pid:{type:'string'},
                    timeout:{type:'number'}
                }
            };
        }
    }
});

var GetUserNum = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            var users = $('.a_user');
            var userNames = [];
            var userMap = {};
            if(users){
                users.each(function(i,userName){
                    userName = userName.innerHTML;
                    if(userName == data.user){
                        return;
                    }
                    if(!userMap.hasOwnProperty(userName)){
                        userMap[userName] = 0;
                    }
                    userMap[userName]++;
                    if(userMap[userName] > 2 && userNames.indexOf(userName) == -1){
                        userNames.push(userName);
                    }
                });
            }
            callback(null,{userNum:userNames.length});
        },
        _describeData:function(){
            return {
                input:{
                    user:{type:'string',empty:true}
                },
                output:{
                    userNum:{type:'number'}
                }
            };
        }
    }
});

var DisplayState = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            var html = [
                'Real price:' + data.realPrice,
                'Price time:' + data.priceTime,
                'Max price:' + data.priceMax,
                'Start price:' + data.pricePrice
            ];
            data.status.html(html.join('<br/>'));
            callback();
        },
        _describeData:function(){
            return {
                input:{
                    status:{type:'object'},
                    realPrice:{type:'boolean'},
                    priceTime:{type:'number'},
                    pricePrice:{type:'string'},
                    priceMax:{type:'number'}
                }
            };
        }
    }
});

var UpdateConfig = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            callback(null,data);
        },
        _describeData:function(){
            return {
                input:{
                    realPrice:{type:'boolean',empty:true},
                    priceTime:{type:'number',empty:true},
                    priceMax:{type:'number',empty:true},
                    pricePrice:{type:'string',empty:true},
                    autoLogin:{type:'boolean',empty:true}
                },
                output:{
                    realPrice:{type:'boolean',empty:true},
                    priceTime:{type:'number',empty:true},
                    priceMax:{type:'number',empty:true},
                    pricePrice:{type:'string',empty:true},
                    autoLogin:{type:'boolean',empty:true}
                }
            };
        }
    }
});

var BindConfigEvent = Flowjs.Class({
    extend:Flowjs.Input,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            var _this = this;
            this._once(function(){
                data.isTrue.on("click",function(e){
                    var target = e.target;
                    _this._select('切换出价状态',{
                        realPrice:target.checked
                    });
                });
                data.isAutoLogin.on("click",function(e){
                    var target = e.target;
                    _this._select('切换自动登录状态',{
                        autoLogin:target.checked
                    });
                });
                data.startTime.on("blur",function(e){
                    var target = e.target;
                    var value = parseInt(target.value || 0);
                    if(!isNaN(value)){
                        _this._select('修改出价时间',{
                            priceTime:value
                        });
                    }
                });
                data.startPrice.on("blur",function(e){
                    var target = e.target;
                    var value = target.value || '0';
                    if(!isNaN(value)){
                        _this._select('修改出价价格',{
                            pricePrice:value
                        });
                    }
                });
                data.maxPrice.on("blur",function(e){
                    var target = e.target;
                    var value = parseInt(target.value || 0);
                    if(!isNaN(value)){
                        _this._select('修改最大出价次数',{
                            priceMax:value
                        });
                    }
                });
            });
            callback();
        },
        _describeData:function(){
            return {
                input:{
                    isTrue:{type:'object'},
                    startTime:{type:'object'},
                    startPrice:{type:'object'},
                    maxPrice:{type:'object'},
                    isAutoLogin:{type:'object'}
                }
            };
        }
    }
});

var AutoLogin = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    statics:{
        _timer:0
    },
    methods:{
        _process:function(data,callback){
            var _this = this;
            if(AutoLogin._timer){
                clearTimeout(AutoLogin._timer);
            }
            var isAutoLogin = data.autoLogin;
            var isEnd = data.isEnd;
            var autoLogin = function(){
                var t = Date.now();
                $.ajax({
                    url: 'http://www.lpai.com.cn/User/UserCenter.aspx',
                    data: {},
                    type: "get",
                    dataType: "html",
                    cache: false,
                    success:function(s){
                        if(s.indexOf('对不起，您暂未登录！') != -1){
                            if( !isEnd )Logger.check('检查登录情况:未登录');
                            if(isAutoLogin){
                                if(!_this._t || (t - _this._t > 10000)){
                                    _this._t = t;
                                    Logger.price('尝试自动登录');
                                    window.open('http://www.lpai.com.cn/QQLogin/Default.aspx');
                                }
                            }
                        }
                        else{
                            if( !isEnd )Logger.check('检查登录情况:已登录');
                        }
                    }
                });
                AutoLogin._timer = setTimeout(autoLogin,5000);
            };
            autoLogin();
            callback();
        },
        _describeData:function(){
            return {
                input:{
                    autoLogin:{type:'boolean',empty:true},
                    isEnd:{type:'boolean',empty:true}
                }
            };
        }
    }
});

var End = Flowjs.Class({
    extend:Flowjs.Step,
    construct:function(options){
        this.callsuper(options);
    },
    methods:{
        _process:function(data,callback){
            callback(null,{isEnd:true});
        },
        _describeData:function(){
            return {
                output:{
                    isEnd:{type:'boolean'}
                }
            };
        }
    }
});

var Flow = Flowjs.Class({
    extend:Flowjs.Flow,
    construct:function(options){
        this.callsuper(options);
        this._addStep('初始化插件布局', LayoutBuilder);
        this._addStep('初始化配置模块外观', ConfigDrawer);
        this._addStep('获取网站信息', GetInfo);
        this._addStep('初始化详细信息查看器', DetailViewer);
        this._addStep('检查产品当前状态', Check);
        this._addStep('为自动出价器查询产品当前状态', Check);
        this._addStep('延时启动下一次Check', Delay);
        this._addStep('打印检查产品信息失败日志', ErrorLog);
        this._addStep('打印拍卖结束日志', EndLog);
        this._addStep('初始化配置信息', Config);
        this._addStep('出价', Price);
        this._addStep('启动自动出价器', StartHelper);
        this._addStep('获取当前活跃参与用户数', GetUserNum);
        this._addStep('根据用户输入更新配置', UpdateConfig);
        this._addStep('显示初始配置信息', DisplayState);
        this._addStep('显示更新配置信息', DisplayState);
        this._addStep('打印出价超限日志', OverrunLog);
        this._addStep('取消自动出价器', StopHelper);
        this._addStep('绑定用户更新配置的事件', BindConfigEvent);
        this._addStep('检查是否需要出价', IsPrice);
        this._addStep('检查结果', CheckResult);
        this._addStep('检查是否需要取消自动出价器', IsStopHelper);
        this._addStep('启动自动登录', AutoLogin);
        this._addStep('立即执行自动登录', AutoLogin);
        this._addStep('取消自动登录', AutoLogin);
        this._addStep('结束', End);
    },
    methods:{
        //初始化流程
        init:function(){
            var _this = this;

            this._go('初始化插件布局');
            this._go('初始化配置模块外观');
            this._go('初始化配置信息');
            this._go('显示初始配置信息');
            this._go('绑定用户更新配置的事件',null,{
                inputs:{
                    '切换出价状态':function(data){
                        _this._go('根据用户输入更新配置',data);
                        _this._go('显示更新配置信息');
                    },
                    '切换自动登录状态':function(data){
                        _this._go('根据用户输入更新配置',data);
                        _this._go('显示更新配置信息');
                        _this._go('立即执行自动登录');
                    },
                    '修改出价时间':function(data){
                        _this._go('根据用户输入更新配置',data);
                        _this._go('显示更新配置信息');
                    },
                    '修改出价价格':function(data){
                        _this._go('根据用户输入更新配置',data);
                        _this._go('显示更新配置信息');
                    },
                    '修改最大出价次数':function(data){
                        _this._go('根据用户输入更新配置',data);
                        _this._go('显示更新配置信息');
                    }
                }
            });
            this._go('启动自动登录');
            this._go('获取网站信息');
            this._go('初始化详细信息查看器');
            this._go('检查产品当前状态');
            this._go('获取当前活跃参与用户数');
            this._go('检查结果',null,{
                cases:{
                    end:function(){
                        _this._go('打印拍卖结束日志');
                        _this._go('取消自动登录');
                    },
                    retry:function(){
                        _this._go('出价');
                        _this._go('检查产品当前状态');
                    },
                    error:function(){
                        //查询出错后立即启动出价器
                        // _this._go('启动自动出价器');
                        // _this._go('为自动出价器查询产品当前状态');
                        // _this._go('检查是否需要取消自动出价器',null,{
                        //     cases:{
                        //         '取消自动出价器':function(){
                        //             _this._go('取消自动出价器');
                        //             _this._go('检查产品当前状态');
                        //         },
                        //         '虚拟出价，无需取消出价器':function(){
                        //             _this._go('检查产品当前状态');
                        //         }
                        //     },
                        //     defaultCase:function(){
                        //         _this._go('为自动出价器查询产品当前状态');
                        //     }
                        // });
                        // _this._go('打印检查产品信息失败日志');
                        // //失败时，30秒后重试
                        // setTimeout(function(){
                        //     _this._go('检查产品当前状态');
                        // },30000);
                        _this._go('出价');
                        _this._go('检查产品当前状态');
                    }
                },
                defaultCase:function(){
                    _this._go('检查是否需要出价',null,{
                        cases:{
                            '出价次数超限':function(){
                                _this._go('打印出价超限日志');
                                _this._go('结束');
                                _this._go('取消自动登录');
                            },
                            "达到出价条件":function(){
                                // _this._go('启动自动出价器');
                                // _this._go('为自动出价器查询产品当前状态');
                                // _this._go('检查是否需要取消自动出价器',null,{
                                //     cases:{
                                //         '取消自动出价器':function(){
                                //             _this._go('取消自动出价器');
                                //             _this._go('检查产品当前状态');
                                //         },
                                //         '虚拟出价，无需取消出价器':function(){
                                //             _this._go('检查产品当前状态');
                                //         }
                                //     },
                                //     defaultCase:function(){
                                //         _this._go('为自动出价器查询产品当前状态');
                                //     }
                                // });
                                _this._go('出价');
                                _this._go('检查产品当前状态');
                            },
                            "进入危险区间，立即重新检查":function(){
                                _this._go('检查产品当前状态');
                            }
                        },defaultCase:function(){
                            _this._go('延时启动下一次Check');
                            _this._go('检查产品当前状态');
                        }
                    });
                }
            });
        }
    }
});

var flow = new Flow();

flow.implement('初始化插件布局', LayoutBuilder);
flow.implement('初始化配置模块外观', ConfigDrawer);
flow.implement('获取网站信息', GetInfo);
flow.implement('初始化详细信息查看器', DetailViewer);
flow.implement('检查产品当前状态', Check);
flow.implement('为自动出价器查询产品当前状态', Check);
flow.implement('延时启动下一次Check', Delay);
flow.implement('打印检查产品信息失败日志', ErrorLog);
flow.implement('打印拍卖结束日志', EndLog);
flow.implement('初始化配置信息', Config);
flow.implement('出价', Price);
flow.implement('获取当前活跃参与用户数', GetUserNum);
flow.implement('根据用户输入更新配置', UpdateConfig);
flow.implement('显示初始配置信息', DisplayState);
flow.implement('显示更新配置信息', DisplayState);
flow.implement('打印出价超限日志', OverrunLog);
flow.implement('绑定用户更新配置的事件', BindConfigEvent);
flow.implement('检查是否需要出价', IsPrice);
flow.implement('检查结果', CheckResult);
flow.implement('启动自动登录', AutoLogin);
flow.implement('结束', End);
flow.implement('立即执行自动登录', AutoLogin);
flow.implement('取消自动登录', AutoLogin);

flow.init();