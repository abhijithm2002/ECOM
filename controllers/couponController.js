const Coupon = require('../models/couponModel');
const Category = require('../models/categoryModel');
const Orders = require('../models/ordersModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel')
const Product = require('../models/productModel');
const moment = require('moment')
const cron = require('node-cron');

const formatedCouponDate = (date) => {
    return moment(date).format('MMMM DD, YYYY hh:mm A');

};

const loadCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.find()
        res.render('coupon', { coupon, message: '', formatedCouponDate })
    } catch (error) {
        console.log(error.message)
    }
}

const addCoupon = async (req, res) => {
    try {

        const coupon = new Coupon({
            couponCode: req.body.couponCode,
            discountAmount: req.body.discountAmount,
            minPurchase: req.body.minPurchase,
            expiry: req.body.expiry,
            is_active: true
        })

        await coupon.save()
        res.redirect('/admin/coupon')

    } catch (error) {
        console.log(error.message)
    }
}


const couponAction = async (req, res) => {
    try {
        const act = parseInt(req.query.act)
        if (act == 1 || act == 0) {

            const couponId = req.query.couponId
            const couponData = await Coupon.findByIdAndUpdate(
                couponId,
                { $set: { is_active: act === 1 ? true : false } },
                { new: true }
            );

            if (couponData) {

                const coupon = await Coupon.find({});
                res.render('coupon', { coupon: coupon, message: '' });
            } else {
                console.log('User not found or update failed');

                res.status(404).send('User not found or update failed');
            }
        } else {
            console.log('Invalid act parameter');

            res.status(400).send('Invalid act parameter');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupon = async (req, res) => {
    try {
        id = req.query.id;
        await Coupon.deleteOne({ _id: id });
        res.redirect('/admin/coupon');

    } catch (error) {
        console.log(error.message)
    }
}

// const expiryCoupon = async(req, res)=>{
//     try {
//         const currentDate = new Date();

//         // Find and update coupons that have expired
//         await Coupon.updateMany(
//             { expiry: { $lte: currentDate }, is_active: true }, 
//             { $set: { is_active: false } }
//         );

//         console.log('Coupon status updated successfully.');
//     } catch (error) {
//         console.log(error.message)
//     }
// }


// cron.schedule('* * * * *', () => {
//     console.log('Running a task every minute');
//   });

module.exports = {
    loadCoupon,
    addCoupon,
    couponAction,
    deleteCoupon,
    formatedCouponDate,
    // expiryCoupon
}