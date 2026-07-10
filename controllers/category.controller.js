import Category from "../models/category.model.js"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"

export const addCategory = async (req, res)=> {
    try {
        const body = req.body
        if(!body?.name) {
            failedResponse(res, 400, "required fields are missing")
        }
        const newCategory = await Category.create(body)
        successResponse(res, 201, "new category added", newCategory)
    } catch(err) {
        errorResponse(res, err)
    }
}

export const editCategory = async (req, res)=> {
    try {
        const body = req.body
        const id = req.params.id
        const category = await Category.findById(id)
        if(!category) {
            failedResponse(res, 404, "category does not exist")
        }
        const updatedCategory = await category.findByIdAndUpdate(id,body)
        successResponse(res, 200, "category updated", updatedCategory)
    } catch(err) {
        errorResponse(res, err)
    }
}

export const deleteCategory = async (req, res)=> {
    try {
        const id = req.params.id
        const category = await Category.findById(id)
        if(!category) {
            failedResponse(res, 404, "category does not exist")
        }
        const deletedCategory = await category.deleteOne()
        successResponse(res, 200, "category deleted", deletedCategory)
    } catch(err) {
        errorResponse(res, err)
    }
}

export const getCategory = async (req, res)=> {
    try {
        const { name, q, status, sort, order } = req.query
        const query = {}
        const sortOptions = {}
        const sortNumber = 1
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
                }
            ]
        }
        if(name) {
            query.name = name
        }
        if(status) {
            query.status = status
        }
        if(order == "desc") {
            sortNumber = -1
        }
        if(sort) {
            if(sort == "name") {
                sortOptions.name = sortNumber
            }
        }
        const categories = await Category.find(query).sort(sortOptions)
        successResponse(res, 200, "fetched categories", categories)
    } catch(err) {
        errorResponse(res, err)
    }
}

export const getCategoryById = async (req, res)=>{
    try {
        const id = req.params.id
        const category = await Category.findById(id)
        if(!category) {
            failedResponse(res, 404, "category not found")
        }
        successResponse(res, 200, "category found", category)
    } catch(err) {
        errorResponse(res, err)
    }
}