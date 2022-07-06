const express =require('express');
const router=express.Router();
const bcrypt=require("bcryptjs");
const jwt =require("jsonwebtoken");
const keys =require("../../config/keys");

// Load input Validation

const validateRegisterInput=require("../../validation/register");
const validateLoginInput=require("../../validation/login");

// Load user model
const User =require("../../models/User");



// @router post api/users/register
// @desc Register user
// @access public

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
    // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(400).json({ email: "Email already exists" });
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
  // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    });
  });



// @route post api/user/login
// @desc Login user and return JWT token
// @access Public

router.post("/login",(req,res)=>{
    const {errors,isValid}=validateLoginInput(req.body);

    // check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const email =req.body.email;
    const password =req.body.password;

    // find user by email
    User.findOne({email}).then(user=>{
        // check if user exists
        if(!user){
            return res.status(404).json({emailnotfound:"Email not found"});
        }

        // check password
        bcrypt.compare(password,user.password).then(isMatch=>{
            if(isMatch){
                // user ethod create JWT payload

                const payload={
                    id:user.id,
                    name:user.name  
                };

                // sign token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {
                        expiresIn: 31556926 // 1 year in seconds
                    },
                    (err,token)=>{
                        res.json({
                            success:true,
                            token:"bearer"+token
                        });
                    }
                );
            }else{
                return res.status(400).json({passwordincorrect:"Password inCorrect"});
            }
        });
    });
});


module.exports =router;