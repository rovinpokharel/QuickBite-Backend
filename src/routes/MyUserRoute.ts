import express from "express";
// import { createCurrentUser } from "../controllers/MyUserController";
import MyUserController from "../controllers/MyUserController";

const router = express.Router();

router.post("/", MyUserController.createCurrentUser);

export default router;