var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var bunyan = require('bunyan');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var mongodb_uri = 'mongodb://localhost:27017/vomadrid';

// Create express app
var app = express();

// Create log object
var log = bunyan.createLogger({name: "vomadrid", level: 'debug'});


// Allow cors
app.use(cors());

// Mongodb connect. TODO: Make it configurable!
mongoose.connect(mongodb_uri);

mongoose.set('debug', function (collectionName, method, query, doc, options) {
    // do your own custom logging
    log.debug({'collectionName': collectionName, 'method': method, 'query': query, 'doc': doc});
})

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function(callback) {
    log.info('Mongodb connected');
});


var movieSchema = mongoose.Schema({
    spiders_used: [],
    movie_id: String,
    movie_date_added: String,
    movie_title: String,
    movie_original_title: String,
    movie_runtime: Number,
    movie_gender: String,
    movie_plot: String,
    movie_director: String,
    movie_actors: String,
    movie_country: String,
    movie_rating: Number,
    movie_poster: String,
    movie_showtimes: []
});

var movie = mongoose.model('Movie', movieSchema);

// TODO: We should get all the data here using mongoose
app.get('/v2', function(req, res) {
    movie.find(function(err, doc) {
        log.info(doc);
        res.send(doc);
    });

});

// Using mongodb driver, it works
app.get('/v1', function(req, res) {
    MongoClient.connect(mongodb_uri, function(err, db) {
        assert.equal(err, null);
        log.info('Mongodb connected');

        var docsArray = db.collection('vomovies').find().toArray().then(
            function(data) {
                res.send(data);
            },

            function(error) {
                res.send('Error getting data!');
            });

    })

});

var server = app.listen(3000, function() {
    console.log('Server running at http://localhost:' + server.address().port);
});
