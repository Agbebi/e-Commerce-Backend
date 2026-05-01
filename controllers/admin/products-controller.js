const { imageUploadUtil } = require('../../helpers/cloudinary');
const Product = require('../../models/Product');


const handleImageUpload = async (req, res) => {

    try {

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const url = `data:${req.file.mimetype};base64,${b64}`;
        const result = await imageUploadUtil(url);


        res.status(200).json({
            success : true,
            message : "Image uploaded successfully",
            data : result
        })

    }catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ 
            success : false,
            message : "Internal server error" });
    }

}


//Adding a product

async function addProduct(req, res) {
    try {
        const { image, name, description, category, brand, price, salesPrice, totalStock } = req.body

        const newlyCreatedProduct = new Product({
            image,
            name,
            description, 
            category, 
            brand, 
            price, 
            salesPrice, 
            totalStock
        })        

        await newlyCreatedProduct.save()

        res.status(201).json({
            success : true,
            message : "Product added successfully",
            data : newlyCreatedProduct
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success : false,
            message : "There was an error adding the product"
        })
    }
}


//Fetching all products

async function fetchAllProducts(req, res) {
     try {
        const allProducts = await Product.find({})

        res.status(200).json({
            success : true,
            message : "All products fetched successfully",
            data : allProducts
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success : false,
            message : "There was an error fetching all products"
        })
    }
}

//Edit a product
async function editProduct(req, res) {
     try {

        const { id } = req.params
        
        const { image, name, description, category, brand, price, salesPrice, totalStock } = req.body

        const findProduct = await Product.findById(id)

        if(!findProduct) {
            return res.status(404).json({
                success : false,
                message : "Product not found"
            })
        }

        findProduct.image = image || findProduct.image
        findProduct.name = name || findProduct.name
        findProduct.description = description || findProduct.description
        findProduct.category = category || findProduct.category
        findProduct.brand = brand || findProduct.brand
        findProduct.price = price == '' ? 0 : price || findProduct.price
        findProduct.salesPrice = salesPrice == '' ? 0 : salesPrice || findProduct.salesPrice
        findProduct.totalStock = totalStock || findProduct.totalStock

        await findProduct.save()

        res.status(200).json({
            success : true,
            message : "Product edited successfully",
            data : findProduct
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success : false,
            message : "There was an error editing the product"
        })
    }
}

//Delete a product
async function deleteProduct(req, res) {
      try {
        const { id } = req.params        
        const findProduct = await Product.findByIdAndDelete(id)
        if(!findProduct) {
            return res.status(404).json({
                success : false,
                message : "Product not found"
            })
        }

        res.status(200).json({
            success : true,
            message : "Product deleted successfully",
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success : false,
            message : "There was an error deleting the product"
        })
    }
}

module.exports = { handleImageUpload, addProduct, fetchAllProducts, editProduct, deleteProduct }