import Address from "../models/address.model.js"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"

export const addAddress = async (req, res)=> {
    try {
        const userId = req.user._id
        const { fullName, phone, addressLine1, addressLine2, city, country, pincode, addressType, isDefault } = req.body
        if(!fullName || !phone || !addressLine1 || !city || !country || !pincode) {
            failedResponse(res, 400, "Missing fileds")
        }
        const address = await Address.create({
            user : req.user._id,
            ...req.body
        })
        successResponse(res, 201, "address added", address)
    } catch(err) {
        errorResponse(res, err)
    }
}

export const updateAddress = async (req, res)=>{
    try {
        const id = req.params.id
        const address = await Address.findById(id)
        if(!address) {
            failedResponse(res, 200, "address does not exist")
        }
        const updatedAddress = await Address.findByIdAndUpdate(id, req.body, { returnDocument : "after" })
        successResponse(res, 200, "address updated", updatedAddress)
    } catch(err) {
        errorResponse(res, err)
    }
}

export const deleteAddress = async (req, res)=> {
    try {
        const id = req.params.id
        const address = await Address.findById(id)
        if(!address) {
            failedResponse(res, 200, "address does not exist")
        }
        const deletedAddress = await Address.findByIdAndDelete(id)
        successResponse(res, 200, "address deleted", deletedAddress)
    } catch(err) {
        errorResponse(res, errr)
    }
}

export const getAddress = async (req, res)=> {
    try {
        const userId = await req.user._id
        const address = await Address.findOne({ user : userId })
        if(!address) {
            failedResponse(res, 200, "address does not exist")
        }
        const addresses = await Address.find({ user : userId })
        successResponse(res, 200, "addresses fetched", addresses)
    } catch(err) {
        errorResponse(res, errr)
    }
}


export const getAddressById = async (req, res)=> {
    try {
        const id = req.params.id
        const address = await Address.findById(id)
        if(!address) {
            failedResponse(res, 200, "address does not exist")
        }
        successResponse(res, 200, "address fetched", address)
    } catch(err) {
        errorResponse(res, errr)
    }
}