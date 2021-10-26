require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
//connect db
const connectDB = require("./db/connect");
//routes
const authRouter = require("./routes/authRouts");
const userRouter = require("./routes/userRouts");

//file upload to cloud
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
// middleWare 
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler")

//json responce
app.use(express.json());

app.use(fileUpload({useTempFiles:true}));

app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
//routers
app.use("/api/v2/auth", authRouter);
app.use("/api/v2/users", userRouter);

//error handle middlewares:
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

//db and server conection
const port = process.env.PORT || 5000;
const start = async ()=>{
    try {
        await connectDB(process.env.MONGO_DB);
        app.listen(port,()=>{
            console.log(`Server runing on port ${port}`)
        })
    } catch (error) {
        console.log(error)
    }
}
start();