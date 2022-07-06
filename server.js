const express =require('express');
const mongoose =require('mongoose');
const bodyParser =require("body-parser");
const passport =require("passport");


const users=require("./routes/api/users");
const app=express();

// BodyParser middleware

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// DB config
const db =require("./config/keys").mongoURI;


// connect to MongoDB
mongoose.connect(db,{
    useNewUrlParser:true
}).then(()=>console.log("successfully"))
.catch(err=>console.log(err));

// passport middleware 
app.use(passport.initialize());
// passport config
require("./config/passport")(passport);
// router
app.use("/api/users",users);


const port =process.env.PORT || 5000;

app.listen(port,()=>console.log(`server up running ${port}`));