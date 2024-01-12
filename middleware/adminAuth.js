
const isLogin = async(req, res, next)=>{
    try {
        if(req.session.admin_id){ next();}
        else{
            res.redirect("/admin")
        }
       
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req, res, next) => {
    try {
        if (req.session.admin_id) {
            // If admin is logged in, redirect to dashboard
            res.redirect("/admin/dashboard");
        } else {
            // If admin is not logged in, allow access to the next middleware or route
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    isLogin,
    isLogout
}