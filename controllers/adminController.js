const User = require('../models/userModel')
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const Orders = require('../models/ordersModel')
const Coupon = require('../models/couponModel');
const Banner = require('../models/bannerModel');
const Brand = require('../models/brandModel')
const bcrypt = require('bcrypt');
const moment = require('moment')
const path = require('path')
const { query } = require('express');

const formatedCouponDate = (date) => {
    return moment(date).format('MMMM DD, YYYY hh:mm A');

};


// Admin Login Load

const loadLogin = async (req, res) => {
    try {
        res.render('login', { message: "" })
    } catch (error) {
        console.log(error.message);
    }
}


// Admin verify Login

// const verifyLogin = async (req, res) => {
//     try {
//         const email = req.body.email;
//         const password = req.body.password;
//         const userData = await User.findOne({ email: email })
//         console.log(userData);
//         if (userData.is_admin) {
//             if (email == userData.email) {
//                 if (password == userData.password) {
//                     req.session.admin_id = userData._id;
//                     res.redirect('/admin/dashboard')
//                 } else {
//                     res.render('login', { message: "Password is incorrect" })
//                 }
//             } else {
//                 res.render('login', { message: "Email is incorrect" })
//             }
//         } else {
//             res.render('login', { message: 'Invalid User' })
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData && userData.is_admin) {
            if (email == userData.email) {
                const isPasswordCorrect = await bcrypt.compare(password, userData.password);

                if (isPasswordCorrect) {
                    req.session.admin_id = userData._id;
                    res.redirect('/admin/dashboard');
                } else {
                    res.render('login', { message: 'Password is incorrect' });
                }
            } else {
                res.render('login', { message: "Email is incorrect" });
            }
        } else {
            res.render('login', { message: 'Invalid User' });
        }
    } catch (error) {
        console.log(error.message);
    }
};



const newUserLoad = async (req, res) => {
    try {

        const userData = await User.find({})
        res.render('userslist', { users: userData })
    } catch (error) {
        console.log(error.message);
    }
}



const userAction = async (req, res) => {
    try {
        const act = parseInt(req.query.act); // Parse the act parameter to ensure it's a number

        if (act === 1 || act === 0) {
            console.log(act)
            const userId = req.query.userId;

            // Use findByIdAndUpdate to update the user's is_active field
            const userData = await User.findByIdAndUpdate(
                userId,
                { $set: { is_active: act === 1 ? true : false } },
                { new: true }
            );

            if (userData) {
                // If the update is successful, fetch all users and render the userslist page
                const users = await User.find({});
                res.render('userslist', { users: users });
            } else {
                console.log('User not found or update failed');
                // Handle the case where the user is not found or the update fails
                res.status(404).send('User not found or update failed');
            }
        } else {
            console.log('Invalid act parameter');
            // Handle the case where the act parameter is not 0 or 1
            res.status(400).send('Invalid act parameter');
        }

    } catch (error) {
        console.log(error.message);
        // Handle other errors
        res.status(500).send('Internal Server Error');
    }
};
const loadCategory = async (req, res) => {
    try {
        // Fetch categories data from the database
        const categories = await Category.find();

        // Render the EJS file and pass the categories data
        res.render('addCategory', { categories, message: '' });
    } catch (error) {
        console.log(error.message)
    }
}


const addCategory = async (req, res) => {
    try {
        console.log(req.body.name)
        const categoryName = req.body.name
        const excistingCategory = await Category.findOne({ name: categoryName })
        if (excistingCategory) {
            const categories = await Category.find()
            return res.render('addCategory', { categories, message: 'Category already exsit' })
        }

        const category = new Category({
            name: req.body.name
        });
        const catData = await category.save();
        // Fetch all categories after saving the new one
        const categories = await Category.find();

        // Pass the categories data to the EJS file
        res.render('addCategory', { categories, message: '' });

    } catch (error) {
        console.log(error.message);
    }
}

const categoryAction = async (req, res) => {
    try {
        const act = parseInt(req.query.act)
        if (act == 1 || act == 0) {

            const categoryId = req.query.categoryId
            const catData = await Category.findByIdAndUpdate(
                categoryId,
                { $set: { is_active: act === 1 ? true : false } },
                { new: true }
            );

            if (catData) {
                // If the update is successful, fetch all users and render the userslist page
                const categories = await Category.find({});
                res.render('addCategory', { categories: categories ,message:''});
            } else {
                console.log('User not found or update failed');
                // Handle the case where the user is not found or the update fails
                res.status(404).send('User not found or update failed');
            }
        } else {
            console.log('Invalid act parameter');
            // Handle the case where the act parameter is not 0 or 1
            res.status(400).send('Invalid act parameter');
        }

    } catch (error) {
        console.log(error.message);
    }
}


const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const catData = await Category.findById({ _id: id })

        if (catData) {
            res.render("editCategory", { category: catData })
        } else {
            res.redirect("/addCategory")
        }
    } catch (error) {
        console.log(error.message)
    }
}

const updateCategory = async (req, res) => {
    try {
        console.log(req.query.id)
        const CatData = await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { name: req.body.name } })
        res.redirect("/admin/addCategory")
    } catch (error) {
        console.log(error.message)
    }
}

const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.deleteOne({ _id: id })
        res.redirect('/admin/addCategory')
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddProduct = async (req, res) => {
    try {
        const catData = await Category.find({ is_active: true })
        res.render('addProduct', { category: catData })

    } catch (error) {
        console.log(error.message)
    }
}


const addProduct = async (req, res) => {
    try {
        console.log(req.body.gender)
        const product = new Product({
            title: req.body.title,
            frameMaterial: req.body.frameMaterial,
            frameColour: req.body.frameColour,
            style: req.body.style,
            templeColour: req.body.templeColour,
            lensTechnology: req.body.lensTechnology,
            lensColour: req.body.lensColour,
            brand: req.body.brand,
            description: req.body.description,
            regularPrice: req.body.regularPrice,
            promoPrice: req.body.promoPrice,
            quantity: req.body.quantity,
            category: req.body.category,
            gender: req.body.gender,
            tags: req.body.tags,
            image: req.files.map((file) => file.path)
        })
        const productData = await product.save();
        if (productData) {
            res.redirect('/admin/dashboard')
        } else {
            res.write('problem in addproduct');
            res.end();
        }

    } catch (error) {
        console.log(error.message)
    }
}

const loadProductList = async (req, res) => {
    try {
        const product = await Product.find();
        res.render('productList', { product, formatedCouponDate })
    } catch (error) {
        console.log(error.message);
    }
}

const productAction = async (req, res) => {
    try {
        const act = parseInt(req.query.act);
        if (act == 1 || act == 0) {
            product = req.query.productId;
            const productData = await Product.findByIdAndUpdate(
                product,
                { $set: { is_active: act === 1 ? true : false } },
                { new: true })
            if (productData) {
                const product = await Product.find({})
                res.render('productList', { product: product , formatedCouponDate})
            } else {
                console.log('User not found or update failed');
                // Handle the case where the user is not found or the update fails
                res.status(404).send('User not found or update failed');
            }

        } else {
            console.log('Invalid act parameter');
            // Handle the case where the act parameter is not 0 or 1
            res.status(400).send('Invalid act parameter');
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadEditProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const productData = await Product.findById(id);

        // Assuming you want to find an active category
        const catData = await Category.find({ is_active: true });

        if (productData && catData) {
            res.render("editProduct", { product: productData, category: catData });
        } else {
            res.redirect("/productList");
        }
    } catch (error) {
        console.log(error.message);
    }
}


const updateProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        console.log(productId);
        const existingProduct = await Product.findById(productId);


        const deletedImages = JSON.parse(req.body.deletedImages || '[]');
        const updatedImages = existingProduct.image.filter(image => !deletedImages.includes(image));
        
        const newImages = await Promise.all(req.files.map(async (file) => {
            const uniqueIdentifier = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const outputPath = path.join('productImages', `${uniqueIdentifier}_cropped.jpg`);
    
            await sharp(file.path)
                .resize(750, 750)
                .toFile(outputPath);
    
            return outputPath;
        }));

        
        
        let updatedFields = {
            title: req.body.title,
            frameMaterial: req.body.frameMaterial,
            frameColour: req.body.frameColour,
            style: req.body.style,
            templeColour: req.body.templeColour,
            lensTechnology: req.body.lensTechnology,
            lensColour: req.body.lensColour,
            brand: req.body.brand,
            description: req.body.description,
            regularPrice: req.body.regularPrice,
            promoPrice: req.body.promoPrice,
            quantity: req.body.quantity,
            category: req.body.category,
            gender: req.body.gender,
            tags: req.body.tags,
            image: [...updatedImages, ...newImages],


        };

       
        const productData = await Product.findByIdAndUpdate(
            { _id: productId },
            {
                $set: updatedFields,
            },
            { new: true } // to return the updated document
        );

        console.log(productData);
        res.redirect("/admin/productList");
    } catch (error) {
        console.log(error.message); 
    }
};



const deleteProduct = async (req, res) => {
    try {
        const id = req.query.id;
        await Product.deleteOne({ _id: id })
        res.redirect('/admin/productList')
    } catch (error) {
        console.log(error.message)
    }
}

const loadOrderList = async (req, res) => {
    try {

        const orderData = await Orders.find({}).populate('userId').sort({ orderDate: -1 })

        if (orderData) {
            res.render('orderList', { order: orderData ,formatedCouponDate})
        } else {
            res.write('No orders');
            res.end();
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.id;

        const orderDetails = await Orders.findById(orderId).populate('products.productId').populate('userId');

        res.render('orderDetails', { order: orderDetails, orderId: orderId , formatedCouponDate});
    } catch (error) {
        console.log(error.message);
    }
};


// const orderStatus = async(req, res)=>{
//     try {
//         const orderId = req.query.id
//         console.log(orderId)
//         const newOrderStatus = req.body.newOrderStatus
//         console.log(newOrderStatus);
//         const paymentMethod = req.body.paymentMethod;

//         let paymentStatus;
//         if (paymentMethod === 'Cash On Delivery' && newOrderStatus === 'Delivered') {
//             paymentStatus = 'Success';
//             console.log('paymentStatus',paymentStatus)
//         } else if (paymentMethod === 'Paypal') {
//             paymentStatus = 'Success';
//         } else {
//             paymentStatus = 'Pending';

//         }

//      const orderData = await Orders.findByIdAndUpdate(orderId,{$set:{OrderStatus : newOrderStatus,paymentStatus: paymentStatus}},{new:true})
//         console.log(newOrderStatus);
//     //  res.redirect('/orderDetails?id=${orderId}')
//     // res.redirect('/orderDetails',{orderData})
//     res.redirect('/admin/orderDetails?id=' + orderId);

//     } catch (error) {
//         console.log(error.message)
//     }
// }
const orderStatus = async (req, res) => {
    try {
        const orderId = req.query.id;
        console.log(orderId);
        const newOrderStatus = req.body.newOrderStatus;
        console.log(newOrderStatus);

        let paymentStatus = 'pending';
        if (newOrderStatus == 'Delivered') {
            paymentStatus = 'Success'
        }

        const orderData = await Orders.findByIdAndUpdate(
            orderId,
            { $set: { OrderStatus: newOrderStatus, paymentStatus: paymentStatus } },
            { new: true }
        );
        console.log('orderData:', orderData)
        console.log(newOrderStatus);
        res.redirect('/admin/orderDetails?id=' + orderId);
    } catch (error) {
        console.log(error.message);
    }
};

// const loadSalesReport = async (req, res) => {
//     try {
//         const orders = await Orders.find().populate('products.productId').populate('userId');
//         //orderlist

//         const totalOrders = orders.length;
//         const uniqueConstomers = new Set(orders.map(order => order.userId.toString())).size;
//         const cashOnDelivery = orders.filter(order => order.paymentMethod ==='Cash On Delivery').length;
//         const onlinePayment = orders.filter(order => order.paymentMethod === 'Paypal').length;
//         const orderCancelled = orders.filter(order => order.OrderStatus === 'Order Cancelled').length;

//         const totalTransactionAmount = orders.reduce((total, order)=> total + order.totalAmount ,0)
//         res.render('salesReport', { orders,totalOrders,uniqueConstomers,cashOnDelivery,onlinePayment,orderCancelled,totalTransactionAmount });
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// };
const loadSalesReport = async (req, res) => {
    try {
        const orderId = req.query.id;
        const { time_period, orderStatus, startDate, endDate } = req.query;
        
        let orders = await Orders.find().populate('products.productId').populate('userId');

        // Filter orders based on the selected time period
        let filteredOrders = orders;
        if (time_period === 'weekly') {
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
            startOfWeek.setHours(0, 0, 0, 0);

            filteredOrders = orders.filter(order => order.orderDate >= startOfWeek);
        } else if (time_period === 'monthly') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            startOfMonth.setHours(0, 0, 0, 0);

            filteredOrders = orders.filter(order => order.orderDate >= startOfMonth);
        } else if (time_period === 'yearly') {
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            startOfYear.setHours(0, 0, 0, 0);

            filteredOrders = orders.filter(order => order.orderDate >= startOfYear);
        }
        
        
            if (orderStatus && orderStatus !== 'all') {
                // Make sure to use 'OrderStatus' instead of 'orderStatus' in the filter condition
                filteredOrders = filteredOrders.filter(order => order.OrderStatus === orderStatus);
                
            }

        // Start and end date
        if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);

            filteredOrders = orders.filter(order => order.orderDate >= startDateTime && order.orderDate <= endDateTime);
        }

        // Calculate statistics for the filtered orders
        const totalOrders = filteredOrders.length;
        const uniqueConstomers = new Set(orders.map(order => order.userId.toString())).size;
        const cashOnDelivery = filteredOrders.filter(order => order.paymentMethod === 'Cash On Delivery').length;
        const onlinePayment = filteredOrders.filter(order => order.paymentMethod === 'Paypal').length;
        const orderCancelled = filteredOrders.filter(order => order.OrderStatus === 'Order Cancelled').length;
        const totalTransactionAmount = filteredOrders.reduce((total, order) => total + order.totalAmount, 0);

        res.render('salesReport', {
            orders: filteredOrders,
            totalOrders,
            uniqueConstomers,
            cashOnDelivery,
            onlinePayment,
            orderCancelled,
            totalTransactionAmount,
            selectedTimePeriod: time_period || 'all',
            selectedOrderStatus: orderStatus || 'all',
            orderId: orderId,
            startDate: startDate, 
            endDate: endDate 
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const loadBanner = async(req, res)=>{
    try {
        const banner = await Banner.find({is_active : true})
        res.render('banner',{banner})
    } catch (error) {
        console.log(error.message)
    }
}

const addBanner = async(req, res)=>{
    try {
        const banner = new Banner({
            bannerName : req.body.bannerName,
            bannerText : req.body.bannerText,
            bannerImage : req.files.map((file) => file.path)
        })
        const bannerData = await banner.save();
        if (bannerData) {
            res.redirect('/admin/banner')
        } else {
            res.write('problem in addBanner');
            res.end();
        }


    } catch (error) {
        console.log(error.message)
    }
}

const bannerAction = async (req, res) => {
    try {
        const act = parseInt(req.query.act);
        if (act == 1 || act == 0) {
            banner = req.query.bannerId;
            const bannerData = await Banner.findByIdAndUpdate(
                banner,
                { $set: { is_active: act === 1 ? true : false } },
                { new: true })
            if (bannerData) {
                const banner = await Banner.find({})
                res.render('banner', { banner: banner })
            } else {
                console.log('User not found or update failed');
                // Handle the case where the user is not found or the update fails
                res.status(404).send('User not found or update failed');
            }

        } else {
            console.log('Invalid act parameter');
            // Handle the case where the act parameter is not 0 or 1
            res.status(400).send('Invalid act parameter');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editBanner = async (req, res) => {
    try {
        // Extract data from the request body
        const { editBannerName, editBannerText, editBannerId } = req.body;

        // Handle the edited banner image files (you may want to use a middleware for this)
        const editBannerImages = req.files.map((file) => file.path);

        // Find the banner by ID
        const banner = await Banner.findById(editBannerId);

        // Update the banner properties
        banner.bannerName = editBannerName;
        banner.bannerText = editBannerText;

        // Handle the edited images
        if (editBannerImages && editBannerImages.length > 0) {
            // Assuming you're storing the image file paths in the database
            banner.bannerImage = editBannerImages;
        }

        // Save the updated banner to the database
        const updatedBanner = await banner.save();
        console.log(updatedBanner)
        // Send a response
       res.redirect('/admin/banner')
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const deleteBanner = async(req, res)=>{
    try {
        const id = req.query.id;
        await Banner.deleteOne({_id : id})
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message)
    }
}

const loadBrand = async(req, res)=>{
    try {

        const brand = await Brand.find()

        res.render('brand',{message:'', brand})
    } catch (error) {
        console.log(error.message)
    }
}

const addBrand = async (req, res) => {
    try {
        console.log('haii');
        const brand = new Brand({
            brandName: req.body.brandName,
            brandImage: req.files.map((file) => file.path)
        });
        console.log(brand.brandName); // Corrected line
        const brandData = await brand.save();
        console.log(brandData);
        if (brandData) {
            res.redirect('/admin/brand');
        }
    } catch (error) {
        console.log(error.message);
    }
}


const brandAction = async (req, res) => {
    try {
        const act = parseInt(req.query.act)
        if (act == 1 || act == 0) {

            const brandId = req.query.brandId
            const brandData = await Brand.findByIdAndUpdate(
                brandId,
                { $set: { is_active: act === 1 ? true : false } },
                { new: true }
            );

            if (brandData) {
                // If the update is successful, fetch all users and render the userslist page
                const brand = await Brand.find({});
                res.render('brand', { brand: brand ,message:''});
            } else {
                console.log('User not found or update failed');
                // Handle the case where the user is not found or the update fails
                res.status(404).send('User not found or update failed');
            }
        } else {
            console.log('Invalid act parameter');
            // Handle the case where the act parameter is not 0 or 1
            res.status(400).send('Invalid act parameter');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const deleteBrand = async(req, res)=>{
    try {
        const id = req.query.id;
        await Brand.deleteOne({ _id: id })
        res.redirect('/admin/brand')
    } catch (error) {
        console.log(error.message)
    }
}

const adminLogout = async(req, res)=>{
    try {
        delete req.session.admin_id
        req.session.save();
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    newUserLoad,
    userAction,
    loadCategory,
    addCategory,
    categoryAction,
    loadEditCategory,
    updateCategory,
    deleteCategory,
    loadAddProduct,
    addProduct,
    loadProductList,
    
    productAction,
    loadEditProduct,
    updateProduct,
    deleteProduct,
    loadOrderList,
    loadOrderDetails,
    orderStatus,
    loadSalesReport,
    loadBanner,
    addBanner,
    bannerAction,
    editBanner,
    deleteBanner,
    loadBrand,
    addBrand,
    brandAction,
    deleteBrand,
    formatedCouponDate,
    adminLogout




}