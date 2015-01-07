var expect = require("chai").expect;
var Trakt = require("../main.js");
var createHash = require('crypto').createHash;

describe("TraktAPI2", function(){

    var trakt;

    before(function(cb){
        trakt = new Trakt('client id', true /* Debug mode */);
        trakt.setAccessToken('oauth access token');
        cb();
    });
/*
    it("should authorize successfully", function(done){
        this.timeout(30000);
        trakt.oauth.token({
            code: '',
            client_id: '',
            client_secret: '',
            redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
            grant_type: 'authorization_code'
        }).done(function(result){
            trakt.setAccessToken(result.access_token);
            done();
        });
    });
*/

    it("should deliver watchlist for movies", function(done){
        this.timeout(30000);
        trakt.users.username.watchlist.type({
            username: 'PatrickE94',
            type: 'movies',
            extended: 'full'
        }).done(function(result){
            done();
        })
    });

    it("should deliver popular movies", function(done){
        this.timeout(30000);
        trakt.movies.popular({
            page: 1,
            limit: 10
        }).done(function(result){
            done();
        });
    })

});
