import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import Category from '../models/Category';
import { sendSuccess, sendError } from '../utils/response';

export const createCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      sendError(res, 'Category name already exists', 400);
      return;
    }

    const category = await Category.create({ name, description });
    sendSuccess(res, { category }, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    sendSuccess(res, { categories }, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }

    sendSuccess(res, { category }, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }
    sendSuccess(res, {}, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
