"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategories = exports.createCategory = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const response_1 = require("../utils/response");
const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const existing = await Category_1.default.findOne({ name });
        if (existing) {
            (0, response_1.sendError)(res, 'Category name already exists', 400);
            return;
        }
        const category = await Category_1.default.create({ name, description });
        (0, response_1.sendSuccess)(res, { category }, 'Category created successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category_1.default.find().sort({ name: 1 });
        (0, response_1.sendSuccess)(res, { categories }, 'Categories retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const updateCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const category = await Category_1.default.findByIdAndUpdate(req.params.id, { name, description }, { new: true, runValidators: true });
        if (!category) {
            (0, response_1.sendError)(res, 'Category not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { category }, 'Category updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category_1.default.findByIdAndDelete(req.params.id);
        if (!category) {
            (0, response_1.sendError)(res, 'Category not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, {}, 'Category deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
