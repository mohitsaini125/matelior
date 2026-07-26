import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"
import categoryRouter from "./routes/category.routes.js"
import cartRouter from "./routes/cart.routes.js"
dotenv.config();

const server = express();

server.use(express.json())
server.use("/user", userRouter);
server.use("/product", productRouter)
server.use("/category", categoryRouter)
server.use("/cart",cartRouter)


mongoose.connect(process.env.dbURL).then(()=>{
    server.listen(3000, ()=>{
        console.log("server listening at port 3000")
    })
})


