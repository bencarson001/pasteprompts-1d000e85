/**
 * Google AdSense configuration.
 *
 * To go live with monetisation:
 *  1. Create/approve your site in Google AdSense (https://adsense.google.com).
 *  2. Put your publisher ID below (looks like "ca-pub-1234567890123456").
 *  3. Replace the slot IDs with the ad units you create in AdSense.
 *  4. Update public/ads.txt with the same publisher number.
 *
 * Until ADSENSE_CLIENT is set, ad slots render nothing (no layout shift),
 * so the site stays clean and fast before approval.
 */
export const ADSENSE_CLIENT = "ca-pub-3809061959162534";

export const AD_SLOTS = {
  inFeed: "0000000000",
  inArticle: "1111111111",
  sidebar: "2222222222",
} as const;

export const adsEnabled = () => ADSENSE_CLIENT.startsWith("ca-pub-");
