const { Router}=require("express");
const multer  = require('multer')
const path =require("path")
const router= Router();
const fs = require('fs');
const Blog=require("../models/blog");
const Comment = require("../models/comments");



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    
    const uploadPath =  path.resolve(`./public/uploads/${req.user._id}`)
      
    // Check if the directory exists; if not, create it
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });  // recursive: true ensures parent directories are created
      }

      cb(null, uploadPath)
    
    },
    filename: function (req, file, cb) {
      const fileName= `${Date.now()}-${file.originalname}`
      cb(null, fileName)
    }
  })


  const upload = multer({ storage: storage })


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

   const blog= await Blog.create({
     body,
     title,
     createdBy: req.user._id,
     coverImageURL: `/uploads/${req.user._id}/${req.file.filename}`
    })

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