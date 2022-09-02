const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

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
  });

  // 4. 스키마에 플러그인 추가하기
  userSchema.plugin(passportLocalMongoose);

  const User = mongoose.model('User', userSchema);

  // 5. 작업 코드 생성

  passport.use(User.createStrategy());
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

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

  // 인증된 사용자만 접근 가능한 페이지
  app.get('/secrets', function (req, res) {
    if (req.isAuthenticated()) {
      res.render('secrets');
    } else {
      res.redirect('/login');
    }
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

  app.listen(
    process.env.PORT || 3000,
    console.log('Server started on port 3000')
  );
}
