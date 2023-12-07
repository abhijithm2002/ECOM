const Orders = require('../models/ordersModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel')
const Product = require('../models/productModel');

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const userCart = await Cart.findOne({ userId: userId }).populate('products.productId');
        const totalAmount =parseInt(req.body.totalAmount);
        const addressIndex =    parseInt(req.body.addressIndex);
        const paymentMethod = req.body.paymentMethod;
        console.log(addressIndex);
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
            orderId : randomId
        });

       const orderData =  await newOrder.save();
        
        
       if(orderData){
        userCart.products = [];
        await userCart.save();
        setTimeout(() => {
            res.redirect('/userProfile');
        }, 1500);
    }else{
        res.redirect('/checkout')
    }

    } catch (error) {
        console.log(error.message);
    }
};

const loadOrderDetails = async(req, res)=>{
    try {
        const userId = req.session.userId
        console.log(userId)
        const orderId = req.query.id
        console.log(orderId)
        const userData = await Cart.findOne({userId : userId}).populate('products.productId').populate('userId')
        console.log("//////////////////")
        console.log(userData)
        const orderData = await Orders.findById(orderId).populate('products.productId').populate('userId')
        
        console.log("orderID: "+orderData)
        res.render('orderDetails',{orders:orderData , user: userData})
        
    } catch (error) {
        console.log(error.message)
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const userId = req.session.userId;

        
        const userData = await Cart.findOne({ userId: userId }).populate('products.productId').populate('userId');
        const orderData = await Orders.findById(orderId).populate('products.productId').populate('userId');

       
        orderData.OrderStatus = 'Order Cancelled';
        await orderData.save();

        
        res.redirect(`/orderDetails?id=${orderId}`);
    } catch (error) {
        console.log(error.message);
    }
};




module.exports ={
    placeOrder,
    loadOrderDetails,
    cancelOrder
}



