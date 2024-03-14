const express = require("express");
const router = express.Router();
const zod = require('zod');
const jwt = require('jsonwebtoken')
const { User, Account } = require('../db');
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");




const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string()
})


router.get("/", (req, res) => {
  res.status(200).json({ message: "hello from user router" });
});



router.post('/signup', async (req, res) => {
  
  const {success} = signupBody.safeParse(req.body);

  if(!success){
    return res.status(411).json({
      message: "Incorrect inputs"
    })
  }

  const existingUser = await User.findOne({
    username: req.body.username
  })

  if(existingUser){
    return res.status(411).json({
      message: "Email already taken"
    })
  }

  const user = await User.create({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
  })

  const userId = user._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  })


  const token = jwt.sign({userId}, JWT_SECRET);

  res.json({
    message: "User Created successfully",
    token: token
  })
})



const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
})

router.post('/signin', async (req, res) => {
 
  const {success} = signinBody  .safeParse(req.body);

  if(!success){
    return res.status(411).json({
      message: "Incorrect inputs"
    })
  }

  const validUser = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  })

  if(validUser){
    const token = jwt.sign({userId: validUser._id}, JWT_SECRET);
    return res.json({
      message: "welcome to the portal",
      token: token
    })
  }

  res.status(404).json({
    message: "Email/password in incorrect"
  })
})




const updateBody = zod.object({
  username: zod.string(),
  firstName: zod.string(),
  lastName: zod.string()
})

router.put('/', authMiddleware, async(req, res) => {

  const {success} = updateBody.safeParse(req.body);

  if(!success){
    return res.status(411).json({
      message: "Error while updating information"
    })
  }

  await User.updateOne({_id: req.userId}, req.body);

  res.json({
    message: "Updated successfully"
  })

})


router.get('/bulk', async (req, res) => {
  
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [{
      firstName: {
        "$regex" :filter
      }
    }, {
      lastName: {
        "$regex": filter
      }
    }]
  })

    res.json({
      user: users.map(user => ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id
      }))
    })

  })




module.exports = router;