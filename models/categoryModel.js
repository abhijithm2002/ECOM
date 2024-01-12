const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
       
    },
    is_active:{
        type:Boolean,
        default:true
    },
    discountPercentage :{
        type: Number,
        default : 0
    },
    expiry : {
        type : Date
    },
    offerStatus : {
        type : Boolean,
        default : true
    }
})

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;