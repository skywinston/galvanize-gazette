var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.DB_URI || 'localhost/galvanize-gazette');
var stories = db.get('stories');
var opinions = db.get('opinions');

router.get('/stories', function (req, res) {
    stories.find({}, function (err, docs) {
        res.json(docs);
    });
});

router.get('/stories/:id', function (req, res) {
   stories.findById(req.params.id, function (err, doc) {
       res.json(doc);
   })
});

router.get('/opinions/:id', function (req, res) {
    opinions.find({story_id: req.params.id}, function (err, docs) {
        console.log("Opinions associated with Story ID " + req.params.id + ":");
        console.log(docs);
        res.json(docs);
    });
});

router.post('/opinions', function (req, res) {
   opinions.insert({story_id: req.body.story_id, opinion: req.body.opinion}, function (err, doc) {
       console.log("Opinion inserted into DB: ");
       console.log(doc);
       res.json(doc);
   });
});

router.post('/stories', function (req, res) {
    stories.insert(req.body, function (err, doc) {
        res.json(doc);
    });
});

module.exports = router;
