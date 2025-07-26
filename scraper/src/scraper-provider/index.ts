import { connect } from "puppeteer-real-browser";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";

const stealth = StealthPlugin();

enum SearchEngine {
  GOOGLE = "google.com",
  BING = "bing.com",
  DUCKDUCKGO = "duckduckgo.com",
  YAHOO = "search.yahoo.com",
}

export default class SERPScraper {
  private browser: any;
  private page: any;

  constructor() {
    this.launchBrowser();
  }

  async launchBrowser() {
    try {
      console.log("Launching browser...");
      const { browser, page } = await connect({
        headless: false, // Keep this false for visible browser
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-web-security",
          "--disable-features=IsolateOrigins,site-per-process",
          "--disable-dev-shm-usage",
          "--disable-extensions",
          "--disable-background-networking",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-breakpad",
          "--disable-client-side-phishing-detection",
          "--disable-component-update",
          "--disable-default-apps",
          "--disable-domain-reliability",
          "--disable-hang-monitor",
          "--disable-ipc-flooding-protection",
          "--disable-popup-blocking",
          // Browser visibility args
          "--start-maximized",
          "--window-position=0,0",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--no-first-run",
          "--no-default-browser-check",
          // Force display (useful for some environments)
          "--display=:0",
        ],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: true,
        ignoreAllFlags: false,
      });

      // Store both browser and page instances
      this.browser = browser;
      this.page = page;

      await this.page.setViewport({ width: 1280, height: 800 });
      await this.page.goto("https://google.com", { waitUntil: "networkidle2" });
      console.log("Browser launched successfully!");

      // Take a screenshot to verify it's working
      await this.page.screenshot({ path: "test-screenshot.png" });

      await page.locator("textarea").fill("I am trying something new 55555555");
      await page.keyboard.press("Enter");
      await this.page.screenshot({ path: "test-screenshot2.png" });

      // Fixed setTimeout usage
      setTimeout(async () => {
        await this.page.screenshot({ path: "test-screenshot3.png" });
      }, 5000); // Wait for 5 seconds to see the result
    } catch (error) {
      console.error("Error launching browser:", error);
    }
  }

  async closeBrowser() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        console.log("Browser closed successfully!");
      }
    } catch (error) {
      console.error("Error closing browser:", error);
    }
  }

  // Example search method
  async search(
    query: string,
    searchEngine: SearchEngine = SearchEngine.GOOGLE,
  ) {
    if (!this.page) {
      throw new Error("Browser not initialized. Call launchBrowser() first.");
    }

    try {
      await this.page.goto(`https://${searchEngine}`);

      // Wait for search input to be available
      await this.page.waitForSelector('textarea[name="q"], input[name="q"]');

      // Type the query
      const searchInput =
        (await this.page.$('textarea[name="q"]')) ||
        (await this.page.$('input[name="q"]'));
      await searchInput.type(query);

      // Press Enter to search
      await this.page.keyboard.press("Enter");

      // Wait for results to load
      await this.page.waitForNavigation({ waitUntil: "networkidle2" });

      console.log(`Search completed for: ${query}`);
    } catch (error) {
      console.error("Error during search:", error);
    }
  }
}
