const mongoose = require('mongoose')

const brandSchema = new mongoose.Schema({
    brandName : {
        type : String,
        required : true
    },
    is_active :{
        type : Boolean,
        default : true
    },
    brandImage : [{
    type : String
}]
});

const Brand = mongoose.model('brand',brandSchema);
module.exports = Brand;