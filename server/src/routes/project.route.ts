import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import requireProjectRole from "../middleware/projectRole.middleware.js";
import pool from "../config/db.js";

const router = Router();

router.post(
    "/", authMiddleware, async(req, res) =>{
        const client = await pool.connect();

        try{
            const { name } = req.body;
            
            if(!name){
                return res.status(400).json({
                    message: "Project name is required",
                });
            }

            await client.query("BEGIN");

            const projectResult = await client.query(
                `INSERT INTO projects (name, owner_id)
                VALUES ($1, $2)
                RETURNING id, name, owner_id`,
                [name, req.user!.id]
            );

            const project = projectResult.rows[0];

            await client.query(
                `INSERT INTO project_members (user_id, project_id, role)
                VALUES ($1, $2, $3)`,
                [req.user!.id, project.id, "owner"]
            );
            
            await client.query("COMMIT");

            return res.status(201).json({
                message: "Project created successfully",
                project
            })
        }
        catch(error){
            await client.query("ROLLBACK");

            console.error(error);

            return res.status(500).json({
                message: "Something went wrong",
            });
        } finally {
            client.release();
        }
    });

router.get(
    "/:projectId/developer-area",
    authMiddleware, requireProjectRole("owner", "developer"),
    (req,res) => {
        res.json({
            message: "You have developer-level access to this project",
            user: req.user,
            projectId: req.params.projectId
        });
    }
);

export default router;