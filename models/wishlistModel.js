const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    products :[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product'
            
        },
        subtotal :{
            type : Number,

        }
       
    }]
})

const Wishlist = mongoose.model('wishlist',wishlistSchema)
module.exports = Wishlist