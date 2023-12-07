const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/ecommerce_Project");

const express = require("express")
const session = require('express-session');
const app = express();
const path = require('path')
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

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

port = 8000;
app.listen(port,()=>{console.log('server started in http://localhost:8000')})
