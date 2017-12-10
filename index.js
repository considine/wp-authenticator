var request = require("request");
var cookie = require('cookie');



var baseHeader  = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
    'Connection': 'keep-alive'
};
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
  authenticateWithCredentials : function(endpoint, options) {
    return new Promise(function(resolve, reject) {
      if (! options || (! options.jsonbody && ! options.formbody )) throw new Error ("options must contain auth credentials");
      var reqoptions = {
          method: 'POST',
          uri: endpoint,
          simple: false,
          form: options.formbody,
          body : options.jsonbody,
          json : !!options.jsonbody,
          headers: {
              /* 'content-type': 'application/x-www-form-urlencoded' */ // Is set automatically
          }
      };
      request(reqoptions, function(error, response, body) {
        if (error) return reject(error);
        resolve(response);
      })
    })
  },
  extractCookie : function (resp) {
    if (! resp || ! resp.headers || ! resp.headers["set-cookie"] ) throw new Error("Response has no cookie!");
    return resp.headers['set-cookie'];
  },
  restAPIRequestWithAuthenticationCookie : function (options) {
    var options = (options) ? options : {};
    var endpoint = options.endpoint;
    var authcookie = (options.authcookie) ? options.authcookie : "";

    var headers = JSON.parse(JSON.stringify(baseHeader));
    headers["Cookie"] = authcookie;
    return new Promise(function(resolve, reject) {
      if (! endpoint ) reject(new Error("no endpoint supplied!"));
      request({headers  : headers, uri : endpoint}, function(error, response, body) {
        if (error) return reject(error);
        if ((response.statusCode + "")[0] == '4') reject("Authentication failed")
        resolve(body);
      });
    })
  },
  restAPIRequestWithToken : function (options) {
    var headers = JSON.parse(JSON.stringify(baseHeader));
    options = (options) ? options : {};
    var endpoint = options.endpoint;
    var token = options.token;
    if (! token || ! endpoint) {
      throw new Error("options requires an 'endpoint' and 'token'");
    }
    headers["Authorization"] = "Bearer " + token;
    // console.log(headers);
    return new Promise(function(resolve, reject) {
      request({headers: headers, uri : endpoint}, function(error, response, body) {
        if (error) reject(error);
        if ((response.statusCode + "")[0] == '4') reject("Authentication failed")
        resolve(body);
      });
    });
  }
}
