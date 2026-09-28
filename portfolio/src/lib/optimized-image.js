import images from "./optimized-images.json";

// Unknown/uploaded assets retain their original URL until an optimized copy exists.
export function optimizedImage(src) {
  return images[src] || src;
}
