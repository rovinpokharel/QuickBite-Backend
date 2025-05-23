import express from "express";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse, checkRestaurantAdmin } from "../middleware/auth";
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
router.post(
  "/",
  jwtCheck,
  jwtParse,
  checkRestaurantAdmin,
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  MyRestaurantController.createMyRestaurant
);
router.put(
  "/",
  jwtCheck,
  jwtParse,
  checkRestaurantAdmin,
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  MyRestaurantController.updateMyRestaurant
);

// Restaurant admin specific routes
router.get(
  "/orders",
  jwtCheck,
  jwtParse,
  checkRestaurantAdmin,
  MyRestaurantController.getMyRestaurantOrders
);

router.patch(
  "/orders/:orderId",
  jwtCheck,
  jwtParse,
  checkRestaurantAdmin,
  MyRestaurantController.updateOrderStatus
);

export default router;
