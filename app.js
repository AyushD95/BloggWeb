require('dotenv').config()
const express = require("express");
const path = require("path");
const userRoute=require('./routes/user')
const blogRoute=require('./routes/blog')

const mongoose=require("mongoose")
const cookieParser=require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
const User = require("./models/user");
const Blog = require("./models/blog");


const app = express();
const port = process.env.PORT || 8000;


mongoose.connect("mongodb+srv://ayushdahiwale95:CLuw5sV4d5LkJuUv@cluster0.sx3dy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then((e)=>{ console.log("Mongo DB connected")})  

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve("./public")));


app.get("/",async (req,res)=>{
    
   const allBlogs= await Blog.find({})
    
    res.render("home",{
        user: req.user,
        blogs:allBlogs
    });
});

app.use('/user',userRoute)
app.use('/blog',blogRoute)

app.listen(port, () => console.log(`Server started at port ${port}!`))