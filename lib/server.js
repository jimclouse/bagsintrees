var path            = require('path');
var engines         = require('consolidate');
var _               = require('underscore');
var express         = require('express');
var colors          = require('colors');
var fetchBags       = require('./mysqlFetchBags');
var mysqlClient     = require('./mysqlClient');
var q               = require('q');

/* get the port situated based on environment */
if (process.env['ENVIRONMENT'] == "production") {
    var _port = 8080;
}
else {
    var _port = 9001;
}

console.log(("Configuring app to use port: " + _port).green);

var app = express();
app.set('root', process.cwd()); // Need this to find the project root directory

app.configure(function() {
    app.use(express.favicon(app.get("root") + '/public/img/favicon.ico'));
    app.use('/node_modules',  express.static(app.get("root") + '/node_modules'));
    app.use('/bower_components',  express.static(app.get("root") + '/bower_components'));
    app.use(express.static(app.get("root") + '/public'));
    app.use(express.json());       // to support JSON-encoded bodies
    app.use(express.urlencoded()); // to support URL-encoded bodies
});

// route for setting up instagram subscription
app.get('/igrm/newbag', function(req, res) {
    res.send(req.query['hub.challenge']);
});

// route for downloading instagram images
app.post('/igrm/newbag', function(req, res) {
    console.log("Starting fetchBags");
    fetchBags.fetch(function(msg) {
        console.log(msg);
        res.send("OK");
    });
});

// client routes
app.get('/bags/all', function(req, res) {
    mysqlHandler("select * from photos;", res);
});

// user data
app.get('/user/:id', function(req, res) {
    var query = "select name, profilePicture, count(*) as tagCount from users u join photos p on u.id = p.userId where u.id = '" + req.params.id + "' group by u.name, u.profilePicture;";
    mysqlHandler(query, res);
});

// user bags
app.get('/user/bags/:id', function(req, res) {
    var query = "select * from photos where userId = '" + req.params.id + "';";
    mysqlHandler(query, res);
});

app.get('/bags/one/:id', function(req, res) {
    mysqlClient.promiseQuery("select * from photos where id = '" + req.params.id + "';")
    .then(function(data) {
        if(!data) {
            console.error("Get One Bag query for id " + req.params.id + " returned, but with undefined rows.");
            res.status(500).json({ error: "Get One Bag query for id " + req.params.id + " returned, but with undefined rows."});
        }
        mysqlClient.promiseQuery("select c.comment, u.name, c.userId from comments c join users u on c.userId = u.id where c.photoId = '" + req.params.id + "';")
        .then(function(comments) {
            var results = {photo: data[0], comments: comments}
            res.send(results);
        })
        .catch(function(err) {
            console.error(err);
            res.status(500).json({ error: err });
        });
    })
    .catch(function(err) {
        console.error(err);
        res.status(500).json({ error: err });
    });
});

var mysqlHandler = function(query, res) {
    mysqlClient.query(query, function(rows, err) {
        if(err) {
            console.error(err);
            res.status(500).json({ error: err });
        }
        else {
            res.send(rows);
        }
    });
};

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.redirect('/#/404');
});

var server = app.listen(_port, function() {
    console.log('#BagsInTrees now listening to the rustle of plastic on port %d'.green, server.address().port);
});
