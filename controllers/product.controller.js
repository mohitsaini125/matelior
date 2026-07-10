import Product from "../models/product.models.js"
import User from "../models/user.models.js"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"

export const addProduct = async (req, res)=>{
    try {
        const body = req.body
        if(!body?.name || !body?.category || !body?.price || !body?.stock ) {
            failedResponse(res, 400, "Required fields are missing")
        } else {
            const newProduct = await Product.create(body)
            successResponse(res, 201, "New product has been added", newProduct)
        }
    } catch(err) {
        errorResponse(res, err)
    }
}

export const editProduct = async (req, res) => {
    try {

        const id = req.params.id;
        const body = req.body;
        const product = await Product.findById(id)
        if(!product) {
            failedResponse(res, 404, "product does not exist")
        }
        console.log(id)
        const updatedProduct = await Product.findByIdAndUpdate(id, body)
        successResponse(res, 200, "prodcut updated", updatedProduct)

    } catch(err) {
        errorResponse(res, err)
    }
}


export const deleteProduct = async (req, res) => {
    try {

        const id = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(id)
        successResponse(res, 200, "product deleted", deletedProduct)

    } catch(err) {
        errorResponse(res, err)
    }
}


export const getProducts = async (req, res)=>{
    try {
        const { sort, order, category, sku, q } = req.query
        const sortOptions = {}
        const orderNumber = 1
        if(order == "desc") {
            orderNumber = -1
        }
       if(sort) {
         if(sort == 'price') {
            sortOptions.price = orderNumber
        } else if (sort == 'category') {
            sortOptions.category = orderNumber
        }
       }
        const query = {};
        if(q) {
            query.$or = [
                {
                    name : {
                        $regex : q,
                        $options : "i"
                    }
                },
                {
                    description : {
                        $regex : q,
                        $options : "i"
                    }
                },
                {
                    category : {
                        $regex : q,
                        $options : "i"
                    }
                },
            ]
        }
        if(category) {
            query.category = category
        }
        if(sku) {
            query.sku = sku
        }
        const products = await Product
        .find(query)
        .sort(sortOptions)
        .populate("category")
        successResponse(res, 200, "products fetched successfully", products)
    } catch(err) {
        errorResponse(res, err)
    }
}

export const getProductById = async (req, res) => {
    try {

        const id = req.params.id;
    const product = await Product.findById(id).populate("category")
    if(!product) {
        failedResponse(res, 404, "product does not exist")
    }
    successResponse(res, 200, "product fetched", product)

    } catch(err) {
        errorResponse(res, err)
    }
}

