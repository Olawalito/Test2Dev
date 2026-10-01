import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const {name, email, password } = req.body;

  if(!name || !email || !password){
    return res.status(400).json({
          message: "Name, email or password are required",
    });
  }

  if(password.length < 8 ){
    return res.status(400).json({
        message: "Password must be at least 8 characters",
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users(name, email, password_hash)
    VALUES($1, $2, $3)
    RETURNING id, name, email, created_at`,
    [name, email, hashedPassword]
  );

  res.status(201).json({
  message: "User registered successfully",
  user: result.rows[0]
  })
  } catch (error: any) {
    if(error.code === "23505"){
    res.status(401).json({
      message: "Email already exists"
    })}

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
  
});

router.post("/login", async(req,res) => {
  try{
    const { email, password} = req.body;

    if(!email || !password){
      return res.status(400).json({
        message: "Email and password are required",
      })
    };

    const result = await pool.query(
      `SELECT id, name, email, password_hash
      FROM users 
      WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0){
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches){
      return res.status(401).json({
        message: "Invalid email or password",
      })
    };

    const token = jwt.sign(
      {
        sub: user.id.toString(),
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    )

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }
  catch(error){
    console.error(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
