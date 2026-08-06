import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"
import categoryRouter from "./routes/category.routes.js"
import cartRouter from "./routes/cart.routes.js"
import wishlistRouter from "./routes/wishlist.routes.js"
import addressRouter from "./routes/address.routes.js"
import orderRouter from "./routes/order.routes.js"
dotenv.config();

const server = express();

server.use(express.json())
server.use("/user", userRouter);
server.use("/product", productRouter)
server.use("/category", categoryRouter)
server.use("/cart",cartRouter)
server.use("/wishlist", wishlistRouter)
server.use("/address", addressRouter)
server.use("/order", orderRouter)

mongoose.connect(process.env.dbURL).then(()=>{
    server.listen(3000, ()=>{
        console.log("server listening at port 3000")
    })
})


