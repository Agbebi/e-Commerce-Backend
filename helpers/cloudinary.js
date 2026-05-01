

const cloudinary = require('cloudinary').v2
const multer = require('multer')


cloudinary.config({
    cloud_name : 'dpvue93az',
    api_key : '347364781798833',
    api_secret : 'O29d0wXXwVj9scfKLeRnRDj5VRo'
})


const storage = multer.memoryStorage()

async function imageUploadUtil(file) {
    const result  = await cloudinary.uploader.upload(file, {
        resource_type : 'auto',
    })


    return result;
}

const upload = multer({ storage })


module.exports = { upload, imageUploadUtil }