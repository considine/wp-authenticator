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
var testGetPostUrl = baseUrl  + "/index.php/wp-json/wp/v2/posts/";




describe("node-wp-auth", function() {
  if (! username || ! password || !baseUrl) {
    throw new Error("Please set your test username and password in the .env file in the root. see .env-sample to get started");

  }



  describe("#authenticateWithCredentials()", function() {
    it('should return a valid cookie when authenticating on a valid uri with valid login params', function (done) {
      WpAuthenticator.authenticateWithCredentials(loginUrl, {formbody : {log : username, pwd : password}}).then((resp) => {
        var cookie = WpAuthenticator.extractCookie(resp);
        done();
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
      WpAuthenticator.authenticateWithCredentials(loginUrl, {formbody : {log : username, pwd : password}})
      .then((resp) => {
        return {authcookie : WpAuthenticator.extractCookie(resp), endpoint : endpoint};
      })
      .then(WpAuthenticator.restAPIRequestWithAuthenticationCookie)
      .then((resp) => {
        done();
      })
      .catch((e) => done(e));
    });
  });

  describe("#restAPIRequestWithToken()", function() {
    // it ("should retrieve posts with just a token", function(done) {
    //   // Get token
    //   WpAuthenticator.restAPIRequestWithToken({"token" : process.env.wp_test_token, "endpoint" : testGetPostUrl})
    //   .then((resp) => {
    //     done();
    //   })
    //   .catch((e) => {
    //     done(e);
    //   })
    // });


    it("should be able to retrieve a token and use it in authentication", function (done) {
      WpAuthenticator.authenticateWithCredentials(baseUrl + "/index.php/wp-json/jwt-auth/v1/token", {jsonbody : {username : username, password : password}})
      .then((resp) => {
        return resp.body;
        // try {
        //   return  JSON.parse(resp.body);
        // } catch(e) {
        //   throw new Error("failed to parse json: " + JSON.stringify(resp));
        // }
      })
      .then((jsonbody) => {
        var token = jsonbody["token"];
        console.log(jsonbody);
        return {"endpoint" : testGetPostUrl, "token" : token}
      })
      .then(WpAuthenticator.restAPIRequestWithToken)
      .then((resp) =>{

        done();
      } )
      .catch((e) => {
        done(e);
      });
    });
  });

});
