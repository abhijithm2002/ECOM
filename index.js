const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://abhijithm050:Abhijithm2002@cluster0.zapwzr2.mongodb.net/Ecommerce");

const express = require("express")
const session = require('express-session');
const app = express();
const path = require('path')
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
require('dotenv').config()


app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));


app.use(express.static(path.join(__dirname, 'public')));


const multer = require('multer')
app.use('/uploads', express.static('uploads'))
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});


const upload = multer({ storage: storage });

//  For user routes

const userRoute = require('./routes/userRoute');
app.use('/', userRoute)


// For Admin Routes

const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute)

app.use("*", async (req, res) => {
  res.redirect("/404page");
});


const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
