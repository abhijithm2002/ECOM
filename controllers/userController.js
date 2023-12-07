const User = require('../models/userModel')
const Product = require('../models/productModel')
const Cart = require('../models/cartModel')
const Orders = require('../models/ordersModel')
const Category = require('../models/categoryModel')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const { name } = require('ejs')

const securePassword =async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10 );
        return passwordHash;
    } catch (error) {
        console.log(error.message)
    }
}
// user login load

const loadLogin = async (req, res) => {
    try {
       
        res.render('login', { message: "" })
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {
            const isPasswordCorrect = await bcrypt.compare(password, userData.password)
            
            // if (password === userData.password)
            if(isPasswordCorrect) {
                req.session.userId = userData._id
                console.log(req.session.userId);
                // Password is correct, redirect to home
                res.redirect('/home');
            } else {
                // Password is incorrect
                res.render("login", { message: "Password is incorrect" });
            }
        } else {
            // User not found with the provided email
            res.render('login', { message: 'Email is incorrect' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

// user Logout.....

const userLogout = async (req, res) => {
    try {
        req.session.destroy((error) => {
            if (error) {
                console.log(error.message)
            } else {
                res.redirect('/login')
            }
        });

    } catch (error) {
        console.log(error.message)
    }
}

// user load register
const loadRegister = async (req, res) => {
    try {
        res.render('registration', { message: "" })
    } catch (error) {
        console.log(error.message);
    }
}

// insert userdata

// const insertUser = async (req, res) => {
//     try {
//         let obj = {
//             name: req.body.name,
//             email: req.body.email,
//             mobile: req.body.mno,
//             password: req.body.password,
//             cpassword: req.body.cPassword
//         }
//         req.session.obj = obj
//         req.session.email = req.body.email

//         res.redirect('/verifyOtp')

//     } catch (error) {
//         console.log(error)
//     }
// }


const insertUser = async (req, res) => {
    try {
        const { name, email, mno, password, cPassword } = req.body;

        // Check if email or mobile number already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobile: mno }] });
        console.log('hai')

        if (existingUser) {
            const message = 'Email or mobile number already exists. Please use a different email or mobile number.';
            res.render('registration', { message });
        } else {
            // If not, proceed with the registration process
            console.log('hello')
            const hashedPassword = await securePassword(password)
            let obj = {
                name,
                email,
                mobile: mno,
                password:hashedPassword,
                cPassword: cPassword
            }
            console.log(cPassword)

            req.session.obj = obj;
            req.session.email = email;

            res.redirect('/verifyOtp');
        }
    } catch (error) {
        console.log(error);
        res.status(500).render('registration', { message: 'An error occurred during registration.' });
    }
}

// verify otp 

const loadVerifyOtp = async (req, res) => {
    try {
        const obj = req.session.obj

        const randomotp = Math.floor(1000 + Math.random() * 9000);
        req.session.randomotp = randomotp; // Store in session

        console.log(randomotp)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'abhijithm050@gmail.com',
                pass: 'pftm gfki mwnm bmkw',
            },
        });


        const mailOptions = {
            from: 'abhijithm050@gmail.com',
            to: req.session.email,
            subject: 'Hello, Nodemailer!',
            text: `Your verification OTP is ${randomotp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ' + error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        const message = 'ot sent successfully';
        res.render('verifyOtp', { message })


    } catch (error) {
        console.log(error.message)
    }
}

// verifyOtp

// const verifyOtp = async (req, res) => {
//     try {
//         const otp = req.body.otp;
//         const obj = req.session.obj
//         const randomotp = req.session.randomotp;


//         console.log(randomotp);

//         if (randomotp == otp) {
//             const user = new User({
//                 name: obj.name,
//                 email: obj.email,
//                 mobile: obj.mobile,
//                 password: obj.password,
//                 password: obj.cpassword,
//                 is_admin: 0
//             });
//             console.log('hello')
//             const userData = await user.save();
//             console.log(userData);
//             if (userData) {
//                 res.redirect('/login');
//             }
//             // Assuming user.save() is a promise-based operation
//         } else {
//             console.log('hai');

//         }
//     } catch (error) {
//         console.log(error.message);
//         res.redirect(500, '/login');
//     }
// }
const verifyOtp = async (req, res) => {
    try {
        const otp = req.body.otp;
        const obj = req.session.obj;
        const randomotp = req.session.randomotp;

        console.log(randomotp);

        if (randomotp == otp) {
            const user = new User({
                name: obj.name,
                email: obj.email,
                mobile: obj.mobile,
                password: obj.password,
                cpassword: obj.cpassword, // Use a different key for confirmation password
                is_admin: 0
            });

            console.log('hello');

            const userData = await user.save();

            console.log(userData,'uyuygfityftyofotu');

            if (userData) {
                res.redirect('/login');
            }
        } else {
            console.log('hai');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).redirect('/login'); // Use res.status(500) instead of res.redirect(500, '/login')
    }
};


// loading Home

const loadHome = async (req, res) => {
    try {
        const isLoggedIn = !!req.session.userId
        const product = await Product.find({ is_active: true })
        res.render('home', { product,isLoggedIn })
    } catch (error) {
        console.log(error.message);
    }
}

// Load forget

const forgetLoad = async (req, res) => {
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}
//forget verify

const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email })
        if (userData) {

        } else {
            res.render('forget', { message: 'Email is incorrect' })
        }

    } catch (error) {
        console.log(error.message);
    }
}
// productList..
// selectedCategory= req.query.category
        // console.log("Selected Category:", selectedCategory);   
   
// const productList = async(req, res)=>{
//     try {
             
      
//         const categoryName = req.query.name
//         const userId = req.session.userId
//         const catData = await Category.find({is_active:true})
//         const product = await Product.find({ is_active: true })
        
//         if(categoryName='Category'){
//            const product = await Product.find() 
//         }else{
//             const product = await Product.find({$and:{categoryName:categoryName}})
//         }
//         res.render('productList',{catData,product,selectedCategory})
//     } catch (error) {
//         console.log(error.message)
//     }
// }
const productList = async (req, res) => {
    try {
        const categoryName = req.query.category;
        const userId = req.session.userId;
        const catData = await Category.find({ is_active: true });

        let products;

        if (!categoryName || categoryName === 'Category') {
            // Display all products if no category is selected or if "Category" is selected
            products = await Product.find({ is_active: true });
        } else {
            // Display products based on the selected category
            products = await Product.find({ category: categoryName, is_active: true });
        }

        res.render('productList', { catData, products, selectedCategory: categoryName });
    } catch (error) {
        console.log(error.message);
    }
};


const loadProductDetails = async (req, res) => {
    try {
        const productId = req.query.productId
        const product = await Product.findById(productId)


        res.render('productDetails', { product })
    } catch (error) {
        console.log(error.message)
    }
}

// load cart page..

// const loadCart = async (req, res) => {
//     try {
//         const id = req.session.userId;
//         console.log(id)
//         if (!id) {
//             // Redirect to login if userId is not set in the session
//             return res.redirect('/login');
//         }
//         const userData = await User.findById({ _id : id  })
//         console.log(userData)
//         if (userData) {
//             res.render('addCart', {  userData })
//         } else {
//             res.redirect('/login')
//         }

//     } catch (error) {
//         console.log(error.message)
//     }
// }

const loadCart = async (req, res) => {
    try {
        const id = req.session.userId;

        if (!id) {
            // Redirect to login if userId is not set in the session
            return res.redirect('/login');
        }

        // Fetch user data
        const userData = await User.findById({ _id: id });

        // Fetch cart data
        const cartData = await Cart.findOne({ userId: id }).populate('products.productId');
        // console.log(cartData);
        if (userData && cartData) {
            res.render('addCart', { userData, cartData }); // Pass both userData and cartData to the template
        } else {
            res.redirect('/login');
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


//Add to Cart

// const addToCart = async (req, res) => {
//     try {
//         const id = req.session.userId;
//         const productId = req.query.id;
//         let cartData = await Cart.findOne({ userId: id });

//         if (!cartData) {
//             cartData = new Cart({ userId: id, products: [] });
//         }

//         // Step 3: Check if the product is already in the cart
//         const existingProduct = cartData.products.find(product => product.productId.equals(productId));

//         if (existingProduct) {
//             // If the product is already in the cart, update the quantity
//             existingProduct.quantity += 1;
//         } else {
//             // If the product is not in the cart, add it with quantity 1
//             cartData.products.push({ productId, quantity: 1 });
//         }

//         // Save the updated cartData
//         await cartData.save();


//         // Optional: Retrieve and log the updated cart data
//         const sampleData = await Cart.find({ userId: id }).populate('products.productId');
//         console.log(sampleData);
//         // console.log(sampleData.products[]);
//         // Handle success
//         res.redirect('/addCart');
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

//Add to Cart

const addToCart = async (req, res) => {
    try {
        const id = req.session.userId;
        const productId = req.query.id;
        const quantity = parseInt(req.body.quantity);

        console.log(productId);
        // Step 1: Check if the user is logged in
        if (!id) {
            return res.redirect('/login');
        }

        // Step 2: Find or create a cart for the user
        let cartData = await Cart.findOne({ userId: id });

        if (!cartData) {
            // If the cart doesn't exist, create a new one
            cartData = new Cart({ userId: id, products: [] });
        }

        // Step 3: Check if the product is already in the cart
        const existingProduct = cartData.products.find(product => product.productId.equals(productId));
        console.log(existingProduct);
        if (existingProduct) {
            // If the product is already in the cart, update the quantity and subtotal
            existingProduct.quantity += quantity;

            if (
                typeof existingProduct.quantity === 'number' &&
                !isNaN(existingProduct.quantity) &&
                typeof existingProduct.productId.promoPrice === 'number' &&
                !isNaN(existingProduct.productId.promoPrice)
            ) {
                // Update the subtotal
                existingProduct.subtotal = existingProduct.quantity * existingProduct.productId.promoPrice;
            } else {
                // Log an error or handle the case where quantity or promoPrice is not a valid number
                console.error(`Invalid quantity or promoPrice for product: ${existingProduct.productId}`);
                // You might want to handle this case differently based on your requirements
            }
        } else {
            // If the product is not in the cart, add it with quantity 1 and calculate subtotal
            const productInfo = await Product.findById(productId);
            const subtotal = productInfo.promoPrice;
            cartData.products.push({ productId, quantity, subtotal });
        }

        // Step 4: Save the updated cartData
        await cartData.save();

        // Optional: Retrieve and log the updated cart data
        const sampleData = await Cart.findOne({ userId: id }).populate('products.productId');


        // Handle success
        res.redirect('/addCart');
    } catch (error) {
        console.error(error.message);

        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateCartQuantity = async (req, res) => {
    const productId = req.params.id;
    const newQuantity = parseInt(req.params.quantity);

    try {
        console.log(productId)
        console.log(newQuantity)
        // Update the quantity in the database using the product ID
        await Cart.updateOne(
            { 'products.productId': productId },
            { $set: { 'products.$.quantity': newQuantity } }
        );
        res.status(200).send("Quantity updated successfully");
    } catch (error) {
        console.error("Error updating quantity in the database:", error);
        res.status(500).send("Internal Server Error");
    }
};


// delete Cart

const deleteCart = async (req, res) => {
    try {
        const id = req.query.id
        console.log('hellloo')
        const userId = req.session.userId
        // console.log(userId)
        const cartData = await Cart.findOne({ userId: userId }).populate('products.productId').populate('userId')

        // console.log(cartData.products.productId)
        cartData.products = cartData.products.filter(item => item._id.toString() !== id);

        // Update the subtotal or any other logic based on your requirements

        await cartData.save();
        res.redirect('/addCart')
    } catch (error) {
        console.log(error.message)
    }
}

// Load User profile.............
const loadUserProfile = async (req, res) => {
    try {
        const userId = req.session.userId
        const orderId =req.query._id
        console.log(req.session.userId)
        const user = await User.findById(userId)
        const orderData = await Orders.find({userId : userId}).sort({orderDate:-1})
        // const orderData = await Orders.find({}).populate('userId').sort({orderDate :-1})
        console.log(orderData)
        if (user) {
            
            res.render('userProfile', { user,orderData,orderId })
        } else {
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message);
    }
};

// Load Address...
const loadAddress = async (req, res) => {
    try {
        res.render('addAddress',{message:""})
    } catch (error) {
        console.log(error.message)
    }
}
// add Address....

const addAddress = async (req, res) => {
    try {
        const {
            fname,
            lname,
            country,
            houseName,
            city,
            state,
            pincode,
            phone,
            email
        } = req.body;

        const userId = req.session.userId;

        const newAddress = {
            fname,
            lname,
            country,
            houseName,
            city,
            state,
            pincode,
            phone,
            email
        }
        const user = await User.findById(userId)
        user.address.push(newAddress);
        console.log(newAddress)

        await user.save();
        res.redirect('/userProfile')

    } catch (error) {
        console.log(error.message)
    }
}

const loadEditAddress = async(req, res)=>{
    try {
        const userId = req.session.userId;
        const index = req.query.index;
        const checkout = req.query.checkout;
        

        const userData = await User.findById(userId);
        const address = userData.address[index]

        res.render('editAddress',{ userData,address,index,checkout})


    } catch (error) {
        console.log(error.message)
    }
}

// updateAddress 


const updateAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const index = req.body.index;
        const checkout = req.body.checkout;
        const {fname,
            lname,
            country,
            houseName,
            city,
            state,
            pincode,
            phone,
            email} = req.body
         const userData = await User.findById(userId)  
         
         userData.address[index] = {
            fname,
            lname,
            country,
            houseName,
            city,
            state,
            pincode,
            phone,
            email
         }

         await userData.save();

         if (checkout) {
            res.redirect('/checkout');
        } else {
            res.redirect('/userProfile');
        }
    } catch (error) {
        console.log(error.message);
    }
};
// load checkOut...

const loadCheckout = async (req, res) => {
    try {
        console.log(req.query.subtotal)
        const subtotal = parseInt(req.query.subtotal)
        const userId = req.session.userId;
        console.log(userId)
        const user = await User.findById(userId)
        const cart = await Cart.findOne({ userId}).populate('products.productId')
        console.log(user)
        res.render('checkout',{user, cart, subtotal})
    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    loadLogin,
    loadRegister,
    insertUser,
    verifyLogin,
    userLogout,
    loadVerifyOtp,
    verifyOtp,
    loadHome,
    forgetLoad,
    forgetVerify,
    productList,
    loadProductDetails,
    loadCart,
    addToCart,
    updateCartQuantity,
    deleteCart,
    loadUserProfile,
    loadAddress,
    addAddress,
    loadEditAddress,
    updateAddress,
    

    loadCheckout
}