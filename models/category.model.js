import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    image : String,
    description : String,
    status : {
        type : String,
        enum : ["active", "hidden"],
        default : "active"
    }
})

const Category = mongoose.model("Category", categorySchema)

export default Category;