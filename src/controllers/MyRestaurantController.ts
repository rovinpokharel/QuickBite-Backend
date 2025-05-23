import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/order";

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      res.status(404).json({ message: "restaurant not found" });
      return;
    }
    res.json(restaurant);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    if (!req.isRestaurantAdmin) {
      res.status(403).json({ message: "Unauthorized: Restaurant admin access required" });
      return;
    }

    const existingRestaurant = await Restaurant.findOne({ user: req.userId });

    if (existingRestaurant) {
      res.status(409).json({ message: "User restaurant already exists" });
      return;
    }

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = imageUrl;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();

    res.status(201).send(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({
      user: req.userId,
    });

    if (!restaurant) {
      res.status(404).json({ message: "restaurant not found" });
      return;
    }

    if (!req.isRestaurantAdmin) {
      res.status(403).json({ message: "Unauthorized: Restaurant admin access required" });
      return;
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    res.status(200).send(restaurant);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getMyRestaurantOrders = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      res.status(404).json({ message: "restaurant not found" });
      return;
    }

    if (!req.isRestaurantAdmin) {
      res.status(403).json({ message: "Unauthorized: Restaurant admin access required" });
      return;
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    if (!req.isRestaurantAdmin || !order.restaurant || order.restaurant.toString() !== restaurant._id.toString()) {
      res.status(403).json({ message: "Unauthorized: Restaurant admin access required" });
      return;
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
  getMyRestaurantOrders,
  updateOrderStatus,
};
