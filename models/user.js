const {Schema,model}= require("mongoose")
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/auth");

const userSchema= new Schema({

fullName:{
    type:String,
    require: true
},
email:{
    type:String,
    require: true,
    unique: true
},
salt:{
    type:String,
    require: true,
},
password:{
    type:String,
    require: true,
},

profileImageURL:{
    type: String,
    default: "/images/default.png"
},

role:{
    type: String,
    enum:["USER","ADMIN"],
    default: "USER"
}

},{ timestamps: true}
);


userSchema.pre('save', function(next) {
    const user = this;
    if(!user.isModified("password") )  return;

    const salt=randomBytes(16).toString();
    const hashedPassword=createHmac('sha256', salt)
    .update(user.password)
    .digest("hex");
     
    this.salt=salt;
    this.password=hashedPassword
    next();
  });


  userSchema.static("checkPasswordAndGenerateToken", async function(email,password) {

    const user=await this.findOne({email})

    if(!user) throw new Error("User Not Fond");
    
    
    const salt=user.salt;
    const userHashedPassword=user.password;

    const generatedHashedPassword=createHmac('sha256', salt)
    .update(password)
    .digest("hex");

    if(generatedHashedPassword!==userHashedPassword) 
        throw new Error("Incorrect Password")
    
   const token= createTokenForUser(user)
  return token;

  });





const User= model("user",userSchema);

module.exports=User;