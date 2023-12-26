const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    orderId: {
        type: Number,
       
    },
    orderDate: {
        type: Date,
       default : Date.now()
    },
    OrderStatus: {
        type: String,
        enum: ['order placed', 'shipped', 'Delivered', 'Order Cancelled', 'Returned'],
        default: 'order placed'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'Success', 'Failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    addressIndex : {
        type : Number,
        default:0
    }
});

const Orders = mongoose.model('Orders', orderSchema);
module.exports = Orders;