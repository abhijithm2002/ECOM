const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    frameMaterial:{
        type:String,
        required:true
    },
    frameColour:{
        type:String,
        required:true
    },
    style:{
        type:String,
        required:true
    },
    templeColour:{
        type:String,
        required:true
    },
    lensTechnology:{
        type:String,
        required:true
    },
    lensColour:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    regularPrice:{
        type:Number,
        required:true
    },
    promoPrice:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    image:[{
        type:String,

    }],
    category:{
        type:String,
        
    },
    gender:{
        type:String,
        required:true
    },
    tags:{
        type:String,
        required:true
    },
    is_active:{
        type:Boolean,
        default:true
    }
})

const Product = mongoose.model('Product',productSchema)
module.exports = Product