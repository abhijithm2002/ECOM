const { ObjectId } = require("mongodb");
const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true,
        default:0
    },
    is_verified:{
        type:Number,
        required:true,
        default:0
    },
    is_active:{
        type:Boolean,
        default:true
    },
    cart_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Cart',
       
    },
    address :[{
        fname:{
            type : String
        },
        lname : {
            type : String
        },
        country : {
            type : String
        },
        houseName: {
            type : String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        pincode:{
            type: Number
        },
        phone:{
            type:Number
        },
        email:{
            type:String
        }
    }]
    
})

module.exports = mongoose.model('User',userSchema);