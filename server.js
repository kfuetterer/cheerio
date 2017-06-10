var express = require("express");
var exhbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/newyorktimesarticles");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

app.get("/scrape", function(req, res) {

  request("https://www.nytimes.com/section/world?WT.nav=bottom-well&action=click&hpw&module=well-region&pgtype=Homepage&region=bottom-well&rref", function(error, response, html) {
    var $ = cheerio.load(html);
    $(".story-link").each(function(i, element) {

      var result = {};

      result.link = $(this).attr("href");
      result.headline = $(this).find("h2.headline").text();
      result.summary = $(this).find("p.summary").text();

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });
    });
  });
  res.send("Data was scraped");
});

app.get("/articles", function(req, res) {
  Article.find({}, function (error, found) {
    if (error) {
      console.log(error);
    } else {
      res.send(found);
    }
  });
});

app.get("/comments", function(req, res) {
  Comment.find({}, function (error, found) {
    if (error) {
      console.log(error);
    } else {
      res.send(found);
    }
  });
});

app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
      .populate("comment")
      .exec(function(error, doc) {
        if (error) {
          console.log(error);
        } else {
          res.send(doc);
        }
      });
});

app.post("/articles/:id", function(req, res) {
  var newComment = new Comment(req.body);
  newComment.save(function(error, doc) {
    if (error) {
      console.log(error);
    } else {
      Article.findOneAndUpdate({ "_id": req.params.id}, { "comment": doc._id })
        .exec(function(err, doc) {
          if (err) {
            console.log(err);
          } else {
            res.send(doc);
          }
      });
    }
  });
});

app.listen(3000, function() {
  console.log("App running on port 3000!");
});