const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    manufacturer: String,
    category: String,
    price: Number,
    userId: String

})

module.exports = mongoose.model("products", productSchema);