import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

import bcrypt from "bcryptjs";

const userResolver = {
  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { username, name, password, gender } = input;

        if (!username || !name || !password || !gender) {
          throw new Error("All fields are required");
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
          throw new Error("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = new User({
          username,
          name,
          password: hashedPass,
          gender,
          profilePicture: gender === "male" ? boyProfilePic : girlProfilePic,
        });

        await newUser.save();
        await context.login(newUser);

        return newUser;
      } catch (error) {
        console.log("Error in signup: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;
        if (!username || !password) throw new Error("All fields are required");

        // Attempt to authenticate the user
        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });

        // If authentication is successful, log in the user
        await context.login(user);

        // Return the authenticated user
        return user;
      } catch (err) {
        // Handle authentication errors
        console.error("Error in login:", err);
        // If the error is related to authentication failure, return a specific error message
        if (err.name === "AuthenticationError") {
          throw new Error("Incorrect username or password");
        } else {
          // If the error is not related to authentication failure, return a generic error message
          throw new Error(err.message || "Internal server error");
        }
      }
    },
    logout: async (_, __, context) => {
      try {
        await context.logout();
        context.req.session.destroy((error) => {
          if (error) throw error;
        });
        context.res.clearCookie("connect.sid");
        return { message: "Logged out successfully" };
      } catch (error) {
        console.log("Error in logout: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
  },
  Query: {
    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (error) {
        console.log("Error in authUser: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.log("Error in user query: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
  },
  User: {
    transactions: async (parent, __, ___) => {
      try {
        const transactions = await Transaction.find({ userId: parent._id });
        return transactions;
      } catch (error) {
        console.log("Error in transactions resolver: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
  },
};

export default userResolver;
