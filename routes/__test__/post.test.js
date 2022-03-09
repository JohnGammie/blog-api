const app = require("../../app");
const request = require("supertest");
const mongoose = require("mongoose");

let loginResponse = "";

beforeAll(async () => {
  loginResponse = await request(app)
    .post("/users/login")
    .send({ username: "newuser123", password: "123" })
    .timeout(5000);

  // Delete the posts and comments table of the test DB. Simple way to have clean database
  if (mongoose.connection.db.databaseName == "blog-api-tests") {
    mongoose.connection.db.dropCollection("posts", function (err, result) {});
    mongoose.connection.db.dropCollection(
      "comments",
      function (err, result) {}
    );
  }
});

afterAll((done) => {
  // Closing the DB connection allows Jest to exit successfully.
  mongoose.connection.close();
  done();
});

describe("Add new post", () => {
  it("Create new post, valid input", async () => {
    const response = await request(app)
      .post("/post/create")
      .set({ Authorization: loginResponse._body.accessToken })
      .send({
        author: "Billy Bob",
        title: "Another blog post",
        content: "Today's post is bringing great news to fans of javascript!",
      });

    expect(response.statusCode).toEqual(200);
  });
});

describe("/post/list/public", () => {
  it("Find no publish posts", async () => {
    const response = await request(app).get("/post/list/public");

    expect(response.statusCode).toEqual(200);
    expect(response._body.posts.length).toEqual(0);
  });
});

describe("/post/list/protected", () => {
  it("attempt unauthenticated", async () => {
    const response = await request(app).get("/post/list/protected");

    expect(response.statusCode).toEqual(401);
  });

  it("returns the posts", async () => {
    const response = await request(app)
      .get("/post/list/protected")
      .set({ authorization: loginResponse._body.accessToken });

    expect(response.statusCode).toEqual(200);
    expect(response._body.posts.length).toEqual(1);
  });
});

describe("Publish a created post", () => {
  it("", async () => {
    const createResponse = await request(app)
      .post("/post/create")
      .set({ Authorization: loginResponse._body.accessToken })
      .send({
        author: "Test author",
        title: "Test title",
        content: "Test content",
      });

    let postId = (
      await mongoose.connection.db
        .collection("posts")
        .findOne({ author: "Test author" })
    )._id;

    const publishResponse = await request(app)
      .put("/post/publish?_id=" + postId)
      .set({ authorization: loginResponse._body.accessToken });

    expect(publishResponse.statusCode).toEqual(200);

    let isPostPublished = (
      await mongoose.connection.db
        .collection("posts")
        .findOne({ author: "Test author" })
    ).published;

    expect(isPostPublished).toEqual(true);
  });
});

describe("Add a comment to an existing post", () => {
  it("Add a comment", async () => {
    const createResponse = await request(app)
      .post("/post/create")
      .set({ Authorization: loginResponse._body.accessToken })
      .send({
        author: "Test author for a new comment",
        title: "Test title for a new comment",
        content: "Test content for a new comment",
      });

    const idPost = (
      await mongoose.connection.db
        .collection("posts")
        .findOne({ author: "Test author for a new comment" })
    )._id;

    const commentResponse = await request(app).post("/post/comment").send({
      username: "Test comment user",
      content: "Test comment!",
      postId: idPost,
    });

    expect(commentResponse.statusCode).toEqual(200);
  });
});

describe("Retrieve posts by id", () => {
  it("valid id", async () => {
    const createResponse = await request(app)
      .post("/post/create")
      .set({ Authorization: loginResponse._body.accessToken })
      .send({
        author: "Test author for a new comment",
        title: "Test title for a new comment",
        content: "Test content for a new comment",
      });

    const idPost = (
      await mongoose.connection.db
        .collection("posts")
        .findOne({ author: "Test author for a new comment" })
    )._id;

    const findResponse = await request(app).get(
      "/post/postDetails/" + idPost.toString()
    );

    expect(findResponse.statusCode).toEqual(200);
    expect(findResponse._body.post._id).toEqual(idPost.toString());
  });

  it("invalid id", async () => {
    const response = await request(app).get("/post/postDetails/" + "junkID");

    expect(response.statusCode).toEqual(404);
  });
});
