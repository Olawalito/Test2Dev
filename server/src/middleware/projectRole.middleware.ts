import type { Request, Response, NextFunction } from "express";
import pool from "../config/db.js";

type ProjectRole = "owner" | "pm" | "developer" | "tester";

const requireProjectRole = (...allowedRoles : ProjectRole[]) => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try{
            if(!req.user){
                return res.status(401).json({
                    message: "Authentication required",
                })
            }

            const projectId = Number(req.params.projectId);

            if(!Number.isInteger(projectId)){
                return res.status(401).json({
                    message: "Invalid projectId"
                })
            }

            const result = await pool.query(`SELECT role from project_members WHERE user_id = $1 AND project_id = $2`, [req.user.id,projectId]);

            if (result.rows.length === 0){
                return res.status(403).json({
                    message: "You are not a member of this project"
                })
            }

            const userRole = result.rows[0].role as ProjectRole;

            if (!allowedRoles.includes(userRole)){
                return res.status(403).json({
                    message: "You do not have the permission to perform this action",

                });
            }

            next();
        }
         catch(error){
            res.status(500).json({
                message: "Something went wrong"
            });
         };
    };
};

export default requireProjectRole;