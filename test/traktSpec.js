var expect = require("chai").expect;
var Trakt = require("../trakt.js");

describe("TraktAPI2", function(){

    var trakt;

    before(function(cb){
        trakt = new Trakt({
          client_id: "id",
          client_secret: "secret",
          api_url: "https://private-anon-5f899f152-trakt.apiary-mock.com"
        }, true);
        cb();
    });

    it("should generate a user url for auth", function(done) {
      var str = trakt.authUrl();
      console.log(str);
      done();
    });

    it("should parse url correctly", function(done) {
      var str = trakt._parseUrl({
          "opts": { "auth": "optional", "pagination": false },
          "method": "GET",
          "url": "/calendars/movies/:start_date/:days",
          "optional": [ "start_date", "days" ]
      });
      if (str == "https://private-anon-5f899f152-trakt.apiary-mock.com/calendars/movies") done();
    });

    it("should parse url correctly again", function(done) {
      var str = trakt._parseUrl({
          "opts": { "auth": false, "pagination": true },
          "method": "GET",
          "url": "/search?query=&type=&year=&id=&id_type=",
          "optional": [ "type", "query", "id", "id_type" ]
      }, {query: "hello"});
      if (str == "https://private-anon-5f899f152-trakt.apiary-mock.com/search?query=hello") done();
    });

    it("should deliver watchlist for movies", function(done){
      this.timeout(30000);
      trakt.users.watchlist({
          username: 'PatrickE94',
          type: 'movies',
          extended: 'full'
      }).catch(function(err) {
        done(err);
      }).then(function(data) {
        done();
      });
    });

    it("should deliver popular movies", function(done){
        this.timeout(30000);
        trakt.movies.popular({
            page: 1,
            limit: 10
        }).catch(function(err) {
          done(err);
        }).then(function(data) {
          done();
        });
    });

});
