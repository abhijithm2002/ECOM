const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
       
    },
    is_active:{
        type:Boolean,
        default:true
    }
})

const Category = mongoose.model('category',categorySchema);
module.exports = Category;