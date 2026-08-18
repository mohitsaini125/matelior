import Product from "../models/product.models.js"
import Category from "../models/category.model.js"
import mongoose from "mongoose"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"

export const addProduct = async (req, res) => {
    try {
        const body = req.body;
        if (!body?.name || !body?.category || !body?.price || body?.stock === undefined) {
            return failedResponse(res, 400, "Required fields are missing");
        }
        const newProduct = await Product.create(body);
        return successResponse(res, 201, "New product has been added", newProduct);
    } catch (err) {
        console.error("addProduct error:", err);
        return errorResponse(res, err);
    }
};

export const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return failedResponse(res, 404, "product does not exist");
        }
        const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });
        if (!updatedProduct) {
            return failedResponse(res, 404, "product does not exist");
        }
        return successResponse(res, 200, "product updated", updatedProduct);
    } catch (err) {
        console.error("editProduct error:", err);
        return errorResponse(res, err);
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return failedResponse(res, 404, "product does not exist");
        }
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return failedResponse(res, 404, "product does not exist");
        }
        return successResponse(res, 200, "product deleted", deletedProduct);
    } catch (err) {
        console.error("deleteProduct error:", err);
        return errorResponse(res, err);
    }
};

export const getProducts = async (req, res) => {
    try {
        const { sort, order, category, sku, q, material, color, minPrice, maxPrice } = req.query;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
        const skip = (page - 1) * limit;

        const sortOptions = {};
        let orderNumber = 1;
        if (order === "desc") {
            orderNumber = -1;
        }

        if (sort === "price") {
            sortOptions.price = orderNumber;
        } else if (sort === "category") {
            sortOptions.category = orderNumber;
        } else if (sort === "newest") {
            sortOptions.createdAt = orderNumber;
        } else if (sort === "popularity") {
            sortOptions.createdAt = -1;
        } else if (sort === "rating") {
            sortOptions.rating = orderNumber;
        } else {
            sortOptions.createdAt = -1;
        }

        const query = { status: { $ne: "deleted" } };

        if (q) {
            query.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { tags: { $in: [new RegExp(q, "i")] } },
            ];
        }
        if (category) {
            let catId = category;
            if (!mongoose.Types.ObjectId.isValid(category)) {
                const catDoc = await Category.findOne({
                    $or: [{ slug: category }, { name: new RegExp(`^${category}$`, "i") }]
                });
                if (catDoc) catId = catDoc._id;
            }
            query.category = catId;
        }
        if (sku) {
            query.sku = sku;
        }
        if (material) {
            query.material = material;
        }
        if (color) {
            query.colors = { $in: [color] };
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined) query.price.$gte = Number(minPrice);
            if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .populate("category"),
            Product.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limit) || 1;

        return successResponse(res, 200, "products fetched successfully", {
            items: products,
            page,
            limit,
            total,
            totalPages,
        });
    } catch (err) {
        console.error("getProducts error:", err);
        return errorResponse(res, err);
    }
};

export const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return failedResponse(res, 404, "product does not exist");
        }
        const product = await Product.findById(id).populate("category");
        if (!product) {
            return failedResponse(res, 404, "product does not exist");
        }
        return successResponse(res, 200, "product fetched", product);
    } catch (err) {
        console.error("getProductById error:", err);
        return errorResponse(res, err);
    }
};

