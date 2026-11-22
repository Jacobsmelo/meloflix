import assert from "node:assert/strict";
import test from "node:test";
import { sortCollectionEntries } from "../src/lib/collection-sort.js";

const entries = [
  {
    movie: { id: 1, release_date: "2020-05-01", popularity: 12 },
    addedAt: "2025-02-01T10:00:00.000Z",
  },
  {
    movie: { id: 2, release_date: "1998-06-01", popularity: 50 },
    addedAt: "2025-01-01T10:00:00.000Z",
  },
  {
    movie: { id: 3, release_date: "2024-01-01", popularity: 30 },
    addedAt: "2025-03-01T10:00:00.000Z",
  },
];

test("watchlist sort options order additions, release dates, and popularity", () => {
  assert.deepEqual(
    sortCollectionEntries(entries, "recently-added").map((entry) => entry.movie.id),
    [3, 1, 2],
  );
  assert.deepEqual(
    sortCollectionEntries(entries, "oldest-added").map((entry) => entry.movie.id),
    [2, 1, 3],
  );
  assert.deepEqual(
    sortCollectionEntries(entries, "release-newest").map((entry) => entry.movie.id),
    [3, 1, 2],
  );
  assert.deepEqual(
    sortCollectionEntries(entries, "release-oldest").map((entry) => entry.movie.id),
    [2, 1, 3],
  );
  assert.deepEqual(
    sortCollectionEntries(entries, "popularity").map((entry) => entry.movie.id),
    [2, 3, 1],
  );
});
