const User = require('../models/userModel')
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const Orders = require('../models/ordersModel')
const Coupon = require('../models/couponModel');
const Banner = require('../models/bannerModel')
const moment = require('moment')

const formatedCouponDate = (date) => {
    return moment(date).format('MMMM DD, YYYY hh:mm A');

};

const loadCategoryOffer = async (req, res) => {
    try {
        const categories = await Category.find({ is_active: true });
        res.render('categoryOffer', { message: '', categories, formatedCouponDate });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const addCategoryOffer = async (req, res) => {
    try {
        console.log('haai')
        const categoryId = req.body.name;
        const discountPercentage = req.body.discountPercentage;
        const expiry = req.body.expiry;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.discountPercentage = discountPercentage;
        category.expiry = expiry;
        category.offerStatus = true;

        await category.save();
        console.log(category)
        const products = await Product.find({ category: category });
        console.log(products)
        for (const product of products) {

            const discountedPrice = product.regularPrice - (product.regularPrice * discountPercentage) / 100;

            // Update product fields
            product.offerPrice = discountedPrice;
            product.showPrice = Math.min(discountedPrice, product.promoPrice);

            // Save the product
            const productData = await product.save();
            console.log(productData)
        }

        res.redirect('/admin/categoryOffer');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const categoryOfferAction = async (req, res) => {
    try {
        const act = parseInt(req.query.act)
        if (act == 1 || act == 0) {

            const categoryId = req.query.categoryId
            const catData = await Category.findByIdAndUpdate(
                categoryId,
                { $set: { offerStatus: act === 1 ? true : false } },
                { new: true }
            );

            if (catData) {

                const category = await Category.find({});
                res.render('categoryOffer', { categories: category, message: '', formatedCouponDate });
            } else {
                console.log('User not found or update failed');

                res.status(404).send('User not found or update failed');
            }
        } else {
            console.log('Invalid act parameter');

            res.status(400).send('Invalid act parameter');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const deleteCategoryOffer = async (req, res) => {
    try {
        const id = req.query.id;


        const category = await Category.findById(id);


        category.discountPercentage = 0;
        category.expiry = null;
        category.offerStatus = false;


        await category.save();


        res.redirect('/admin/categoryOffer');
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadCategoryOffer,
    addCategoryOffer,
    categoryOfferAction,
    deleteCategoryOffer,
    formatedCouponDate
}