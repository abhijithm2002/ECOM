const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode : {
        type : String,
        default : null
    },
    discountAmount : {
        type : Number,
        default : null
    },
    minPurchase : { 
        type : Number,
        default : null 
    },
    expiry : {
        type : Date
    },
    is_active : {
         type : Boolean,
         default : false
    },
    redeemUsers:[
        {
            userId:{
                type: String
            }
        }
    ]
});

const Coupon = mongoose.model('coupon',couponSchema)

module.exports = Coupon;