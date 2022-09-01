const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const homeStartingContent =
  'Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in';
const aboutContent =
  'Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed.';
const contactContent =
  'Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.';

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

main().catch((err) => console.log(err));

async function main() {
  mongoose.connect(process.env.MONGO_URI).then(() => console.log('connected'));

  const postSchema = {
    title: String,
    content: String,
  };

  const Post = mongoose.model('Post', postSchema);

  app.get('/', function (req, res) {
    Post.find(function (err, postsList) {
      res.render('home', {
        startingContent: homeStartingContent,
        posts: postsList,
      });
    });
  });

  app.get('/about', function (req, res) {
    res.render('about', { aboutContent: aboutContent });
  });

  app.get('/contact', function (req, res) {
    res.render('contact', { contactContent: contactContent });
  });

  app.get('/compose', function (req, res) {
    res.render('compose');
  });

  app.post('/compose', function (req, res) {
    const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody,
    });

    post.save();
    res.redirect('/');
  });

  app.get('/posts/:postId', function (req, res) {
    const id = req.params.postId;
    Post.findOne({ _id: id }, function (err, post) {
      if (err) console.log(err);
      else res.render('post', { title: post.title, content: post.content });
    });
  });
}

app.listen(process.env.PORT || 3000, function () {
  console.log('Server started on port 3000');
});
