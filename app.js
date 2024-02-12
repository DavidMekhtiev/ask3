const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const registrationController = require('./controllers/registration');
const loginController = require('./controllers/login');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(cors());


app.get('/',function(req,res) {
  res.render('pages/home');
});
app.get('/profile',function(req,res) {
  res.render('pages/userpage');
});
app.get('/register',function(req,res) {
  res.render('pages/reg');
});
app.get('/login',function(req,res) {
  res.render('pages/login');
});


app.post('/auth/register', function(req,res) {
  res.redirect("/")
});
app.post('/auth/login', function(req,res) {
  res.redirect("/")
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
