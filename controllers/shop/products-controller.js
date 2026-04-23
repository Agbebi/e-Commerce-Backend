const Product = require('../../models/Product');


const getFilteredProducts = async (req, res) => {
    try {        
        const { Category = [], Brand = [], sortBy ='price:low-to-high'} = req.query

        let filters = {}

        if (Category.length > 0) {
            filters.category = { $in: Category.split(',') }
        }

        if (Brand.length > 0) {
            filters.brand = { $in: Brand.split(',') }
        }


        let sort = {}

        switch (sortBy) {
            case 'price:low-to-high':
                sort.price = 1
                break;

             case 'price:high-to-low':
                sort.price = -1
                break;

                 case 'A-Z':
                sort.name = 1
                break;

                 case 'Z-A':
                sort.name = 1
                break;
        
            default:
                sort.price = 1
                break;
        }

        const response = await Product.find(filters).sort(sort) 

        res.status(200).json({
            success: true,
            data: response
        })

    } catch (error) {
        console.log('Error fetching products:', error);
        res.status(500).json({ 
            success: false,
            message: 'An error occurred while fetching products' });
    }
}

const getProductDetails = async (req, res) => {
    try{
        const { id } = req.params
        
        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        res.status(200).json({
            success: true,
            data: product
        })

        }catch(error){
        console.log('Error fetching product details:', error);
        res.status(500).json({ 
            success: false,
            message: 'An error occurred while fetching product details' });
    }
}


module.exports = { getFilteredProducts, getProductDetails }