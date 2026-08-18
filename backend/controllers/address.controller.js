import Address from "../models/address.model.js";
import { errorResponse, failedResponse, successResponse } from "../utils/response.js";
import mongoose from "mongoose";

function formatAddress(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    const pin = obj.pincode || obj.postalCode || "";
    obj.pincode = pin;
    obj.postalCode = pin;
    return obj;
}

export const addAddress = async (req, res) => {
    let session;
    try {
        const userId = req.user._id;
        const body = req.body || {};
        const fullName = body.fullName?.trim();
        const phone = body.phone?.trim();
        const addressLine1 = body.addressLine1?.trim();
        const addressLine2 = body.addressLine2?.trim() || "";
        const city = body.city?.trim();
        const state = body.state?.trim() || "Default State";
        const country = body.country?.trim() || "India";
        const pincode = (body.pincode || body.postalCode || "").trim();
        const addressType = body.addressType || "home";

        if (!fullName || !phone || !addressLine1 || !city || !pincode) {
            return failedResponse(res, 400, "Full name, phone, address, city, and postal code are required.");
        }

        const addresses = await Address.find({ user: userId });
        const isDefault = addresses.length === 0 || body.isDefault === true;

        session = await mongoose.startSession();
        let savedAddress;

        await session.withTransaction(async () => {
            if (isDefault && addresses.length) {
                await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false }, { session });
            }
            const address = new Address({
                user: userId,
                fullName,
                phone,
                addressLine1,
                addressLine2,
                city,
                state,
                country,
                pincode,
                addressType,
                isDefault,
            });
            savedAddress = await address.save({ session });
        });

        return successResponse(res, 201, "Address added", formatAddress(savedAddress));
    } catch (err) {
        console.error("addAddress error:", err);
        return errorResponse(res, err);
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

export const updateAddress = async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { user: req.user._id, _id: id };
        const body = req.body || {};

        if (body.postalCode && !body.pincode) {
            body.pincode = body.postalCode;
        }

        const updateData = { ...body };
        delete updateData.user;
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const updatedAddress = await Address.findOneAndUpdate(filter, updateData, { new: true });
        if (!updatedAddress) {
            return failedResponse(res, 404, "Address not found.");
        }

        return successResponse(res, 200, "Address updated successfully.", formatAddress(updatedAddress));
    } catch (err) {
        console.error("updateAddress error:", err);
        return errorResponse(res, err);
    }
};

export const setAddressDefault = async (req, res) => {
    let session;
    try {
        const id = req.params.id;
        const userId = req.user._id;
        const targetAddress = await Address.findOne({ user: userId, _id: id });

        if (!targetAddress) {
            return failedResponse(res, 404, "Address not found.");
        }

        session = await mongoose.startSession();
        let updatedAddress;

        await session.withTransaction(async () => {
            await Address.updateMany({ user: userId }, { isDefault: false }, { session });
            updatedAddress = await Address.findOneAndUpdate(
                { user: userId, _id: id },
                { isDefault: true },
                { new: true, session }
            );
        });

        return successResponse(res, 200, "Default address updated successfully.", formatAddress(updatedAddress));
    } catch (err) {
        console.error("setAddressDefault error:", err);
        return errorResponse(res, err);
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const id = req.params.id;
        const address = await Address.findOne({ user: req.user._id, _id: id });
        if (!address) {
            return failedResponse(res, 404, "Address not found.");
        }

        const deletedAddress = await Address.findOneAndDelete({ user: req.user._id, _id: id });
        return successResponse(res, 200, "Address deleted", formatAddress(deletedAddress));
    } catch (err) {
        console.error("deleteAddress error:", err);
        return errorResponse(res, err);
    }
};

export const getAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
        const formatted = addresses.map(formatAddress);
        return successResponse(res, 200, "addresses fetched", formatted);
    } catch (err) {
        console.error("getAddress error:", err);
        return errorResponse(res, err);
    }
};

export const getAddressById = async (req, res) => {
    try {
        const id = req.params.id;
        const address = await Address.findOne({ user: req.user._id, _id: id });
        if (!address) {
            return failedResponse(res, 404, "Address not found.");
        }
        return successResponse(res, 200, "address fetched", formatAddress(address));
    } catch (err) {
        console.error("getAddressById error:", err);
        return errorResponse(res, err);
    }
};