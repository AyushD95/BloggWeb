const { Router}=require("express");
const multer  = require('multer')
const router= Router();
const Blog=require("../models/blog");
const Comment = require("../models/comments");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');



// Set up Cloudinary storage using Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog_cover_images', // Folder name in your Cloudinary account
    allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file types
    public_id: (req, file) => `${req.user._id}/${Date.now()}-${file.originalname}` // Custom file name
  }
});

const upload = multer({ storage: storage });


router.get("/add-new", (req,res)=>{
    return res.render("addBlog",{user: req.user});
})

router.get("/:id", async (req,res)=>{
    const blog = await Blog.findById(req.params.id).populate("createdBy");;
    const comments= await Comment.find({ blogId:req.params.id }).populate("createdBy")

    res.render("blog",{
        user: req.user,
        blog,
        comments
    })
})


router.post("/", upload.single('coverImage'),async (req,res)=>{
    const { title,body} =req.body;

    const blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id,
      coverImageURL: req.file.path // Cloudinary URL
    });

    return res.redirect(`/blog/${blog._id}`);
})

router.post("/comment/:blogId",async (req,res)=>{

    await Comment.create({  
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id

  });

  return res.redirect(`/blog/${req.params.blogId}`)

})


module.exports=router;