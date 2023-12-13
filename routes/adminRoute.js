const express = require('express');
const path = require('path')
const admin_route = express();
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
// const session = require('express-session');
const config = require("../config/config")
const auth = require('../middleware/adminAuth')
// admin_route.use(session({ secret: config.sessionSecret }))
admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin')
admin_route.use(express.static(path.join(__dirname, 'public')))
// admin_route.use(express.urlencoded({ extended: true }))
const adminController = require('../controllers/adminController')




admin_route.get('/', auth.isLogout, adminController.loadLogin);
admin_route.post('/',  adminController.verifyLogin);
admin_route.get('/dashboard', auth.isLogin, adminController.loadDashboard);
admin_route.get('/userslist', auth.isLogin, adminController.newUserLoad);
admin_route.get('/useraction', auth.isLogin, adminController.userAction);
admin_route.get('/addCategory', auth.isLogin, adminController.loadCategory);
admin_route.post('/addCategory', auth.isLogin, adminController.addCategory);
admin_route.get('/categoryaction', auth.isLogin, adminController.categoryAction);
admin_route.get('/editCategory', auth.isLogin, adminController.loadEditCategory);
admin_route.post('/editCategory', auth.isLogin, adminController.updateCategory);
admin_route.get('/deleteCategory', auth.isLogin, adminController.deleteCategory);
admin_route.get('/addProduct', auth.isLogin, adminController.loadAddProduct);
admin_route.post('/addProduct', upload.array("image", 5), adminController.addProduct);
admin_route.get('/productList', auth.isLogin, adminController.loadProductList);
admin_route.get('/productaction', auth.isLogin, adminController.productAction);
admin_route.get('/editProduct', auth.isLogin, upload.array("image", 5), adminController.loadEditProduct);
admin_route.post('/editProduct', auth.isLogin, upload.array("image", 5), adminController.updateProduct)
admin_route.get('/deleteProduct', auth.isLogin, adminController.deleteProduct);
admin_route.get('/orderList', auth.isLogin, adminController.loadOrderList)
admin_route.get('/orderDetails', adminController.loadOrderDetails)
admin_route.post('/orderStatus', auth.isLogin, adminController.orderStatus);



//...............................................CouponController............................................

const couponController = require('../controllers/couponController')

admin_route.get('/coupon',couponController.loadCoupon);
admin_route.post('/coupon',couponController.addCoupon);
admin_route.get('/couponaction',couponController.couponAction);
admin_route.get('/deleteCoupon',couponController.deleteCoupon);
// admin_route.get('/expiryCoupon', couponController.expiryCoupon);


admin_route.get("*", (req, res) => {

    res.redirect("/")
})
module.exports = admin_route;
