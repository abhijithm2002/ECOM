const User = require('../models/userModel')
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const Orders = require('../models/ordersModel')
const Coupon = require('../models/couponModel');
const moment = require('moment')


const formatedCouponDate = (date) => {
    return moment(date).format('MMMM DD, YYYY hh:mm A');

};




const loadDashboard = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }

         const orderId = req.query.orderId;
        // Date range filter
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const query = {
            $or: [
                { paymentStatus: { $regex: '.*' + search + '.*', $options: 'i' } },
                { 'userId.name': { $regex: '.*' + search + '.*', $options: 'i' } },
            ],
            ...dateFilter, // Merge date filter with the main query
        };

        // Get the total count without applying limit and skip
        const count = await Orders.find(query).countDocuments();

        // Apply limit and skip only for displaying the current page
        const order = await Orders.find(query)
            .populate('products.productId')
            .populate('category')
            .populate('userId')
            

            const orderData = await Orders.find().populate('products.productId').populate('userId')
               const product = await Product.find({ is_active: true });
                const user = await User.find({});
                   const category = await Category.find({ is_active: true });
            
                   const totalRevenue = orderData.reduce((total, order) => total + order.totalAmount, 0);
            

        res.render('dashboard', {
                      order,
                      orderId: orderId,
                       totalRevenue,
                        user,
                        product,
                         category,
                     formatedCouponDate,
                        startDate,
                        endDate,
                        orderData
                     });
    } catch (error) {
        console.log(error.message);
    }
};



module.exports = {
    loadDashboard,
    formatedCouponDate
};