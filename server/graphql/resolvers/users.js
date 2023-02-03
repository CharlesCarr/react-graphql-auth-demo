const User = require("../../models/User");
const { ApolloError } = require("apollo-server-errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config();

module.exports = {
  Mutation: {
    async registerUser(_, { registerInput: { username, email, password } }) {
      // See user w/ that email already exists
      const existingUser = await User.findOne({ email });

      // Throw err if that email is already used
      if (existingUser) {
        throw new ApolloError(
          "A user is already registered with that email" + email,
          "USER_ALREADY_EXISTS"
        );
      }

      // Encrypt password
      var encryptedPassword = await bcrypt.hash(password, 10);

      // Build out mongoose model
      const newUser = new User({
        username,
        email: email.toLowerCase(),
        password: encryptedPassword,
      });

      // Create our JWT (attach to User model)
      const token = jwt.sign(
        { user_id: newUser._id, email },
        process.env.JWT_PRIVATE_KEY,
        {
          expiresIn: "2h",
        }
      );
      newUser.token = token;

      // Save our user in MongoDB
      const res = await newUser.save();

      return {
        id: res.id,
        ...res._doc,
      };
    },
    async loginUser(_, { loginInput: { email, password } }) {
      // See if user exists with email
      const user = await User.findOne({ email });

      // Check if entered password equals the encrypted password
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create a NEW token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.JWT_PRIVATE_KEY,
          {
            expiresIn: "2h",
          }
        );
        // Attach token to user model that we found above
        user.token = token;

        return {
          id: user.id,
          ...user._doc,
        };
      } else {
        // If user doesnt exist, return err
        throw new ApolloError("Incorrect password", "INCORRECT_PASSWORD");
      }
    },
  },
  Query: {
    user: (_, { ID }) => User.findById(ID),
  },
};
