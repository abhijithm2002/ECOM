
const User = require('../models/userModel')
// const isLogin = async(req, res, next)=>{

//     try {

//         if(req.session.userId){ next();}
//         else{
//             res.redirect('/')
//         }
       
        
//     } catch (error) {
//         console.log(error.message)
        
//     }
// }
const isLogin = async (req, res, next) => {
    try {
        if (req.session.userId) {
            next();
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error in isLogin middleware:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const isLogout = async (req, res, next) => {
    try {
        if (req.session.userId) {
            return res.redirect("/home"); // return here to stop further execution
        }else{
        next();
        }
    } catch (error) {
        console.log(error.message);
        next(error); // pass the error to the error handling middleware
    }
};
const isBlocked = async(req, res, next)=>{
    try {
        const userId = req.session.userId
        const userData = await User.findById(userId)
        if(userData && userData.is_active === false){
            res.redirect('/login')
        }else{
        next();
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports ={
    isLogin,
    isLogout,
    isBlocked
}