import Cart from "../models/cart.model.js"
import Product from "../models/product.models.js"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"

export const addToCart = async (req, res)=> {
    try {
        const user = req.user
        const productId = req.params.id
        const item = await Product.findById(productId)
        if(!item) {
            return failedResponse(res, 404, "product does not exist")
        }
        if(item.status == "hidden") {
            return failedResponse(res, 403, "item is not active")
        }
        if(item.stock == 0) {
            return failedResponse(res, 409, "item is sold out")
        }
        const cart = await Cart.findOne({
            user : user._id
        })
        const items = cart?.items
        const inCart = items?.find(v=> v.product.equals(productId))
       if(cart) {
           if(inCart) {
             if(item.stock - inCart.quantity > 0) {
                inCart.quantity = inCart.quantity + 1
                const newItems = items?.map(item=> item.product.toString() == productId ? inCart : item)
                const updatedCart = await cart.updateOne({
                items : newItems
            })
            return successResponse(res, 200, "quantity increased by 1")
            } else {
                return failedResponse(res, 409, "Insufficient stock")
            }
           } else {
            const createdCart = await cart.updateOne({
                items : [...items, {
                    product : productId,
                    quantity : 1
                }]
            })
            return successResponse(res, 200, "product added to cart")
           }
       } else {
            const createdCart = await Cart.create({
                user : user._id,
                items : [{
                    product : productId,
                    quantity : 1
                }]
            })
            return successResponse(res, 201, "cart created and product added")
       }
    } catch(err) {
        return errorResponse(res, err)
    }
}

export const removeFromCart = async (req, res)=> {
    try {
        const productId = req.params.productId
        const userId = req.user._id
        const cart = await Cart.findOne({ user : userId })
        const items = cart.items
        const item = items.find((v)=>v.product.toString()===productId)
        if(!item) {
            return failedResponse(res,200,"product does not exist")
        }
        if(item.quantity===1) {
        const newItems = items.filter((v)=>v.product.toString() != productId)
        const updatedCart = await Cart.findOneAndUpdate({ user : userId }, { items : newItems }, { returnDocument : "after" })
        return successResponse(res, 200, "product deleted from the cart", updatedCart)  
        } else {
            const updatedItem = {
                product : item.product,
                quantity : item.quantity-1
            }
            const newItems = items.map((v)=>v.product.toString()===productId ? updatedItem : v)
            const updatedCart = await Cart.findOneAndUpdate({ user : userId }, { items : newItems }, { returnDocument : "after" })
            return successResponse(res, 200, "quantity reduced by 1", updatedCart)
        }
    } catch(err) {
        return errorResponse(res, err)
    }
}

export const getCart = async (req, res)=> {
    try {
        const user = req.user
        const userId = user._id
        const cartItems = await Cart.findOne({
            user : userId
        })
        if(!cartItems) {
            failedResponse(res, 200, "Cart is empty!!!")
        }
        return successResponse(res, 200, "cart items fetched", cartItems)
    } catch(err) {
        return errorResponse(res, err)
    }
}

export const clearCart = async (req, res)=> {
    try {
        const userId = req.user._id
        const cart = await Cart.findOne({
            user : userId
        })
        if(!cart) {
            return failedResponse(res, 200, "Cart does not exist")
        }
        const deletedCart = await Cart.findOneAndDelete({ user : userId })
        return successResponse(res, 200, "Cart Deleted Successfully", deletedCart)
    } catch(err) {
        return errorResponse(res, err)
    }
}

export const deleteCartProduct = async (req, res)=> {
    try {
        const productId = req.params.productId
        const userId = req.user._id
        const cart = await Cart.findOne({ user : userId })
        if(!cart) {
            return failedResponse(res, 200, "Cart does not exist")
        }
        const items = cart.items
        const item = items.find((v)=> v.product.toString() === productId)
        if(!item) {
            return failedResponse(res, 200, "product is not in the cart")
        }
        const newItems = items.filter((v)=>v.product.toString() != productId)

        if(!newItems.length) {
            await Cart.findOneAndDelete({ user : userId })
            return failedResponse(res, 200, "Only product deleted, cart becomes empty.")
        }

        const updatedCart = await Cart.findOneAndUpdate({ user : userId }, { items : newItems }, { returnDocument : "after" })
        return successResponse(res, 200, "product deleted from the cart", updatedCart)

    } catch(err) {
        return errorResponse(res, err)
    }
}