

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



const isLogout = async(req, res, next)=>{

    try {
        if(req.session.userId){
            res.redirect("/home")
        }
        next();
        
    } catch (error) {
        console.log(error.message)
        
    }
}

module.exports ={
    isLogin,
    isLogout
}