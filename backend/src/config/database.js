require('dotenv').config();
const mongoose=require('mongoose');
const dbCredentials=process.env.DB;

const connectDB=async()=>{
    try{
        await mongoose.connect(dbCredentials,{

        });
        console.log('MongoDB connected');
    }
    catch(err){
        console.error(err.message);
        throw err;

    }
}
module.exports=connectDB;