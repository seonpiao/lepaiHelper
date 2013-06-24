var lib = require('../lib/lib');
var ic = new lib.ic.InfoCenter({moduleName:'kit:mail'});
var email = require("nodemailer");
var smtp = {
    host:'smtp.gmail.com',
    port:465,
    use_authentication:true,
    user:'qiyiria@gmail.com',
    pass:'ria123456',
    ssl:true
};

module.exports = {
    send:function(options,callback){
        var to = options.to;
        var from = options.from;
        var subject = options.subject;
        var content = options.content;
        email.SMTP = options.smtp || smtp;
        email.send_mail({
            sender:from,
            to:to,
            subject:subject,
            html:content,
            body:''
        },function(error,success){
            if(error){
                ic.error(error);
                callback(error);
            }
            else{
                callback();
            }
        });
    }
};