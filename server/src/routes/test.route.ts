import { Router} from "express";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get("/protected", authMiddleware, (req, res) =>{
    res.json({
        message: "You have access to this protected route",
        user: req.user
    });
});

export default router;