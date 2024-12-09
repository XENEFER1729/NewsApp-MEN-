const mongoose=require("mongoose")

const userschema=mongoose.Schema({
    Fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String
    }
})

const User=mongoose.model("user",userschema)

module.exports=User