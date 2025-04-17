import express from "express";
import MyRestaurantController from "../controllers/MyRestaurantController";
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

// /api/my/restaurant
router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);
router.get("/orders", jwtCheck, jwtParse, checkAdmin, MyRestaurantController.getMyRestaurantOrders);
router.patch("/order/:orderId/status", jwtCheck, jwtParse, checkAdmin, MyRestaurantController.updateOrderStatus);
router.post(
  "/",
  jwtCheck,
  jwtParse,
  checkAdmin,
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  MyRestaurantController.createMyRestaurant
);
router.put(
  "/",
  jwtCheck,
  jwtParse,
  checkAdmin,
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  MyRestaurantController.updateMyRestaurant
);

export default router;
