request = require('request')
q = require('q')
parser = require('xml2json');

module.exports = {

    obtainAuth: function(req, res) {
        if(!req.query.code) {
            throw new Error("no code!");
        }
        var url = 'https://www.linkedin.com/uas/oauth2/accessToken?grant_type=authorization_code&code=' + req.query.code + '&redirect_uri=http://www.bagsintrees.org/liRedirect&client_id=77fzr2ee6e1qaw&client_secret=GswYIHSfOuRP3VKh'
        var options = {
            url: url,
            method: 'POST'
        } 

        request(options, function (error, response, body) {
            if(body.error) {
                console.error(body.error + ": " + body.error_description)
                return
            }
            console.log(body)
            return body
        });
    },
    liSearch: function(req, res) {
        d = q.defer();

        var url = 'https://api.linkedin.com/v1/company-search?keywords=' + req.query.term
        options = {
            url: url,
            headers: {
                Host: 'api.linkedin.com',
                Connection: 'Keep-Alive',
                Authorization: 'Bearer AQWvaoCzE96drAit_pPw6BNna9qW5x88Q_M-vChK038ngIkQU6kTECQj0--1Vbxfb7guzqKhySRKKnm12JV-0QDufDhirpGSlVhatyl8oHXEOvwVq5EPU9qlgQgeUTXdrdsOSBTkJr8YJLfZR_ZPCVjpAlqdH9TezAzXvmNIdklJtfm2ZnU'
            }
        }
        request(options, function (error, response, body) {
            if(body.error) {
                var err = body.error + ": " + body.error_description;
                console.error(err);
                d.reject(err);
            }

            var newjson = parser.toJson(body);
            d.resolve(newjson);
            
        });

        return d.promise;
    }
}