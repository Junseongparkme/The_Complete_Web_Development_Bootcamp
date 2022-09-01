const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static('public'));

app.listen(process.env.PORT || 3000, function () {
  console.log('Server started on port 3000');
});

main().then(() => console.log('Connected'));

async function main() {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  });

  const articleSchema = {
    title: String,
    content: String,
  };

  const Article = mongoose.model('article', articleSchema);

  app
    .route('/articles')
    .get(function (req, res) {
      Article.find(function (err, foundArticles) {
        if (!err) {
          res.send(foundArticles);
        } else {
          res.send(err);
        }
      });
    })
    .post(function (req, res) {
      const newArticle = new Article({
        title: req.body.title,
        content: req.body.content,
      });

      newArticle.save(function (err) {
        if (!err) {
          res.send('Successfully added a new article');
        } else {
          res.send(err);
        }
      });
    })
    .delete(function (req, res) {
      Article.deleteMany({}, function (err) {
        if (!err) {
          res.send('All articles are deleted.');
        } else {
          res.send(err);
        }
      });
    });
  app
    .route('/articles/:articleTitle')
    .get(function (req, res) {
      const title = req.params.articleTitle;
      Article.findOne({ title }, function (err, article) {
        if (!err) {
          res.send(article);
        } else {
          res.send(err);
        }
      });
    })
    .put(function (req, res) {
      const title = req.params.articleTitle;
      Article.findOneAndUpdate(
        { title },
        { title: req.body.title, content: req.body.content },
        { overwrite: true },
        function (err) {
          if (!err) {
            res.send('Successfully updated!');
          } else {
            res.send(err);
          }
        }
      );
    })
    .patch(function (req, res) {
      const title = req.params.articleTitle;
      Article.findOneAndUpdate(
        { title },
        { $set: { title: req.body.title, content: req.body.content } },
        function (err) {
          if (!err) {
            res.send('Successfully Updated!');
          } else {
            res.send(err);
          }
        }
      );
    })
    .delete(function (req, res) {
      const title = req.params.articleTitle;
      Article.deleteOne({ title }, function (err) {
        if (!err) {
          res.send('Successfully Deleted.');
        } else {
          res.send(err);
        }
      });
    });
}
