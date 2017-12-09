/**
* @author Jack Considine <jackconsidine3@gmail.com>
* @package node-wp-auth
* 2017-12-07
*/


require('dotenv').config()

var WpAuthenticator = require("../index");

var username = process.env.wp_username;
var password = process.env.wp_password;
var baseUrl = process.env.wp_uri;

if (baseUrl[baseUrl.length-1] === "/") baseUrl = baseUrl = baseUrl.substring(0, baseUrl.length - 1);


var loginUrl = baseUrl  + "/wp-login.php";
var testGetPostUrl = baseUrl  + "/index.php/wp-json/wp/v2/posts/110";




describe("node-wp-auth", function() {
  if (! username || ! password || !baseUrl) {
    throw new Error("Please set your test username and password in the .env file in the root. see .env-sample to get started");

  }
  describe("#authenticateAndGetCookie()", function() {
    it('should return a valid cookie when authenticating on a valid uri with valid login params', function (done) {
      WpAuthenticator.authenticateAndGetCookie(loginUrl, username, password).then((cookie) => {
        if (cookie) done();
        if (! cookie ) done (new Error("no valid cookie returned!"));
      })
      .catch((e) => {
        done(e);
      });
    });

    it ('should not allow posts to be returned where no authenticated cookie has been passed', function(done){
      WpAuthenticator.restAPIRequestWithAuthenticationCookie(testGetPostUrl, "nocookie=true")
      .then((resp) => {
        if (resp.statusCode && resp.statusCode === 401) throw new Error("unauthorized!");
        done(new Error("should not have gotten posts!"));
      })
      .catch((e) => {
        done();
      })
    });

    it ("should be able to retrieve posts (where REST has been disabled)", function (done) {
      var endpoint = testGetPostUrl;
      WpAuthenticator.authenticateAndGetCookie(loginUrl, username, password)
      .then((cookie) => {
        return {authcookie : cookie, endpoint : endpoint};
      })
      .then(WpAuthenticator.restAPIRequestWithAuthenticationCookie)
      .then((resp) => {
        console.log(resp);
        done();
      })
      .catch((e) => done(e));
    });
  });
});
