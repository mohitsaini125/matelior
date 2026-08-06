import Address from "../models/address.model.js"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"
import mongoose from "mongoose"

export const addAddress = async (req, res)=> {
    let session;
    try {
        const userId = req.user._id
        const { fullName, phone, addressLine1, addressLine2, city, country, pincode, addressType } = req.body
        if(!fullName || !phone || !addressLine1 || !city || !country || !pincode) {
            return failedResponse(res, 400, "Full name, phone, address line 1, city, country and pincode are required.")
        }
        const addresses = await Address.find({ user : userId })
        const isDefault = addresses.length === 0 || req.body.isDefault === true
        
        let address
        session = await mongoose.startSession()
        await session.withTransaction(async ()=> {
            if(isDefault && addresses.length) {
                await Address.findOneAndUpdate({ user : userId, isDefault : true }, { isDefault : false }, { session })
            }
            address = new Address({
                    user : req.user._id,
                    ...req.body,
                    isDefault
                })
            await address.save({ session })
        })
        return successResponse(res, 201, "Address added", address)

    } catch(err) {
        return errorResponse(res, err)
    } finally {
        if(session) {
            await session.endSession()
        }
    }
}

export const updateAddress = async (req, res)=>{
    try {
        const id = req.params.id
        const filter = {
            user : req.user._id,
            _id : id
        }
        if("isDefault" in req.body) {
            return failedResponse(res, 400, "Use the dedicated endpoint to change the default address.")
        }
        const updateData = {
            ...req.body
        }

        delete updateData.user;
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        if(Object.keys(req.body).length === 0) {
            return failedResponse(res, 400, "Update data not found in body.")
        }
        
        const address = await Address.findOne(filter)
        if(!address) {
            return failedResponse(res, 404, "Address not found.")
        }

        const updatedAddress = await Address.findOneAndUpdate(filter, updateData, { returnDocument : "after" })
        return successResponse(res, 200, "Address updated successfully.", updatedAddress)
    } catch(err) {
        return errorResponse(res, err)
    }
}

export const setAddressDefault = async (req, res)=> {
    let session
    try {
        
        const id = req.params.id
        const userId = req.user._id
        const currentDefaultFilter = { user : userId, isDefault : true }
        const targetAddressFilter = { user : userId, _id : id }
        const address = await Address.findOne(targetAddressFilter)   //the null argument is otherwise used to mention the fields to fetch
        if(!address) {
            return failedResponse(res, 404, "Address not found.")
        }
        if(address.isDefault) {
            return failedResponse(res, 409, "Address is already the default.")
        }
        
        session = await mongoose.startSession();

        let updatedAddress;
        await session.withTransaction(async ()=> {      //automatically commits on succeed and aborts on error
            await Address.findOneAndUpdate(currentDefaultFilter, { isDefault : false }, { session })
            updatedAddress = await Address.findOneAndUpdate(targetAddressFilter, { isDefault : true }, { returnDocument : "after", session })
        })
        return successResponse(res, 200, "Default address updated successfully.", updatedAddress)

    } catch(err) {
        return errorResponse(res, err)
    } finally {
        if(session) {
            await session.endSession()
        }
    }
}

export const deleteAddress = async (req, res)=> {
    try {
        const id = req.params.id
        const address = await Address.findOne({ user : req.user._id, _id : id })
        if(!address) {
            return failedResponse(res, 404, "Address not found.")
        }
        if(address.isDefault === true) {
            return failedResponse(res, 409, "Cannot delete the default address. Please set other address as default first.")
        }
        const deletedAddress = await Address.findOneAndDelete({ user : req.user._id, _id : id})
        return successResponse(res, 200, "Address deleted", deletedAddress)
    } catch(err) {
        return errorResponse(res, err)
    }
}

export const getAddress = async (req, res)=> {
    try {
        const userId = req.user._id
        const addresses = await Address.find({ user : userId })
        if(!addresses.length) {
            return failedResponse(res, 404, "Address not found.")
        }
        return successResponse(res, 200, "addresses fetched", addresses)
    } catch(err) {
        return errorResponse(res, err)
    }
}


export const getAddressById = async (req, res)=> {
    try {
        const id = req.params.id
        const address = await Address.findOne({ user : req.user._id, _id : id })
        if(!address) {
            return failedResponse(res, 404, "Address not found.")
        }
        return successResponse(res, 200, "address fetched", address)
    } catch(err) {
        return errorResponse(res, err)
    }
}