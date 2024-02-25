require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('./models/User');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(session({
  secret: 'se2228',
  resave: false,
  saveUninitialized: false,
}));

//Home page
app.get('/',async(req,res) => {
  try {
    if(!req.session.userId){
      res.redirect('/login');
      return;
    }
    const user = await User.findById(req.session.userId);
    res.render('pages/home', {user: user});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
//Profile
app.get('/profile/:id',async (req,res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).populate('posts').populate('friends');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if(req.session.userId===null){
      res.redirect('/login');
      return;
    }
    res.render('pages/userpage', {user: user, id: req.session.userId});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
//Registration page
app.get('/register',function(req,res) {
  if(req.session.userId != null){
    res.redirect("/");
    return;
  }else{
    res.render('pages/reg');
  }
});
//Login page
app.get('/login',function(req,res) {
  if(req.session.userId != null){
    res.redirect("/");
    return;
  }else{
    res.render('pages/login');
  }
});
//About
app.get('/about',function(req,res) {
  if(req.session.userId===null){
    res.redirect('/login');
    return;
  }
  res.render('pages/about');
});

// Регистрация
app.post('/auth/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email is required and must be valid'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
], async (req, res) => {
  // Проверка результатов валидации
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Проверка на существование пользователя с таким же email или username
    let user = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    // Создание нового пользователя
    user = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword
    });

    await user.save();
    req.session.userId = user.id;
    res.redirect("/");
    return;
  } catch (error) {
    res.status(500).json({ message: 'Server error during the registration process' });
  }
});

// Авторизация
app.post('/auth/login', [
  body('email').isEmail().withMessage('Email is required and must be valid'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  // Проверка результатов валидации
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Поиск пользователя по email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials, user not found' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials, password does not match' });
    }

    //Добавление id пользователя в сессию
    req.session.userId = user.id;
    res.redirect("/");
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error during the login process');
  }
});


app.listen(PORT, () => {
  console.log(`\n SERVER RUNNING ON ----> http://localhost:${PORT} \n`);
});
