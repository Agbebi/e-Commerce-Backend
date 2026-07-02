const { imageUploadUtil } = require('../../helpers/cloudinary');
const Product = require('../../models/Product');

const normalizeSpecifications = (specifications, fallbackKeyFeatures = []) => {
    if (Array.isArray(specifications)) {
        return specifications
            .filter((spec) => spec && (spec.name?.toString().trim() || spec.value?.toString().trim()))
            .map((spec) => ({
                name: spec.name?.toString().trim() || 'Specification',
                value: spec.value?.toString().trim() || ''
            }));
    }

    if (Array.isArray(fallbackKeyFeatures)) {
        return fallbackKeyFeatures
            .filter(Boolean)
            .map((feature) => ({
                name: 'Feature',
                value: feature.toString().trim()
            }));
    }

    return [];
};

const handleImageUpload = async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

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
        const { images, image, name, description, category, subcategory, keyFeatures, specifications, vendorId, brand, price, salesPrice, totalStock } = req.body
        
        const newImages = Array.isArray(images)
            ? images.slice(0, 5)
            : image ? [image] : []

        const parsedKeyFeatures = Array.isArray(keyFeatures)
            ? keyFeatures.filter(Boolean)
            : typeof keyFeatures === 'string'
                ? keyFeatures.split(/\r?\n/).map(item => item.trim()).filter(Boolean)
                : []

        const parsedSpecifications = normalizeSpecifications(specifications, parsedKeyFeatures)

        const newlyCreatedProduct = new Product({
            images: newImages,
            name,
            description,
            category,
            subcategory,
            specifications: parsedSpecifications,
            keyFeatures: parsedKeyFeatures,
            brand,
            price,
            salesPrice,
            totalStock,
            vendorId
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

    const { vendorId } = req.params
     try {
        const allProducts = await Product.find({ vendorId: vendorId })

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
        
        const { images, image, name, description, category, subcategory, keyFeatures, specifications, brand, price, salesPrice, totalStock } = req.body

        const findProduct = await Product.findById(id)

        if(!findProduct) {
            return res.status(404).json({
                success : false,
                message : "Product not found"
            })
        }

        const newImages = Array.isArray(images)
            ? images.slice(0, 5)
            : image ? [image] : findProduct.images

        const parsedKeyFeatures = Array.isArray(keyFeatures)
            ? keyFeatures.filter(Boolean)
            : typeof keyFeatures === 'string'
                ? keyFeatures.split(/\r?\n/).map(item => item.trim()).filter(Boolean)
                : findProduct.keyFeatures || []

        const hasSpecificationsField = Object.prototype.hasOwnProperty.call(req.body, 'specifications')
        const parsedSpecifications = hasSpecificationsField
            ? normalizeSpecifications(specifications, parsedKeyFeatures)
            : findProduct.specifications || []

        findProduct.images = newImages.length > 0 ? newImages : findProduct.images
        findProduct.name = name || findProduct.name
        findProduct.description = description || findProduct.description
        findProduct.category = category || findProduct.category
        findProduct.subcategory = subcategory || findProduct.subcategory
        findProduct.specifications = parsedSpecifications
        findProduct.keyFeatures = parsedKeyFeatures.length > 0 ? parsedKeyFeatures : findProduct.keyFeatures
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