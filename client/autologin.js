var iframe = $('#ptlogin_iframe');
var win,doc;

setTimeout(function(){
    window.close();
},7000);

$(function(){
    if(iframe){
        win = iframe[0].contentWindow;
        doc = win.document;
        var qq = doc.getElementById('u');
        var pwd = doc.getElementById('p');
        var form = doc.getElementById('loginform');
        var btn = doc.getElementById('login_button');

        qq.value = (QQUser.qq);
        pwd.value = (QQUser.pwd);
        pwd.focus();
        setTimeout(function(){
            btn.click();
        },1000);
        return;
    }
});