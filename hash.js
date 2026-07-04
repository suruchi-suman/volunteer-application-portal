import bcrypt from "bcrypt";
const saltRounds = 10;
const password = "hehehe"
bcrypt.hash(password, saltRounds, (err,result)=>{
    if(err){
        console.log(err);
    } else {
        console.log(result);
    }
})