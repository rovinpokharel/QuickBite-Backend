import { Request, Response } from "express";
import User from "../models/user";

const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });
    if (!currentUser) {
      // return res.status(404).json({ message: "User not found" });
      res.status(404).json({ message: "User not found" });
    }

    res.json(currentUser);
  } catch (error) {
    console.log(error);
    // return res.status(500).json({ message: "Something went wrong" });
    res.status(500).json({ message: "Something went wrong" });
  }
};

const createCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { auth0Id } = req.body;
      //Check if the user exists
      const existingUser = await User.findOne({ auth0Id });
  
      if (existingUser) {
        // return res.status(200).send();
        res.status(200).send();
      }
      //Create the user if user doesnot exists
      const newUser = new User(req.body);
      await newUser.save();
  
      //Return the user object to the calling client
      res.status(201).json(newUser.toObject());
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error creating user" });
    }
  };

  const updateCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, addressLine1, country, city } = req.body;
      const user = await User.findById(req.userId);
  
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
        // res.status(404).json({ message: "User not found" });
      }
  
      user.name = name;
      user.addressLine1 = addressLine1;
      user.city = city;
      user.country = country;
  
      await user.save();
  
      res.send(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating user" });
    }
  };

  export default {
    getCurrentUser,
    createCurrentUser,
    updateCurrentUser,
  };