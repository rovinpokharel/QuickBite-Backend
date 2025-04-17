import express from "express";
import AdminController from "../controllers/AdminController";
import { jwtCheck, jwtParse, checkAdmin } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

// /api/admin
router.get("/orders", jwtCheck, jwtParse, checkAdmin, AdminController.getAllOrders);
router.patch("/orders/:orderId/status", jwtCheck, jwtParse, checkAdmin, AdminController.updateOrderStatus);

router.get("/restaurants", jwtCheck, jwtParse, checkAdmin, AdminController.getAllRestaurants);
router.post(
  "/restaurants",
  jwtCheck,
  jwtParse,
  checkAdmin,
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  AdminController.createRestaurant
);
router.put(
  "/restaurants/:restaurantId",
  jwtCheck,
  jwtParse,
  checkAdmin,
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  AdminController.updateRestaurant
);
router.delete("/restaurants/:restaurantId", jwtCheck, jwtParse, checkAdmin, AdminController.deleteRestaurant);

export default router; 