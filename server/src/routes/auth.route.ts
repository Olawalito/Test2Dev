import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const router = Router();

router.post("/register", async (req, res) => {
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

  console.log("Name:", name);
  console.log("Email:", email);
  res.json(
    {
        message: "registration route works"
    });
});

export default router;
