import request from "supertest";
import app from "../src/app.js";

test("Unknown route should return 404", async () => {
  const res = await request(app).get("/this-route-does-not-exist");
  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Route not found");
});
