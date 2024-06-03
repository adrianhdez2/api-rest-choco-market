import cloudinary from '../configs/cloudinary.js'

export const deleteCloudinaryResource = (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.api.delete_resources(publicId, { type: 'upload', resource_type: 'image' }, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};
