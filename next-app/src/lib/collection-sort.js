function releaseDate(movie) {
  return movie.release_date || "";
}

export function sortCollectionEntries(entries, sort) {
  const result = [...entries];
  switch (sort) {
    case "oldest-added":
      return result.sort((a, b) => a.addedAt.localeCompare(b.addedAt));
    case "release-newest":
      return result.sort((a, b) => releaseDate(b.movie).localeCompare(releaseDate(a.movie)));
    case "release-oldest":
      return result.sort((a, b) => releaseDate(a.movie).localeCompare(releaseDate(b.movie)));
    case "popularity":
      return result.sort(
        (a, b) => Number(b.movie.popularity || 0) - Number(a.movie.popularity || 0),
      );
    default:
      return result.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }
}
