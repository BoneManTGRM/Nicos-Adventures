export const NICO_POSTER = "/assets/nico/video/court-v2/nico-basketball-poster.jpg";
const videoPath = "/assets/nico/video/court-v2/nico-basketball.mp4";
let clipUrl: Promise<string> | undefined;

// Both players share this five-second clip for the lifetime of the page.
// A self-contained media source lets WebKit seek without requesting byte ranges.
export function loadNicoBasketball(): Promise<string> {
  if (!clipUrl) {
    clipUrl = fetch(videoPath)
      .then(async response => {
        if (response.status !== 200 || !response.headers.get("content-type")?.startsWith("video/mp4")) {
          throw new Error("Basketball video unavailable");
        }
        const clip = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(clip);
        });
      })
      .catch(error => {
        clipUrl = undefined;
        throw error;
      });
  }
  return clipUrl;
}
