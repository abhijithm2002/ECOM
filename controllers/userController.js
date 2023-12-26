const User = require('../models/userModel')
const Product = require('../models/productModel')
const Cart = require('../models/cartModel')
const Orders = require('../models/ordersModel')
const Category = require('../models/categoryModel')
const Coupon = require('../models/couponModel')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const moment = require('moment')
const { name } = require('ejs')

const formatedCouponDate = (date) => {
    return moment(date).format('MMMM DD, YYYY hh:mm A');

};


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
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
        // const userData = await User.findOneAndUpdate({ email: email },{$set:{wallet:0}});


        if (userData) {
            const isPasswordCorrect = await bcrypt.compare(password, userData.password)

            // if (password === userData.password)
            if (isPasswordCorrect) {
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

            const currentDate = new Date();
            let obj = {
                name,
                email,
                mobile: mno,
                password: hashedPassword,
                cPassword: cPassword,
                date: currentDate
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
        const message = 'otp sent successfully';
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

            console.log(userData, 'uyuygfityftyofotu');

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

        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }

        const isLoggedIn = !!req.session.userId
        const userId = req.session.userId;
        const user = await User.findById(userId);


        // const product = await Product.find({ is_active: true  })

        const product = await Product.find({
            is_active: true,
            $or: [
                { title: { $regex: '.*' + search + '.*', $options: 'i' } },
                { brand: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        });

        res.render('home', { product, isLoggedIn, user })
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

// const productList = async (req, res) => {
//     try {
//         const categoryName = req.query.category;
//         const userId = req.session.userId;
//         const catData = await Category.find({ is_active: true });

//         let products;

//         if (!categoryName || categoryName === 'Category') {

//             products = await Product.find({ is_active: true });
//         } else {

//             products = await Product.find({ category: categoryName, is_active: true });
//         }

//         //sort
//         const sortBy = req.query.sortBy || 'featured';

//         switch (sortBy) {
//             case 'lowToHigh':
//                 products.sort((a, b) => a.regularPrice - b.regularPrice);
//                 break;
//             case 'highToLow':
//                 products.sort((a, b) => b.regularPrice - a.regularPrice);
//                 break;

//             default:

//                 break;
//         }

//           res.render('productList', { catData, products, selectedCategory: categoryName });

//     } catch (error) {
//         console.log(error.message);
//     }
// };
const productList = async (req, res) => {
    try {


        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }

        const categoryId = req.query.category;
        const userId = req.session.userId;
        const catData = await Category.find({ is_active: true });
        let catName = await Category.findById(categoryId)
        if(!catName){
            catName=''
        }
        let products;

        if (!categoryId) {
            
            products = await Product.find({
                is_active: true,
                $or: [
                    { title: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { brand: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            });
        } else {
            
            products = await Product.find({
                category: categoryId,
                is_active: true,
                $or: [
                    { title: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { brand: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            });
        }

        // Sort
        const sortBy = req.query.sortBy || 'featured';

        switch (sortBy) {
            case 'lowToHigh':
                products.sort((a, b) => a.regularPrice - b.regularPrice);
                break;
            case 'highToLow':
                products.sort((a, b) => b.regularPrice - a.regularPrice);
                break;
            default:
                break;
        }
         
        res.render('productList', { catData, products, selectedCategory: catName.name });
    } catch (error) {
        console.log(error.message);
    }
};


const loadProductDetails = async (req, res) => {
    try {
        const isLoggedIn = !!req.session.userId
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const productId = req.query.productId
        const product = await Product.findById(productId)


        res.render('productDetails', { product, isLoggedIn, user })
    } catch (error) {
        console.log(error.message)
    }
}


const loadCart = async (req, res) => {
    try {
        const id = req.session.userId;

        if (!id) {

            return res.redirect('/login');
        }

        // Fetch user data
        const userData = await User.findById({ _id: id });

        // Fetch cart data
        const cartData = await Cart.findOne({ userId: id }).populate('products.productId');

        if (userData && cartData) {
            res.render('addCart', { userData, cartData });
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
        const orderId = req.query._id
        console.log(req.session.userId)
        const user = await User.findById(userId)
        const orderData = await Orders.find({ userId: userId }).sort({ orderDate: -1 })
        // const orderData = await Orders.find({}).populate('userId').sort({orderDate :-1})
        console.log(orderData)
        if (user) {

            res.render('userProfile', { user, orderData, orderId, formatedCouponDate })
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
        res.render('addAddress', { message: "" })
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

const loadEditAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const index = req.query.index;
        const checkout = req.query.checkout;


        const userData = await User.findById(userId);
        const address = userData.address[index]

        res.render('editAddress', { userData, address, index, checkout })


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
        const { fname,
            lname,
            country,
            houseName,
            city,
            state,
            pincode,
            phone,
            email } = req.body
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
        const currentDate = Date.now();
        console.log(req.query.subtotal)
        const subtotal = parseInt(req.query.subtotal)
        const userId = req.session.userId;
        console.log(userId)
        const user = await User.findById(userId)
        const cart = await Cart.findOne({ userId }).populate('products.productId')
        const coupon = await Coupon.find({
            is_active: true,
            expiry: { $gt: currentDate }, // Find coupons with expiry less than or equal to the current date
            'redeemUsers.userId': { $ne: userId }, // Exclude coupons redeemed by the user
        });


        console.log(user)
        res.render('checkout', { user, cart, subtotal, coupon, message: "" })
    } catch (error) {
        console.log(error.message)
    }
}

// let applyCoupon = async(req, res) => {
//     try {
//         const userId = req.session.userId;
//         const couponCode = req.query.couponCode;

//         // Find the user and the coupon
//         const user = await User.findById(userId);
//         const coupon = await Coupon.findOne({ couponCode, is_active: true });

//         // Check if the coupon exists and is not already redeemed by the user
//         if (coupon && coupon.redeemUsers.every(user => user.userId !== userId)) {
//             // Assuming you have a method to calculate the subtotal
//             const subtotal = calculateSubtotal(user.cart);

//             // Check if the coupon is applicable based on the minimum purchase
//             if (subtotal >= coupon.minPurchase) {
//                 // Update the user's redeemed coupons
//                 user.cart.coupon = {
//                     couponCode: coupon.couponCode,
//                     discountAmount: coupon.discountAmount
//                 };

//                 // Save the user with the updated cart
//                 await user.save();

//                 // Respond with the discount amount
//                 res.json({ success: true, discountAmount: coupon.discountAmount });
//             } else {
//                 res.json({ success: false, message: 'Minimum purchase requirement not met.' });
//             }
//         } else {
//             res.json({ success: false, message: 'Invalid coupon code or already redeemed.' });
//         }
//     } catch (error) {
//         console.log(error.message);
//         res.json({ success: false, message: 'An error occurred while applying the coupon.' });
//     }
// }


let applyCoupon = async (req, res) => {
    try {
        req.session.couponCode = req.query.couponCode

        const userId = req.session.userId
        const couponCode = req.query.couponCode;
        const totalAmount = req.query.totalAmount;
        console.log(totalAmount)
        const couponData = await Coupon.findOne({ couponCode: couponCode })
        if (!couponData) {
            return res.json({
                message: 'invalid Coupon',
                finalPrice: totalAmount
            })
        }

        const userData = await User.findById(userId);
        const isRedeemed = couponData.redeemUsers.some(user => user.userId === userData._id.toString());
        if (isRedeemed || totalAmount < couponData.minPurchase) {
            return res.status(200).json({
                message: 'coupon already used',
                finalPrice: totalAmount

            })

        } else {


            const finalPrice = totalAmount - couponData.discountAmount;
            console.log(finalPrice)
            console.log('couponData:', couponData.discountAmount)
            const discountAmount = couponData.discountAmount
            console.log('discountAmount', discountAmount)

            res.status(200).json({
                message: 'Coupon applied successfully',
                finalPrice: finalPrice,
                couponAmount: discountAmount
            });


        }

    } catch (error) {
        console.log(error.messge)
    }

};




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
    loadCheckout,
    applyCoupon,
    formatedCouponDate
}