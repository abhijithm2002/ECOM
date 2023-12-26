const User = require('../models/userModel')
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const Orders = require('../models/ordersModel')
const Coupon = require('../models/couponModel');
const moment = require('moment')


const formatedCouponDate = (date) => {
    return moment(date).format('MMMM DD, YYYY hh:mm A');

};

// const loadDashboard = async (req, res) => {
//     try {
//         const  orderId = req.query.orderId;
//         const orders = await Orders.find().populate('products.productId').populate('userId');
//         const totalProducts = await Product.countDocuments({ is_active: true });
//         const totalOrders = orders.length;
//         const uniqueCustomers = new Set(orders.map(order => order.userId.toString())).size;

//         const totalRevenue = orders.reduce((total, order)=> total + order.totalAmount,0)
//         res.render('dashboard',{orders,orderId:orderId, totalOrders, uniqueCustomers,totalProducts, totalRevenue});
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const loadDashboard = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const order = await Orders.find().populate('products.productId').populate('category').populate('userId').sort({ orderDate: -1 });
        const product = await Product.find({ is_active: true })
        const user = await User.find({})
        const category = await Category.find({is_active:true})


        // const totalProducts = await Product.countDocuments({ is_active: true });
        // const totalOrders = order.length;
        // const uniqueCustomers = new Set(order.map(order => order.userId.toString())).size;      
        const totalRevenue = order.reduce((total, order) => total + order.totalAmount, 0)




        res.render('dashboard', {
            order,
            orderId: orderId,
            // totalOrders,
            // uniqueCustomers,
            // totalProducts,
            totalRevenue,
            user,
            product,
            category,
            formatedCouponDate,


        });
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadDashboard,
    formatedCouponDate
};