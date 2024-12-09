const express = require("express");
const app = express();
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const cors = require("cors");


// Imports
require("./db/Connection");
const Users = require("./models/Users");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to the News App API");
});

app.post("/api/register", async (req, res) => { 
  try {
    const { Fullname, email, password } = req.body;

    if (!Fullname || !email || !password) {
      return res.status(400).send("Please fill all required fields");
    }

    const isAlreadyExists = await Users.findOne({ email });
    if (isAlreadyExists) {
      return res.status(409).send("User already exists");
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new Users({ Fullname, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send("User created successfully");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Please fill all required fields");
    }

    const isAlreadyExists = await Users.findOne({ email });
    if (!isAlreadyExists) {
      return res.status(401).send("Invalid credentials");
    }

    const validateUser = await bcryptjs.compare(password, isAlreadyExists.password);
    if (!validateUser) {
      return res.status(401).send("Invalid credentials");
    }

    const jwtSecretKey = process.env.JWT_SECRET_KEY || "this_is_a_jwt_secrete_key";
    const payload = {
      userid: isAlreadyExists.id,
      email: isAlreadyExists.email,
    };

    jsonwebtoken.sign(payload, jwtSecretKey, { expiresIn: 84600 }, async (err, token) => {
      if (err) {
        return res.status(500).send("Error generating token");
      }

      await Users.updateOne(
        { _id: isAlreadyExists.id },
        { $set: { token } }
      );
      isAlreadyExists.save();
      res.status(200).json({ user: isAlreadyExists, token });
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Internal server error");
  }
});

// app.get("/api/allusers", async (req, res) => {
//   try {
//     const users = await Users.find();
//     const usersData = await Promise.all(users.map(async (user) => {
//       return { user: { email: user.email, Fullname: user.Fullname }, userid: user.userid };
//     }));
//     res.status(200).json(usersData);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error fetching users");
//   }
// });


// Start the server
app.listen(8000,()=>{
    console.log("running backend");
})