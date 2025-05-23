import { Request, Response } from "express";
import Order from "../models/order";
import Restaurant from "../models/restaurant";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import { BadRequestError } from "../errors/BadRequestError";

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate("restaurant")
      .populate("user")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new BadRequestError("Order not found");
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating order status" });
  }
};

export const getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurants = await Restaurant.find()
      .populate("user")
      .sort({ lastUpdated: -1 });
    res.json(restaurants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = imageUrl;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();

    res.status(201).send(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating restaurant" });
  }
};

export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      throw new BadRequestError("Restaurant not found");
    }

    if (req.file) {
      const imageUrl = await uploadImage(req.file);
      restaurant.imageUrl = imageUrl;
    }

    Object.assign(restaurant, req.body);
    restaurant.lastUpdated = new Date();
    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating restaurant" });
  }
};

export const deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      throw new BadRequestError("Restaurant not found");
    }

    await restaurant.deleteOne();
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting restaurant" });
  }
};

export default {
  getAllOrders,
  updateOrderStatus,
  getAllRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
}; 