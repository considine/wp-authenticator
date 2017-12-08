var rp = require("request-promise");
var request = require("request");
var cookie = require('cookie');

module.exports = {
  /**
   *
   *
   *  Note: use request module (wrapped in promise) instead of request-promise as the latter
   *  doesn't seem to work properly with the cookies
   *
   * @param  {string} endpoint absolute WP REST API endpoint
   * @return {Array}  all cookies
   */
  authenticateAndGetCookie : function(endpoint, username, psswd) {

    var options = {
        method: 'POST',
        uri: endpoint,
        simple: false,
        form: {
            log : username,
            pwd : psswd
        },
        headers: {
            /* 'content-type': 'application/x-www-form-urlencoded' */ // Is set automatically
        }
    };
    return new Promise(function(resolve, reject) {
      request(options, function(error, response, body) {
        if (! error) {
          try {
            var cookies = response.headers['set-cookie'];
          } catch(e) {
            error = e;
          }
        }
        if (error) return reject(error);
        resolve(cookies);
      })
    })
  },

  restAPIRequestWithAuthenticationCookie : function (options) {
    var options = (options) ? options : {};
    var endpoint = options.endpoint;
    var authcookie = (options.authcookie) ? options.authcookie : "";

    var headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
        'Cookie': authcookie,
        'Connection': 'keep-alive'
    };

    return new Promise(function(resolve, reject) {
      if (! endpoint ) reject(new Error("no endpoint supplied!"));
      request({headers  : headers, uri : endpoint}, function(error, response, body) {
        if (error) return reject(error);
        resolve(body);
      });
    })

  }


}
