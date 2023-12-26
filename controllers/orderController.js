const Orders = require('../models/ordersModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel')
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel')
const Razorpay = require('razorpay');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const placeOrder = async (req, res) => {
    try {

        const couponCode = req.body.couponSelected
        const userId = req.session.userId;
        const userData = await User.findById(userId)
        const userCart = await Cart.findOne({ userId: userId }).populate('products.productId');
        const couponData = await Coupon.findOne({ couponCode: couponCode })
        console.log('couponcode', couponCode)
        let totalAmount = parseInt(req.body.totalAmount);
        const addressIndex = parseInt(req.body.addressIndex);
        const paymentMethod = req.body.paymentMethod;
        console.log(addressIndex);
        if (couponData != null) {
            const finalPrice = totalAmount - couponData.discountAmount
            totalAmount = finalPrice;
            const obj = {
                userId: userData._id
            }
            await couponData.redeemUsers.push(obj)
            couponData.save();
        } else {
            totalAmount = parseInt(req.body.totalAmount)
        }


        let arr = [];

        userCart.products.forEach((item) => {
            arr.push({
                productId: item.productId._id,
                quantity: item.quantity,
                subtotal: item.subtotal, // Make sure to include subtotal for each product
            });
        });
        const randomId = generateRandomId()

        function generateRandomId() {
            const min = 1000000;
            const max = 9999999;

            const randomId = Math.floor(Math.random() * (max - min + 1)) + min;

            return randomId;
        }
        console.log('hello')
        console.log(randomId)
        const newOrder = new Orders({
            userId: userId,
            products: arr,
            paymentMethod: paymentMethod,
            totalAmount: totalAmount,
            addressIndex: addressIndex,
            orderId: randomId
        });

        const orderData = await newOrder.save();


        if (orderData) {
            userCart.products = [];
            await userCart.save();
            setTimeout(() => {
                res.redirect('/userProfile');
            }, 1500);
        } else {
            res.redirect('/checkout')
        }

    } catch (error) {
        console.log(error.message);
    }
};

const loadOrderDetails = async (req, res) => {
    try {
        const couponCode = req.body.couponCode
        const userId = req.session.userId


        console.log(userId)
        const orderId = req.query.id
        console.log(orderId)
        const userData = await Cart.findOne({ userId: userId }).populate('products.productId').populate('userId')
        console.log("//////////////////")
        console.log(userData)
        const orderData = await Orders.findById(orderId).populate('products.productId').populate('userId')
        const couponData = await Coupon.findOne({ couponCode: couponCode })

        console.log("orderID: " + orderData)
        res.render('orderDetails', { orders: orderData, user: userData, coupon: couponData })

    } catch (error) {
        console.log(error.message)
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const userId = req.session.userId;

        const userData = await User.findById(userId);
        const cartData = await Cart.findOne({ userId: userId }).populate('products.productId').populate('userId');
        const orderData = await Orders.findById(orderId).populate('products.productId').populate('userId');

        orderData.OrderStatus = 'Order Cancelled';
        await orderData.save();

        if (orderData.paymentStatus === 'Success') {
            userData.wallet += parseInt(orderData.totalAmount);
            console.log('total amount', orderData.totalAmount)
            console.log(userData.wallet)
            await userData.save();
            res.redirect(`/orderDetails?id=${orderId}`);
        }

        res.redirect(`/orderDetails?id=${orderId}`);
    } catch (error) {
        console.log(error.message);
    }
};



// const returnOrder = async (req, res) => {
//     try {
//         const orderId = req.query.id;
//         const userId = req.session.userId;

//         const userData = await User.findById(userId)
//         const cartData = await Cart.findOne({ userId: userId }).populate('products.productId').populate('userId');
//         const orderData = await Orders.findById(orderId).populate('products.productId').populate('userId');

//        if(orderData.OrderStatus ==='Delivered'){
//         orderData.OrderStatus = 'Returned';
//         await orderData.save();
//        }
//         if(orderData.paymentStatus === 'Success'){
//             userData.wallet += parseInt(orderData.totalAmount);
//             console.log('total amount', orderData.totalAmount)
//             console.log(userData.wallet)
//             await userData.save();
//             res.redirect(`/orderDetails?id=${orderId}`);
//         }

//         res.redirect(`/orderDetails?id=${orderId}`);
//     } catch (error) {
//         console.log(error.message);
//     }
// };
const returnOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const userId = req.session.userId;

        const userData = await User.findById(userId);
        const orderData = await Orders.findById(orderId);

        if (orderData.OrderStatus === 'Delivered') {
            orderData.OrderStatus = 'Returned';
            await orderData.save();

            if (orderData.paymentStatus === 'Success') {
                userData.wallet += parseInt(orderData.totalAmount);
                await userData.save();
            }

            res.redirect(`/orderDetails?id=${orderId}`);
        } else {

            res.redirect(`/orderDetails?id=${orderId}`);
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const onlinePayment = async (req, res) => {
    try {
        const totalAmount = parseInt(req.query.totalAmount)

        const couponCode = req.session.couponCode
        if (couponCode) {
            console.log('ronakdo')
            const couponData = await Coupon.findOne({ couponCode: couponCode })
            const discountAmount = couponData.discountAmount
            const discountTotalAmount = totalAmount - discountAmount
            // consolr.log(discountTotalAmount)
            var options = {
                amount: discountTotalAmount,
                currency: 'INR',
                receipt: 'order_rcptid_11'
            }
        } else {
            console.log('messi')
            var options = {
                amount: totalAmount,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "order_rcptid_11"
            };
        }
        razorpayInstance.orders.create(options, function (err, razorOrder) {
            // console.log(order);
            if (err) {
                // console.log('ah1')
                res.status(500).json({ message: 'error' })
            } else {
                // console.log('ah2')
                res.status(200).json({
                    razorOrder: razorOrder
                })
            }
        })

    } catch (error) {
        console.log(error.message)
    }
};

const paymentSuccess = async (req, res) => {
    try {
        const userId = req.session.userId;
        const userCart = await Cart.findOne({ userId: userId }).populate('products.productId');
        const totalAmount = parseInt(req.query.totalAmount);
        const addressIndex = parseInt(req.query.addressIndex);
        console.log(totalAmount)
        console.log(addressIndex)
        const paymentMethod = 'Paypal'

        let arr = [];

        userCart.products.forEach((item) => {
            arr.push({
                productId: item.productId._id,
                quantity: item.quantity,
                subtotal: item.subtotal,
            });
        });
        const randomId = generateRandomId()

        function generateRandomId() {
            const min = 1000000;
            const max = 9999999;

            const randomId = Math.floor(Math.random() * (max - min + 1)) + min;

            return randomId;
        }
        console.log('hello')
        console.log(randomId)

        const newOrder = new Orders({
            userId: userId,
            products: arr,
            paymentMethod: paymentMethod,
            totalAmount: totalAmount,
            addressIndex: addressIndex,
            orderId: randomId,
            paymentStatus: 'Success'
        })
        const orderData = await newOrder.save();

        if (orderData) {
            userCart.products = [];
            await userCart.save();
            setTimeout(() => {
                res.redirect('/userProfile');
            }, 1500);
        } else {
            res.redirect('/checkout')
        }

    } catch (error) {
        console.log(error.message)
    }
}


const checkWallet = async (req, res) => {
    try {
        console.log('/////////////////////////////////////////////////////')
        const couponCode = req.session.couponCode;
        const userId = req.session.userId;
        const userData = await User.findById(userId);
        const userCart = await Cart.findOne({ userId: userId }).populate('products.productId');
        let totalAmount = parseInt(req.query.totalAmount);
        const addressIndex = parseInt(req.query.addressIndex);

        const couponData = await Coupon.findOne({ couponCode: couponCode });

        if (couponData != null) {
            const finalPrice = totalAmount - couponData.discountAmount;
            totalAmount = finalPrice;
        }
        if (totalAmount > userData.wallet) {
            res.status(200).json({
                message: 'insufficient balance'
            })
        } else {
            res.status(200).json({
                message: ''
            })
        }

    } catch {
        console.log(error.message)
    }
}

const walletPayment = async (req, res) => {
    try {
        const couponCode = req.session.couponCode;
        const userId = req.session.userId;
        const userData = await User.findById(userId)
        const userCart = await Cart.findOne({ userId: userId }).populate('products.productId');
        let totalAmount = parseInt(req.query.totalAmount);
        const addressIndex = parseInt(req.query.addressIndex);
        console.log('totalamount:', totalAmount);
        console.log(addressIndex);
        const paymentMethod = 'Wallet';
        const couponData = await Coupon.findOne({ couponCode: couponCode });

        if (couponData != null) {
            const finalPrice = totalAmount - couponData.discountAmount;
            totalAmount = finalPrice;
            const obj = {
                userId: userData._id
            };
            await couponData.redeemUsers.push(obj);
            couponData.save();
        } else {
            totalAmount = parseInt(req.query.totalAmount);
        }

        let arr = [];

        userCart.products.forEach((item) => {
            arr.push({
                productId: item.productId._id,
                quantity: item.quantity,
                subtotal: item.subtotal,
            });
        });

        const randomId = generateRandomId();

        function generateRandomId() {
            const min = 1000000;
            const max = 9999999;

            const randomId = Math.floor(Math.random() * (max - min + 1)) + min;

            return randomId;
        }
        console.log('hello');
        console.log(randomId);

        const newOrder = new Orders({
            userId: userId,
            products: arr,
            paymentMethod: paymentMethod,
            totalAmount: parseInt(totalAmount),
            addressIndex: addressIndex,
            orderId: randomId,
            paymentStatus: 'Success',
        });

        const orderData = await newOrder.save();

        if (orderData) {

            const updatedWalletBalance = userData.wallet - totalAmount;
            userData.wallet = updatedWalletBalance;
            await userData.save();

            userCart.products = [];
            await userCart.save();
            setTimeout(() => {
                res.redirect('/userProfile');
            }, 1500);
        } else {
            res.redirect('/checkout');
        }
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    placeOrder,
    loadOrderDetails,
    cancelOrder,
    returnOrder,
    onlinePayment,
    paymentSuccess,
    checkWallet,
    walletPayment
}



