const mongoose = require('mongoose');
const bannerSchema = new mongoose.Schema({
    bannerName :{
        type:String,
        required : true
    },
    is_active:{
        type: Boolean,
        default:true
    },
    bannerText : {
        type : String,
        required : true
    },
    bannerImage : [{
        type : String,
        required : true
    }]
})

const Banner = mongoose.model('banner',bannerSchema);
module.exports = Banner