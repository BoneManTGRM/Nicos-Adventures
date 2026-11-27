export const NICO_POSTER = "/assets/nico/video/court-v2/nico-basketball-poster.jpg";
const videoPath = "/assets/nico/video/court-v2/nico-basketball.mp4";
let clipUrl: Promise<string> | undefined;

// Both players share this five-second clip for the lifetime of the page.
// A blob URL supports seeking even when the CDN returns a full file for a byte range.
export function loadNicoBasketball(): Promise<string> {
  if (!clipUrl) {
    clipUrl = fetch(videoPath)
      .then(async response => {
        if (response.status !== 200 || !response.headers.get("content-type")?.startsWith("video/mp4")) {
          throw new Error("Basketball video unavailable");
        }
        return URL.createObjectURL(await response.blob());
      })
      .catch(error => {
        clipUrl = undefined;
        throw error;
      });
  }
  return clipUrl;
}
