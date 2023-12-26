const Wishlist = require('../models/wishlistModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const isLoggedIn = !!req.session.userId

        const user = await User.findById(userId);
        if (!userId) {
            return res.redirect('/login')
        }

        const wishlist = await Wishlist.findOne({ userId }).populate('products.productId');

        res.render('wishlist', { wishlist, isLoggedIn, user });


    } catch (error) {
        console.log(error.message)
    }
}



const addToWishlist = async (req, res) => {
    try {
        console.log('hellooo')
        const userId = req.session.userId;
        const productId = req.query.id;
        console.log(productId)
        if (!userId) {
            return res.redirect('/login');
        }

        let wishlistData = await Wishlist.findOne({ userId: userId });

        if (!wishlistData) {
            wishlistData = new Wishlist({ userId: userId, products: [] });
        }

        const existingProduct = wishlistData.products.find(product => product.productId.equals(productId));

        if (existingProduct) {
            return res.redirect('/wishlist');
        } else {
            const productInfo = await Product.findById(productId);
            wishlistData.products.push({
                productId: productId,

            });
        }

        await wishlistData.save();

        res.redirect('/wishlist');

    } catch (error) {
        console.log(error.message);
        res.redirect('/wishlist'); // Redirect in case of an error
    }
};

// const addCart = async(req, res)=>{
//     try {
//         const userId = req.session.userId;
//         const productId = req.query.id;
//         let cartData = await Cart.findOne({ userId: userId });
//         if (!cartData) {
//             cartData = new Cart({ userId: userId, products: [] });
//         }
//         const existingProduct = cartData.products.find(product => product.productId.equals(productId));

//         if (!existingProduct) {

//             const productInfo = await Product.findById(productId);
//             cartData.products.push({
//                 productId: productId,


//             });
//         }
//         await cartData.save();

//         res.redirect('/addCart');


//     } catch (error) {
//         console.log(error.message)
//     }
// }

const addToCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.query.id;
        let cartData = await Cart.findOne({ userId: userId });
        console.log('productid:;', productId)

        if (!cartData) {
            cartData = new Cart({ userId: userId, products: [] });
        }
        console.log(cartData)
        const existingProduct = cartData.products.find(product => product.productId.equals(productId));

        console.log('hello')
        if (!existingProduct) {
            const productInfo = await Product.findById(productId);
            cartData.products.push({
                productId: {
                    _id: productInfo._id,
                    image: productInfo.image,
                    title: productInfo.title,
                    promoPrice: productInfo.promoPrice,
                },
                quantity: 1,
                subtotal: productInfo.promoPrice,
            });
            console.log(cartData.products)
        } else {
            // If the product already exists, you may want to increase its quantity
            existingProduct.quantity += 1;
        }

        await cartData.save();
        res.redirect('/addCart');
    } catch (error) {
        console.log(error.message);
        res.redirect('/wishlist'); // Redirect in case of an error
    }
};

const deleteWishlist = async (req, res) => {
    try {

        const productId = req.query.id;
        const userId = req.session.userId
        console.log('productId:', productId)
        const wishlistData = await Wishlist.findOne({ userId: userId }).populate('products.productId').populate('userId')
        wishlistData.products = wishlistData.products.filter(item => item._id.toString() !== productId);
        await wishlistData.save();
        res.redirect('/wishlist')


    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadWishlist,
    addToWishlist,
    addToCart,
    deleteWishlist
};




