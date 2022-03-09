const app = require("../../app");
const request = require("supertest");
const mongoose = require("mongoose");

beforeAll((done) => {
  done();
});

afterAll((done) => {
  // Closing the DB connection allows Jest to exit successfully.
  mongoose.connection.close();
  done();
});

describe("login", () => {
  it("no credentials", async () => {
    const response = await request(app).post("/users/login").send({});

    expect(response.statusCode).toEqual(404);
  });

  it("invalid username", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ username: "", password: "" });

    expect(response.statusCode).toEqual(404);
  });

  it("invalid password", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ username: "newuser123", password: "wrongpassword" });

    expect(response.statusCode).toEqual(400);
  });

  it("valid credentials", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ username: "newuser123", password: "123" });

    expect(response.statusCode).toEqual(200);
  });
});

describe("logout", () => {
  it("can logout when logged in", async () => {
    const loginResponse = await request(app)
      .post("/users/login")
      .send({ username: "newuser123", password: "123" });

    const logoutResponse = await request(app)
      .post("/users/logout")
      .set({ Authorization: loginResponse._body.accessToken });

    expect(logoutResponse.statusCode).toEqual(200);
  });

  it("can't logout when not logged in", async () => {
    const loginResponse = await request(app)
      .post("/users/login")
      .send({ username: "newuser123", password: "123" });

    const logoutResponse = await request(app)
      .post("/users/logout")
      .set({ Authorization: loginResponse._body.accessToken });

    const secondLogoutResponse = await request(app)
      .post("/users/logout")
      .set({ Authorization: loginResponse._body.accessToken });

    expect(secondLogoutResponse.statusCode).toEqual(403); //403 as token no longer valid. see ValidateToken middleware
  });
});
