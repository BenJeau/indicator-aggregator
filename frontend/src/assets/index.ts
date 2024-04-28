const backgrounds = [
  "/bgs/pavel-neznanov-EamEwfBKDNk-unsplash.jpg",
  "/bgs/photo-1545987796-b199d6abb1b4.jpg",
  "/bgs/nasa-Q1p7bh3SHj8-unsplash.jpg",
  "/bgs/mathew-schwartz-sb7RUrRMaC4-unsplash.jpg",
  "/bgs/mathew-schwartz-5RHbXOXNd5w-unsplash.jpg",
  "/bgs/frankie-lopez-NBiiX7aP0Yw-unsplash.jpg",
  "/bgs/alistair-macrobert-SCtlFdgTw1A-unsplash.jpg",
  "/bgs/tobias-fischer-PkbZahEG2Ng-unsplash.jpg",
];

export const getRandomBackground = () => {
  return backgrounds[Math.floor(Math.random() * backgrounds.length)];
};
