const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required : true

    },
    products : [{
        productId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },
        quantity : {
            type : Number,
            required : true
        },
        subtotal : {
            type : Number,
            required : true
        }

    }],
                                                // name : {
                                                //     type : String,
                                                //     required : true
                                                // },
                                                // price : {
                                                //     type : Number,
                                                //     required : true
                                                // },
                                                // quantity : {
                                                //     type : String,
                                                //     required : true
                                                // },
                                                // subTotal : {
                                                //     type : Number,
                                                //     required : true
                                                // },
                                                // image : [{
                                                //     type :String
                                                // }],
                                                // is_active : {
                                                //     type : Boolean,
                                                //     default : true
                                                // }

})


const Cart = mongoose.model('cart', cartSchema);
module.exports = Cart