const Product = require('../../models/Product');


const normalizeQueryValue = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.flatMap((item) =>
            item.toString().split(',').map((entry) => entry.trim()).filter(Boolean),
        );
    }
    return value.toString().split(',').map((entry) => entry.trim()).filter(Boolean);
};

const getAvailableBrands = async (req, res) => {
    try {
        const brands = await Product.distinct('brand', { brand: { $exists: true, $ne: '' } });
        const sortedBrands = (brands || [])
            .filter(Boolean)
            .map((brand) => brand.toString().trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        res.status(200).json({
            success: true,
            data: sortedBrands,
        });
    } catch (error) {
        console.log('Error fetching brands:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching brands',
        });
    }
};

const getFilteredProducts = async (req, res) => {
    try {
        const {
            sortBy = 'price:low-to-high',
        } = req.query;

        const Category = normalizeQueryValue(req.query.Category);
        const SubCategory = normalizeQueryValue(req.query.SubCategory);
        const Brand = normalizeQueryValue(req.query.Brand);

        let filters = {}

        if (Category.length > 0) {
            filters.category = { $in: Category };
        }

        if (SubCategory.length > 0) {
            filters.subcategory = { $in: SubCategory };
        }

        if (Brand.length > 0) {
            filters.brand = { $in: Brand };
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
                sort.name = -1
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


module.exports = { getFilteredProducts, getProductDetails, getAvailableBrands }