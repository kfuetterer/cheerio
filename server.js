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

  request("https://www.nytimes.com/section/world?module=SiteIndex&pgtype=sectionfront&region=Footer", function(error, response, html) {
    var $ = cheerio.load(html);
    $(".story-link a").each(function(i, element) {

      var result = {};

      result.link = $(this).attr("href");
      result.headline = $(this).find("h2").filter(".headline").text();
      result.summary = $(this).find("p").filter(".summary").text();

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
          res.json("Data was scraped");
        }
      });
    });
  });
});

app.get("/", function(req, res) {
  Article.find({}, function (error, found) {
    res.json(found);
  });
});

app.get("/articles/:id", function(req, res) {
  Article.findOne({
      "_id": mongojs.ObjectId(req.params.id)
    }, function(error, article) {
      res.json(article);
    });
    Article.find({})
      .populate("comment")
      .exec(function(error, doc) {
        if (error) {
          res.send(error);
        } else {
          res.send(doc);
        }
      });
});

app.post("/articles/:id", function(req, res) {
  var newComment = new Comment(req.body);
  newComment.save(function(error, doc) {
    if (error) {
      res.send(error);
    } else {
      Article.findOneAndUpdate({}, { $set: { "comment": doc._id } }, { new: true }, function(err, newdoc) {
        if (err) {
          res.send(err);
        } else {
          res.send(newdoc);
        }
      });
    }
  });
});

app.listen(3000, function() {
  console.log("App running on port 3000!");
});