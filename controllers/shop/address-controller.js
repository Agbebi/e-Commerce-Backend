const Address = require('../../models/Address')

const addAddress = async (req, res) => {

    try {
        
        const { userId, address, city, state, postalCode, country, phoneNumber, notes } = req.body;

        if (!userId || !address || !city || !state || !postalCode || !country || !phoneNumber) {
            return res.status(400).json({ 
                success: false,    
                message: 'Invalid input' 
            });
        }

        const newlyCreatedAddress = new Address({
            userId, address, city, state, postalCode, country, phoneNumber, notes
        })

        await newlyCreatedAddress.save();

        return res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: newlyCreatedAddress
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,    
            message: 'Server error' 
        });
    }
}

const fetchAddresses = async (req, res) => {

    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ 
                success: false,    
                message: 'User ID is required' 
            });
        }

        const addresses = await Address.find({ userId })
        return res.status(200).json({
            success: true,
            message: 'Addresses fetched successfully',
            data: addresses
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,    
            message: 'Server error' 
        });
    }
}

const editAddress = async (req, res) => {

    try {

        const { userId, addressId } = req.params;

        const formData = req.body;

         if (!userId || !addressId) {
            return res.status(400).json({ 
                success: false,    
                message: 'User ID and Address ID are required' 
            });
        }

        const addressToUpdate = await Address.findOneAndUpdate({ _id: addressId, userId }, formData, { new: true })

        if (!addressToUpdate) {
            return res.status(404).json({ 
                success: false,    
                message: 'Address not found' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: addressToUpdate
        })
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,    
            message: 'Server error' 
        });
    }
}

const deleteAddress = async (req, res) => {

    try {

        const { userId, addressId } = req.params;

        if (!userId || !addressId) {
            return res.status(400).json({ 
                success: false,    
                message: 'User ID and Address ID are required' 
            });
        }

        const addressToDelete = await Address.findOneAndDelete({ _id: addressId, userId })

        if (!addressToDelete) {
            return res.status(404).json({ 
                success: false,    
                message: 'Address not found' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            data: addressToDelete
        })
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,    
            message: 'Server error' 
        });
    }
}


module.exports = {
    addAddress,
    fetchAddresses,
    editAddress,
    deleteAddress
}