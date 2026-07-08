import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        minlength : 2,
        set : (value)=>{
            return value?.trim()
        }
    },
    email : {
        type : String,
        required : true,
        minlength : 5,
        set : (value)=>{
            return value?.trim()
        }
    },
    password : {
        type : String,
        minlength : 6,
        required : true,
        set : (value)=>{
            return value?.trim()
        }
    },
    role : {
        type : String,
        required : true,
        enum : ["admin", "customer"]
    }
})

const User = mongoose.model("User", userSchema);

export default User;