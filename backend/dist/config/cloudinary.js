"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dummy_cloud_name',
    api_key: process.env.CLOUDINARY_API_KEY || 'dummy_api_key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'dummy_api_secret',
});
exports.default = cloudinary_1.v2;
