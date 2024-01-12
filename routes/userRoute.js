const express = require("express")
const path = require('path')
const user_route = express();
// const session = require('express-session');
const config = require("../config/config")
// user_route.use(session({ secret: config.sessionSecret }))
const auth = require('../middleware/auth')
user_route.set('view engine', "ejs")
user_route.set('views', './views/users');
user_route.use(express.static(path.join(__dirname, 'public')));
// user_route.use(express.urlencoded({ extended: true });
const userController = require('../controllers/userController');



user_route.get('/',userController.loadHome)
user_route.get('/home',auth.isBlocked, userController.loadHome)
user_route.get('/login',auth.isLogout, userController.loadLogin)
user_route.post('/login', userController.verifyLogin)
user_route.get("/logout",auth.isLogin, userController.userLogout)
user_route.get('/register',auth.isLogout, userController.loadRegister)
user_route.post('/register', userController.insertUser);
user_route.post('/checkReferral',userController.checkReferral);
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
user_route.get('/checkout',auth.isLogin,userController.loadCheckout);
user_route.get('/applyCoupon',auth.isLogin,userController.applyCoupon);
user_route.get('/404page',userController.load404Page);
user_route.get('/about',userController.loadAbout);
user_route.get('/contact', userController.loadContact);
user_route.post('/contact',auth.isLogin,userController.addContact)


//......................................ORDER CONTROLLER...........................................

const orderController = require('../controllers/orderController')

user_route.post('/placeOrder',auth.isLogin, orderController.placeOrder);
user_route.get('/orderDetails',auth.isLogin, orderController.loadOrderDetails);
user_route.get('/cancelOrder',auth.isLogin, orderController.cancelOrder);
user_route.get('/returnOrder',auth.isLogin,orderController.returnOrder);
user_route.post('/onlinePayment',auth.isLogin,orderController.onlinePayment);
user_route.get('/onlinePayment',auth.isLogin, orderController.paymentSuccess);
user_route.get('/checkWallet',auth.isLogin, orderController.checkWallet);
user_route.get('/walletPayment',auth.isLogin, orderController.walletPayment);



//......................................WISHLIST CONTROLLER.............................................

const wishlistController = require('../controllers/wishlistContoller')

user_route.get('/wishlist',auth.isLogin,wishlistController.loadWishlist);
user_route.get('/addToWishlist',auth.isLogin,wishlistController.addToWishlist);
user_route.post('/wishlist/addCart',auth.isLogin,wishlistController.addToCart);
user_route.get('/deleteWishlist',auth.isLogin,wishlistController.deleteWishlist)
 

module.exports = user_route;

