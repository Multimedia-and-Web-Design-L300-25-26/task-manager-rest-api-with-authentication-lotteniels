import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {

    // 1. Get Authorization header
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 5. Attach user to request
    req.user = user;

    // 6. Continue
    next();

  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;