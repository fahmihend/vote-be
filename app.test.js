// tests/api.test.js
const request = require("supertest");
const app = require("./main");
const User = require("./models/users");
const Vote = require("./models/vote");
const auth = require("./auth/jwt");

describe("API Tests", () => {
  it("should add a new user (admin only) return error if username is existed", async () => {
    const token = await auth.generateToken({
      username: "admin",
      role: "admin",
      isVoted: false,
    });
    const response = await request(app)
      .post("/register")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "newuser", password: "newuserpassword", role: "user" });
    const newUser = await User.findOne({ username: "newuser" });
    if (newUser) {
      expect(response.status).toBe(422);
      const newUser = await User.findOne({ username: "newuser" });
      expect(response.body.message).toBe("User already exists.");
      expect(newUser).toBeTruthy();
      expect(newUser.role).toBe("user");
    } else {
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Successfully Registered");
      const newUser = await User.findOne({ username: "newuser" });
      expect(newUser).toBeTruthy();
      expect(newUser.role).toBe("user");
    }
  }, 10000);
  it("should not add a new user if not an admin", async () => {
    const token = await auth.generateToken({
      username: "user",
      role: "user",
      isVoted: false,
    });
    const response = await request(app)
      .post("/register")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "newuser", password: "newuserpassword", role: "user" });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Access denied. Only admin users are allowed."
    );
  }, 10000);
  it("should return error when user not found", async () => {
    const data = {
      username: "admin123",
      password: "admin",
    };
    const response = await request(app).post("/login").send(data);
    expect(response.status).toBe(422);
    expect(response.body.message).toBe("User not exist");
  }, 10000);
  it("should return error when password not match", async () => {
    const data = {
      username: "admin",
      password: "1231231231",
    };
    const response = await request(app).post("/login").send(data);
    expect(response.status).toBe(422);
    expect(response.body.message).toBe("Wrong password");
  }, 10000);
  it("should logged in", async () => {
    const data = {
      username: "admin",
      password: "admin",
    };
    const response = await request(app).post("/login").send(data);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Successfully Login");
    expect(response.body.data.token).toBeTruthy();
  });
  it("should get data user", async () => {
    const token = await auth.generateToken({
      username: "admin",
      role: "admin",
      isVoted: false,
    });
    const response = await request(app)
      .post("/user-list")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Successfully get data");
    expect(response.body.data).toBeTruthy();
  });
  it("should return error when not admin access api get data users", async () => {
    const token = await auth.generateToken({
      username: "user",
      role: "user",
      isVoted: false,
    });
    const response = await request(app)
      .post("/user-list")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Access denied. Only admin users are allowed."
    );
  });
  it("should return error when token not provided", async () => {
    const response = await request(app).post("/user-list").send();
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token not provided");
  });
  it("should get votes result", async () => {
    const token = await auth.generateToken({
      username: "admin",
      role: "admin",
      isVoted: false,
    });
    const response = await request(app)
      .post("/result-vote")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Successfully get vote data");
    expect(response.body.data).toBeTruthy();
  });
  it("should return error when not admin access api get data votes result", async () => {
    const token = await auth.generateToken({
      username: "user",
      role: "user",
      isVoted: false,
    });
    const response = await request(app)
      .post("/result-vote")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Access denied. Only admin users are allowed."
    );
  });
  it("should return error when token not provided", async () => {
    const response = await request(app).post("/user-list").send();
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token not provided");
  });
  it("should return error when admin add vote", async () => {
    const token = await auth.generateToken({
      username: "admin",
      role: "admin",
      isVoted: false,
    });
    const response = await request(app)
      .post("/add-vote")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "newuser" });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe(`Admin can't vote`);
  });
  it("should return error when isVoted is true", async () => {
    const token = await auth.generateToken({
      username: "user",
      role: "user",
      isVoted: true,
    });
    const response = await request(app)
      .post("/add-vote")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "newuser" });
    expect(response.status).toBe(422);
    expect(response.body.message).toBe(`Can only vote once`);
  });
  it("should successfully add vote", async () => {
    let userData = await User.findOne({isVoted: false, role: 'user'})
    const randomUsername = Math.random().toString(36).substring(2,7);
    if (!userData) {
      const data = {
        username: randomUsername,
        password: 'user',
        role: 'user',
        isVoted: false,
      };
      await User.create(data)
      userData = data;
    }
    const token = await auth.generateToken({
      username: userData.username,
      role: userData.role,
      isVoted: false,
    });
    const response = await request(app)
      .post("/add-vote")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "newuser" });
      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Successfully voted")
  });
});
