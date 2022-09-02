const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 1. 세션 사용하기
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  })
);

// 2. 패스포트 초기화
app.use(passport.initialize());

// 3. 패스포트 세션 사용하기
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', 'views');

main().catch(() => console.log('error'));

async function main() {
  mongoose.connect(process.env.MONGO_URI).then(() => console.log('connected'));

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String,
  });

  // 4. 스키마에 플러그인 추가하기
  userSchema.plugin(passportLocalMongoose);
  userSchema.plugin(findOrCreate);

  const User = mongoose.model('User', userSchema);

  // 5. 작업 코드 생성

  passport.use(User.createStrategy());

  // passport.serializeUser(User.serializeUser());
  // passport.deserializeUser(User.deserializeUser());

  // Google 로그인 세션을 MongoDB에 추가하기 위해 직렬화, 역직렬화 코드를 변경
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture,
      });
    });
  });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/secrets',
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
      },
      function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
          return cb(err, user);
        });
      }
    )
  );

  app.get('/', function (req, res) {
    res.render('home');
  });

  app.get('/register', function (req, res) {
    res.render('register');
  });

  // 6. 입력한 데이터를 이용하여 회원 가입
  app.post('/register', function (req, res) {
    const { username, password } = req.body;
    User.register({ username }, password, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect('/register');
      } else {
        passport.authenticate('local')(req, res, function () {
          res.redirect('/secrets');
        });
      }
    });
  });

  app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
  );

  app.get(
    '/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
      res.redirect('/secrets');
    }
  );

  app.get('/secrets', function (req, res) {
    User.find({ secret: { $ne: null } }, function (err, foundUsers) {
      if (err) {
        console.log(err);
      } else {
        if (foundUsers) {
          res.render('secrets', { usersWithSecrets: foundUsers });
        }
      }
    });
  });

  app.get('/login', function (req, res) {
    res.render('login');
  });

  app.post('/login', function (req, res) {
    const { username, password } = req.body;
    const user = new User({
      username,
      password,
    });

    // 패스포트는 로그인 기능도 지원합니다.
    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate('local')(req, res, function () {
          res.redirect('/secrets');
        });
      }
    });
  });

  // 물론 로그아웃 기능도 지원합니다.
  app.get('/logout', function (req, res) {
    req.logout((err) => console.log(err));
    res.redirect('/');
  });

  app.get('/submit', function (req, res) {
    if (req.isAuthenticated()) {
      res.render('submit');
    } else {
      res.redirect('/login');
    }
  });

  app.post('/submit', function (req, res) {
    const submittedSecret = req.body.secret;

    User.findById(req.user.id, function (err, foundUser) {
      if (err) console.log(err);
      else {
        if (foundUser) {
          foundUser.secret = submittedSecret;
          foundUser.save(function () {
            res.redirect('/secrets');
          });
        }
      }
    });
  });

  app.listen(
    process.env.PORT || 3000,
    console.log('Server started on port 3000')
  );
}
