import Product from "../models/product.models.js"
import User from "../models/user.models.js"

export const addProduct = async (req, res)=>{
    try {
    const user = req.user;
    if(user.role == 'admin') {
        const body = req.body
        if(!body?.name || !body?.category || !body?.price || !body?.stock ) {
            return res.status(400).json({
                success : false,
                message : "Required fields missing"
            })
        } else {
            const newProduct = await Product.create(body)
            return res.status(201).json({
                success : true,
                data : newProduct,
                message : "new product added"
            })
        }
    } else {
        return res.status(403).json({
            success : false,
            message : "Access denied, admins only"
        })
    }
    } catch(err) {
        return res.status(500).json({
            success : false,
            message : err.message || "something went wrong"
        })
    }
}

export const editProduct = async (req, res) => {
    try {
    const user = req.user;
    const id = req.params.id;
    const body = req.body;
    if(user.role == 'admin') {
        const updatedProduct = await Product.findByIdAndUpdate(id, body, { returnDocument : "after" })
        return res.status(200).json({
            success : true,
            message : "product updated",
            data : updatedProduct
        })
    } else {
        return res.status(403).json({
            success : false,
            message : "Access denied, admins only"
        })
    }
    } catch(err) {
        return res.status(500).json({
            success : false,
            message : err.message || "something went wrong"
        })
    }
}


export const deleteProduct = async (req, res) => {
    try {
    const user = req.user;
    const id = req.params.id;
    if(user.role == 'admin') {
        const deletedProduct = await Product.findByIdAndDelete(id)
        return res.status(200).json({
            success : true,
            message : "product deleted",
            data : deletedProduct
        })
    } else {
        return res.status(403).json({
            success : false,
            message : "Access denied, admins only"
        })
    }
    } catch(err) {
        return res.status(500).json({
            success : false,
            message : err.message || "something went wrong"
        })
    }
}