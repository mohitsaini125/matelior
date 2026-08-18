import Cart from "../models/cart.model.js";
import Product from "../models/product.models.js";
import { errorResponse, failedResponse, successResponse } from "../utils/response.js";

function formatCart(cartDoc) {
    if (!cartDoc) return { items: [], total: 0 };
    const items = (cartDoc.items || [])
        .filter((item) => item && item.product)
        .map((item) => {
            const productObj = item.product.toObject ? item.product.toObject() : item.product;
            const price = productObj.discountPercent
                ? Math.round(productObj.price * (1 - productObj.discountPercent / 100))
                : productObj.price;
            return {
                _id: item._id ? item._id.toString() : item.product._id?.toString(),
                product: productObj,
                quantity: item.quantity,
                price: price,
            };
        });

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
        _id: cartDoc._id,
        user: cartDoc.user,
        items,
        total,
    };
}

export const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.body.productId || req.params.id;
        const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);

        if (!productId) {
            return failedResponse(res, 400, "Product ID is required");
        }

        const product = await Product.findById(productId);
        if (!product) {
            return failedResponse(res, 404, "Product does not exist");
        }
        if (product.status === "hidden" || product.status === "deleted") {
            return failedResponse(res, 403, "Item is not active");
        }
        if (product.stock === 0) {
            return failedResponse(res, 409, "Item is sold out");
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [{ product: productId, quantity: Math.min(quantity, product.stock) }],
            });
        } else {
            const existingItem = cart.items.find(
                (item) => item.product && item.product.toString() === productId.toString()
            );

            if (existingItem) {
                const newQty = existingItem.quantity + quantity;
                if (newQty > product.stock) {
                    existingItem.quantity = product.stock;
                } else {
                    existingItem.quantity = newQty;
                }
            } else {
                cart.items.push({
                    product: productId,
                    quantity: Math.min(quantity, product.stock),
                });
            }
            await cart.save();
        }

        const populatedCart = await Cart.findById(cart._id).populate("items.product");
        return successResponse(res, 200, "Product added to cart", formatCart(populatedCart));
    } catch (err) {
        console.error("addToCart error:", err);
        return errorResponse(res, err);
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user._id;
        const itemId = req.params.itemId || req.params.id;
        const quantity = parseInt(req.body.quantity, 10);

        if (isNaN(quantity)) {
            return failedResponse(res, 400, "Valid quantity is required");
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return failedResponse(res, 404, "Cart does not exist");
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(
                (item) =>
                    item._id.toString() !== itemId &&
                    item.product.toString() !== itemId
            );
        } else {
            const targetItem = cart.items.find(
                (item) =>
                    item._id.toString() === itemId ||
                    item.product.toString() === itemId
            );

            if (!targetItem) {
                return failedResponse(res, 404, "Item not found in cart");
            }

            const product = await Product.findById(targetItem.product);
            if (product && quantity > product.stock) {
                targetItem.quantity = product.stock;
            } else {
                targetItem.quantity = quantity;
            }
        }

        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate("items.product");
        return successResponse(res, 200, "Cart updated", formatCart(populatedCart));
    } catch (err) {
        console.error("updateCartQuantity error:", err);
        return errorResponse(res, err);
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const itemId = req.params.itemId || req.params.productId || req.params.id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return successResponse(res, 200, "Cart is empty", { items: [], total: 0 });
        }

        cart.items = cart.items.filter(
            (item) =>
                item._id.toString() !== itemId &&
                item.product.toString() !== itemId
        );

        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate("items.product");
        return successResponse(res, 200, "Product removed from cart", formatCart(populatedCart));
    } catch (err) {
        console.error("removeFromCart error:", err);
        return errorResponse(res, err);
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart) {
            return successResponse(res, 200, "Cart is empty", { items: [], total: 0 });
        }
        return successResponse(res, 200, "Cart items fetched", formatCart(cart));
    } catch (err) {
        console.error("getCart error:", err);
        return errorResponse(res, err);
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        return successResponse(res, 200, "Cart cleared successfully", { items: [], total: 0 });
    } catch (err) {
        console.error("clearCart error:", err);
        return errorResponse(res, err);
    }
};

export const deleteCartProduct = removeFromCart;