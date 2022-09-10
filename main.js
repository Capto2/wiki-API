//jshint:6
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { application } = require("express");

const app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/wikiDB", { useNewUrlParser: true });

const wikiSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const wikiModel = new mongoose.model("article", wikiSchema);
app.get("/", function (request, response) {
  response.render("index");
});

//////////////////////////////////Request targetting all articles/////////////////////////////////////////////
app
  .route("/articles")
  .get(function (request, response) {
    wikiModel.find({}, function (error, foundData) {
      if (error) {
        console.log(error);
      } else {
        response.send(foundData);
      }
    });
  })
  .post(function (request, response) {
    const title = request.body.title;
    const content = request.body.content;
    const data = new wikiModel({
      title: title,
      content: content,
    });
    data.save(function (error) {
      if (!error) {
        response.send("Saved Successfully !!!");
      } else {
        response.send(error);
      }
    });
  });

///////////////////////////////////////////Request targetting spcific artice////////////////////////////////////

app
  .route("/artricles/:articleTitle")
  .get(function (request, response) {
    const reqTitle = request.params.articleTitle;
    wikiModel.findOne({ title: reqTitle }, function (error, result) {
      if (error) {
        response.send("No article found matching !!!");
        console.log(error);
      } else {
        response.send(result);
      }
    });
  })
  .delete(function (request, response) {
    wikiModel.deleteMany(function (error) {
      if (!error) {
        response.send("Deleted files successfully !!!");
      } else {
        response.send(error);
      }
    });
  })
  .put(function (request, response) {
    wikiModel.update(
      { title: request.params.articleTitle },
      { title: request.body.title, content: request.body.content },
      { overwrite: true },
      function (error) {
        if (!error) {
          response.send("Successfully updated articles.");
        } else {
          response.send("Not saved ");
        }
      }
    );
  })
  .patch(function (request, response) {
    request.body = {
      title: "TEST",
      content: "TEST",
    };
    wikiModel.update(
      { title: request.params.articleTitle },
      { $set: { content: "API meaning", title: "The meaning of API is just short foe application programming interface."},
    function(error){
      if (!error){
        response.send("No error found so updated successfully");
      }else{
        console.log(error);
      }
    }}
    );
  }).delete(function(request, response){
    wikiModel.deleteOne({title: request.params.articleTitle}, function(error){
      if(!error){
        response.send("Successfully deleted article with title: " + request.params.articleTitle);
      }else{
        response.send(error);
      }
    });
  });

app.listen(3000, function () {
  console.log("Server has started on port 3000");
});
