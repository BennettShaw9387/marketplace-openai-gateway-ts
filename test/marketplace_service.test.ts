import test from "node:test";
import assert from "node:assert/strict";
import { chooseListing, listingBody } from "../src/marketplace_service.js";

test("buyer request selects the seller asset with the highest embedding score", () => {
  const first = { ...listingBody.parse({ sellerId: "s1", title: "RAG", description: "retrieval" }), embedding: [1, 0] };
  const second = { ...listingBody.parse({ sellerId: "s2", title: "Vision", description: "images" }), embedding: [0, 1] };
  assert.equal(chooseListing([first, second], [0.9, 0.1])?.sellerId, "s1");
});
