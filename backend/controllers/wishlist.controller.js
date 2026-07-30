import Wishlist from "../models/wishlist.model.js"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"

export const addToWishlist = async (req, res)=>{
    try {
        const productId = req.params.productId
        const userId = req.user._id
        const wishlist = await Wishlist.findOne({
            user : userId
        })
        if(!wishlist) {
            const wishlist = await Wishlist.create({
                user : userId,
                products : [productId]
            })
            successResponse(res, 201, "wishlist created and product added", wishlist.products)
        } else {
            const products = wishlist.products
            const inProduct = products.find((v)=>v.toString()==productId)
            if(inProduct) {
                failedResponse(res, 200, "item already in wishlist")
            } else {
                products.push(productId)
                const updatedWishlist = await Wishlist.findOneAndUpdate({ user : userId }, { products : products }, { returnDocument: "after" })
                successResponse(res, 200, "product added to wishlist", updatedWishlist.products)
            }
        }
    } catch(err) {
        errorResponse(res, err)
    }
}

export const readWishlist = async (req, res)=>{
    try {
        const userId = req.user._id
        const wishlist = await Wishlist.findOne({ user : userId }).populate("products", "name")
        if(!wishlist) {
            failedResponse(res, 200, "wishlist does not exist")
        } else {
            successResponse(res, 200, "fetched wishlist", wishlist.products)
        }
    } catch(err) {
        errorResponse(res, err)
    }
}

export const removeFromWishlist = async (req, res)=>{
    try {
        const productId = req.params.productId
        const userId = req.user._id
        const wishlist = await Wishlist.findOne({ user : userId })
        if(!wishlist) {
            failedResponse(res, 200, "wishlist does not exist")
        } else {
            const products = wishlist.products
            const inProducts = products.find((v)=>v.toString()==productId)
            if(inProducts) {
                const newProducts = products.filter((v)=>v.toString()!=productId)
                const updatedWishlist = await Wishlist.findOneAndUpdate({ user : userId }, { products : newProducts }, { returnDocument : "after"})
                console.log(!newProducts.length)
                if(!newProducts.length) {
                    await Wishlist.findOneAndDelete({ user : userId })
                    console.log("error is here")
                }
                successResponse(res, 200, "product removed from wishlist", updatedWishlist.products)
            } else {
                failedResponse(res, 200, "product does not exist in wishlist")
            }
        }
    } catch(err) {
        errorResponse(res, err)
    }
}

export const clearWishlist = async (req, res)=>{
    try {
        const userId = req.user._id
        const wishlist = await Wishlist.findOne({ user : userId })
        if(!wishlist) {
            failedResponse(res, 200, "wishlist does not exist")
        } else {
            const deletedWishlist = await Wishlist.findOneAndDelete({ user : userId })
            successResponse(res, 200, "wishlist cleared!!")
        }
    } catch(err) {
        errorResponse(res, err)
    }
}