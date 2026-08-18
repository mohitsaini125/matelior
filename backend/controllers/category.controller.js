import Category from "../models/category.model.js"
import mongoose from "mongoose"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"

export const addCategory = async (req, res) => {
    try {
        const body = req.body;
        if (!body?.name) {
            return failedResponse(res, 400, "required fields are missing");
        }
        if (!body.slug) {
            body.slug = body.name.toLowerCase().trim().replace(/\s+/g, "-");
        }
        const newCategory = await Category.create(body);
        return successResponse(res, 201, "new category added", newCategory);
    } catch (err) {
        console.error("addCategory error:", err);
        return errorResponse(res, err);
    }
};

export const editCategory = async (req, res) => {
    try {
        const body = req.body;
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return failedResponse(res, 404, "category does not exist");
        }
        const updatedCategory = await Category.findByIdAndUpdate(id, body, { new: true });
        if (!updatedCategory) {
            return failedResponse(res, 404, "category does not exist");
        }
        return successResponse(res, 200, "category updated", updatedCategory);
    } catch (err) {
        console.error("editCategory error:", err);
        return errorResponse(res, err);
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return failedResponse(res, 404, "category does not exist");
        }
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return failedResponse(res, 404, "category does not exist");
        }
        return successResponse(res, 200, "category deleted", deletedCategory);
    } catch (err) {
        console.error("deleteCategory error:", err);
        return errorResponse(res, err);
    }
};

export const getCategory = async (req, res) => {
    try {
        const { name, q, status, sort, order } = req.query;
        const query = {};
        const sortOptions = {};
        let sortNumber = 1;
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ];
        }
        if (name) {
            query.name = name;
        }
        if (status) {
            query.status = status;
        }
        if (order === "desc") {
            sortNumber = -1;
        }
        if (sort === "name") {
            sortOptions.name = sortNumber;
        } else {
            sortOptions.createdAt = -1;
        }
        const categories = await Category.find(query).sort(sortOptions);
        const formatted = categories.map((cat) => {
            const obj = cat.toObject ? cat.toObject() : { ...cat };
            if (!obj.slug) obj.slug = obj.name ? obj.name.toLowerCase().trim().replace(/\s+/g, "-") : String(obj._id);
            return obj;
        });
        return successResponse(res, 200, "fetched categories", formatted);
    } catch (err) {
        console.error("getCategory error:", err);
        return errorResponse(res, err);
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const id = req.params.id;
        let category = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            category = await Category.findById(id);
        }
        if (!category) {
            category = await Category.findOne({
                $or: [{ slug: id }, { name: new RegExp(`^${id}$`, "i") }]
            });
        }
        if (!category) {
            return failedResponse(res, 404, "category not found");
        }
        const obj = category.toObject ? category.toObject() : { ...category };
        if (!obj.slug) obj.slug = obj.name ? obj.name.toLowerCase().trim().replace(/\s+/g, "-") : String(obj._id);
        return successResponse(res, 200, "category found", obj);
    } catch (err) {
        console.error("getCategoryById error:", err);
        return errorResponse(res, err);
    }
};