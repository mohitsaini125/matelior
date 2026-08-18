import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.models.js";
import { errorResponse, failedResponse, successResponse } from "../utils/response.js";

async function getPopulatedWishlistProducts(userId) {
    const wishlist = await Wishlist.findOne({ user: userId }).populate("products");
    if (!wishlist || !wishlist.products) return [];
    return wishlist.products.filter((p) => p && p._id);
}

export const addToWishlist = async (req, res) => {
    try {
        const productId = req.body?.productId || req.params?.productId;
        const userId = req.user._id;

        if (!productId) {
            return failedResponse(res, 400, "Product ID is required");
        }

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return failedResponse(res, 404, "Product not found");
        }

        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: userId,
                products: [productId],
            });
        } else {
            const products = wishlist.products || [];
            const inProduct = products.some((v) => v && v.toString() === productId.toString());
            if (!inProduct) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }

        const populatedList = await getPopulatedWishlistProducts(userId);
        return successResponse(res, 200, "Product added to wishlist", populatedList);
    } catch (err) {
        console.error("addToWishlist error:", err);
        return errorResponse(res, err);
    }
};

export const readWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const populatedList = await getPopulatedWishlistProducts(userId);
        return successResponse(res, 200, "Fetched wishlist", populatedList);
    } catch (err) {
        console.error("readWishlist error:", err);
        return errorResponse(res, err);
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const productId = req.params?.productId || req.body?.productId;
        const userId = req.user._id;

        if (!productId) {
            return failedResponse(res, 400, "Product ID is required");
        }

        const wishlist = await Wishlist.findOne({ user: userId });
        if (wishlist && wishlist.products) {
            wishlist.products = wishlist.products.filter(
                (v) => v && v.toString() !== productId.toString()
            );
            await wishlist.save();
        }

        const populatedList = await getPopulatedWishlistProducts(userId);
        return successResponse(res, 200, "Product removed from wishlist", populatedList);
    } catch (err) {
        console.error("removeFromWishlist error:", err);
        return errorResponse(res, err);
    }
};

export const clearWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        await Wishlist.findOneAndDelete({ user: userId });
        return successResponse(res, 200, "Wishlist cleared successfully", []);
    } catch (err) {
        console.error("clearWishlist error:", err);
        return errorResponse(res, err);
    }
};