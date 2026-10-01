import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Missing or invalid token.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    if (typeof decoded === "string" || !decoded.sub) {
      return res.status(401).json({
        message: "Invalid token.",
      });
    }

    const userId = Number(decoded.sub);

    if (!Number.isInteger(userId)) {
      return res.status(401).json({
        message: "Invalid token.",
      });
    }

    const result = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User no longer exists.",
      });
    }

    req.user = result.rows[0];

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

export default authMiddleware;

