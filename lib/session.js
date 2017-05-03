// Session input
// {
//   name: 'name',
//   password: 'password',
//   cookie: {
//     initOnRestart: 'true'
//     securityKey: 'securityKey',
//     maxAge: 12433,
//   }
// }
// ------------------------------------
// Session Obj data
// {
//   key: 'key',
//   setOn: 'date',
//   ...
// }

var sess = {};
var crypto = require('crypto');
var onHeaders = require('on-headers');
var algorithm = 'aes-256-ctr';
var password = '';
var securityKey = '';
var name = '';
var maxAge = '';

function InitPassword(){
  if(sess.password && !sess.cookie.initOnRestart)
    password = sess.password;
  else if(sess.password && sess.cookie.initOnRestart)
    password = sess.password + Date.now().toString();
  else
    password += Date.now().toString();
}

function InitName() {
  if(sess.name)
    name = sess.name;
  else
    name = 'KSID';
}

function InitSecurityKey() {
  if(sess.cookie && sess.cookie.securityKey)
    securityKey = sess.cookie.securityKey;
  else
    securityKey = 'Xasf4134jnLAKDBsa821';
}

function InitMaxAge() {
  if(sess.cookie && sess.cookie.maxAge)
    maxAge = sess.cookie.maxAge;
  else
    maxAge = 36000;
}

function ksession(sessionObj) {
  sess = sessionObj;

  // Initialize the session metadata
  InitPassword();
  InitName();
  InitSecurityKey();
  InitMaxAge();

  // console.log("password", password);
  // console.log("securityKey", securityKey);
  // console.log("name", name);
  // console.log("maxAge", maxAge);

  return function(req, res, next) {
    onHeaders(res, function(){
      // console.log('onHeaders');
      if (!req.session || req.session.isDestroy) {
        // console.log('no session');
        return;
      }

      SetCookie(req.session, res);
    });

    var sessCookie = GetCookie(req.cookies);
    if(sessCookie){
      req.session = sessCookie;
      req.session.destroy = function () {
        req.session.isDestroy = true;
        res.clearCookie(name);
      }
    }
    next();
  }
}

function GetCookie(obj) {
  var cookie = null;
  var ecookie = obj[name];
  // console.log('ecookie', ecookie);
  if(ecookie){
    var dcookie = JSON.parse(DecryptCookie(ecookie));
    if(dcookie.key === securityKey && (Date.now() - dcookie.setOn) <= sess.cookie.maxAge) {
      cookie = dcookie;
      // console.log('cookie', cookie);
    }
  }
  else {
    cookie = {
      key: securityKey,
      setOn: Date.now()
    }
  }

  return cookie;
}

function SetCookie(sessionObj, res) {
  res.cookie(name, EncryptCookie(JSON.stringify(sessionObj)), {
    maxAge: (maxAge - (Date.now() - sessionObj.setOn)),
    httpOnly: true
  });
  // console.log('cookie created successfully');
}

function EncryptCookie(text) {
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

function DecryptCookie(text) {
  var decipher = crypto.createDecipher(algorithm, password);
  var decrypted = decipher.update(text,'hex','utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  ksession: ksession
}
