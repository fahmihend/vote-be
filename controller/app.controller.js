const user = require("../models/users");
const bcrypt = require("bcrypt");
const auth = require("../auth/jwt");
const vote = require("../models/vote");
const controller = {};

controller.register = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await user.findOne({ username });
    if (existingUser) {
      return res
        .status(422)
        .json({ status: "Failed", message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      username,
      password: hashedPassword,
      role: role ?? "user",
      isVoted: false,
    });
    await newUser.save();
    res.status(200).json({
      status: "Success",
      message: "Successfully Registered",
      data: null,
    });
  } catch (e) {
    res.status(400).json({ status: "Failed", message: e.message });
  }
};

controller.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existed = await user.findOne({ username });
    if (!existed || !bcrypt.compare(password, existed.password)) {
      return res
        .status(422)
        .json({ status: "Failed", message: "Wrong password user not exist" });
    }
    const token = await auth.generateToken({
      username,
      role: existed.role,
      isVoted: existed.isVoted,
    });
    res.status(200).json({
      status: "Success",
      message: "Successfully Login",
      data: { token: token, role: existed.role, isVoted: existed.isVoted },
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", message: e.message });
  }
};

controller.userList = async (req, res) => {
  try {
    const users = await user.find();
    res.status(200).json({
      status: "Success",
      message: "Successfully get data",
      data: users,
    });
  } catch (e) {
    res.status(400).json({ status: "Failed", message: e.message });
  }
};

controller.addVote = async (req, res) => {
  const { name } = req.body;
  try {
    const auth = req.user;
    const userData = await user.findOne({username: auth.username})
    if (auth.role === "admin" || userData.isVoted === true) {
      const message =
        auth.role === "admin" ? `Admin can't vote` : `Can only vote once`;
      return res.status(400).json({ status: "Failed", message: message });
    }
    const votedList = await vote.findOne({name: name});
      const query = { name: name };
      const update = { $set: {count: votedList.count + 1} };
      const option = { upsert: true }
      await vote.updateOne(query, update, option);
      await user.updateOne({username: auth.username}, {$set: {isVoted: true}}, {})
    res.status(200).json({ status: "Success", message: "Successfully voted" });
  } catch (e) {
    res.status(400).json({ status: "Failed", message: e.message });
  }
};

controller.voteResult = async (req, res) => {
  try {
    const datas = await vote.find();
    res.status(200).json({
      status: "Success",
      message: "Successfully get vote data",
      data: datas,
    });
  } catch (e) {
    res.status(400).json({ status: "Failed", message: e.message });
  }
};

module.exports = controller;
