const express = require("express")
const path = require('path')
const user_route = express();
const session = require('express-session');
const config = require("../config/config")
user_route.use(session({ secret: config.sessionSecret }))
const auth = require('../middleware/auth')
user_route.set('view engine', "ejs")
user_route.set('views', './views/users');
user_route.use(express.static(path.join(__dirname, 'public')));
// user_route.use(express.urlencoded({ extended: true });
const userController = require('../controllers/userController');





user_route.get('/', userController.loadHome)
user_route.get('/home', userController.loadHome)
user_route.get('/login',auth.isLogout, userController.loadLogin)
user_route.post('/login', userController.verifyLogin)
user_route.get("/logout",auth.isLogin, userController.userLogout)
user_route.get('/register',auth.isLogout, userController.loadRegister)
user_route.post('/register', userController.insertUser);
user_route.get('/verifyOtp', userController.loadVerifyOtp);
user_route.post('/verifyOtp', userController.verifyOtp)
user_route.get('/forget', userController.forgetLoad)  //isLogout
user_route.post('/forget', userController.forgetVerify)
user_route.get('/productList',userController.productList);
user_route.get('/productDetails', userController.loadProductDetails);
user_route.get('/addCart',auth.isLogin, userController.loadCart);
user_route.post('/addCart',auth.isLogin, userController.addToCart)
user_route.put("/updateCartQuantity/:id/:quantity", userController.updateCartQuantity);
user_route.get('/deleteCart',auth.isLogin,userController.deleteCart);
user_route.get('/userProfile',auth.isLogin,userController.loadUserProfile);
user_route.get('/addAddress',auth.isLogin, userController.loadAddress)
user_route.post('/addAddress',auth.isLogin,userController.addAddress)
user_route.get('/editAddress',auth.isLogin,userController.loadEditAddress)
user_route.post('/updateAddress',auth.isLogin,userController.updateAddress)
user_route.get('/checkout',auth.isLogin,userController.loadCheckout)



//......................................ORDER CONTROLLER...........................................

const orderController = require('../controllers/orderController')

user_route.post('/placeOrder', orderController.placeOrder);
user_route.get('/orderDetails', orderController.loadOrderDetails);
user_route.get('/cancelOrder', orderController.cancelOrder)


module.exports = user_route;

