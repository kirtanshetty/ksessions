# ksessions
A basic AES 256 Encryption based Session Management Middleware for ExpressJS based applications.

Here are the options that is to be passed to the session middleware function as an input
```nodejs
{
  name: 'name',
  password: 'password',
  cookie: {
    initOnRestart: 'true'
    securityKey: 'securityKey',
    maxAge: 12433,
  }
}
```

Demo to use the ksession library. 

```nodejs
var express = require("express");
var app = express();
var ksession = require("ksession").ksession;

app.use(ksession({
  name: 'name',
  password: 'password',
  cookie: {
    initOnRestart: 'true'
    securityKey: 'securityKey',
    maxAge: 12433,
  }
}));
```
