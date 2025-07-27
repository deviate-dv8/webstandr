import { connect } from "puppeteer-real-browser";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
import { Browser, Page } from "puppeteer";

const stealth = StealthPlugin();

export enum SearchEngine {
  GOOGLE = "https://google.com",
  BING = "https://bing.com",
  DUCKDUCKGO = "https://duckduckgo.com",
  YAHOO = "https://search.yahoo.com",
}

interface SearchResult {
  domain: string;
  title: string;
  link: string;
  description: string;
  rank: number;
}
export default class SERPScraper {
  private browser: Browser | null = null;
  constructor() {
    this.launchBrowser();
  }
  async launchBrowser() {
    try {
      console.log("Launching browser...");
      const { browser, page } = await connect({
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
        ],
        disableXvfb: false,
        plugins: [],
      });
      // Store both browser
      this.browser = browser as unknown as Browser;
      await page.setViewport({ width: 1280, height: 800 });
    } catch (error) {
      console.error("Error launching browser:", error);
    }
  }
  async closeBrowser() {
    try {
      await this.browser?.close();
      this.browser = null;
      console.log("Browser closed successfully!");
    } catch (error) {
      console.error("Error closing browser:", error);
    }
  }
  private async preprocessPageResult(
    page: Page,
    searchEngine: SearchEngine = SearchEngine.GOOGLE,
  ): Promise<SearchResult[]> {
    try {
      await page.bringToFront();

      switch (searchEngine) {
        case SearchEngine.GOOGLE:
          return await this.processGoogleResults(page);
        case SearchEngine.BING:
          return await this.processBingResults(page);
        case SearchEngine.DUCKDUCKGO:
          return await this.processDuckDuckGoResults(page);
        case SearchEngine.YAHOO:
          return await this.processYahooResults(page);
        default:
          throw new Error("Unsupported search engine");
      }
    } catch (error) {
      await page.close();
      console.error("Error preprocessing page result:", error);
      throw error;
    }
  }

  private async processGoogleResults(page: Page): Promise<SearchResult[]> {
    const rsoDiv = await page.$("#rso");
    if (!rsoDiv) {
      const captcha = await page.$("form#captcha-form");
      if (captcha) {
        throw new Error("Captcha detected");
      }

      const searchDiv = await page.$("div#search");
      if (searchDiv) {
        throw new Error("No results found in Google search.");
      } else {
        await page.screenshot({ path: "google_search_error.png" });
        throw new Error(
          "Might be blocked by Google, try using a different search engine.",
        );
      }
    }

    // Extract all data in a single page.evaluate call
    return await page.evaluate(() => {
      const results: SearchResult[] = [];
      const resultElements = document.querySelectorAll("#rso div[data-rpos]");

      resultElements.forEach((element, index) => {
        const titleElement = element.querySelector("h3");
        const linkElement = element.querySelector("a");
        const descriptionElement = element.querySelector(
          "div[style='-webkit-line-clamp:2']",
        );

        if (titleElement && linkElement && descriptionElement) {
          const title = titleElement.textContent?.trim() || "";
          const link = linkElement.getAttribute("href") || "";
          const description = descriptionElement.textContent?.trim() || "";

          if (title && link && description) {
            try {
              const domain = new URL(link).hostname;
              results.push({
                title,
                link,
                description,
                rank: index + 1,
                domain,
              });
            } catch (e) {
              // Skip invalid URLs
            }
          }
        }
      });

      return results;
    });
  }

  private async processBingResults(page: Page): Promise<SearchResult[]> {
    const bResults = await page.$("ol#b_results");
    if (!bResults) {
      await page.screenshot({ path: "bing_search_error.png" });
      throw new Error(
        "Might be blocked by Bing, try using a different search engine.",
      );
    }

    const noResults = await page.$("ol#b_results > li.b_no");
    if (noResults) {
      throw new Error("No results found in Bing search.");
    }

    return await page.evaluate(() => {
      const results: SearchResult[] = [];
      const resultElements = document.querySelectorAll("li.b_algo");

      resultElements.forEach((element, index) => {
        const titleElement = element.querySelector("h2");
        const linkElement = element.querySelector("a.tilk");
        const descriptionElement = element.querySelector("p");

        if (titleElement && linkElement && descriptionElement) {
          const title = titleElement.textContent?.trim() || "";
          const link = linkElement.getAttribute("href") || "";
          const description = descriptionElement.textContent?.trim() || "";

          if (title && link && description) {
            try {
              const domain = new URL(link).hostname;
              results.push({
                title,
                link,
                description,
                rank: index + 1,
                domain,
              });
            } catch (e) {
              // Skip invalid URLs
            }
          }
        }
      });

      return results;
    });
  }

  private async processDuckDuckGoResults(page: Page): Promise<SearchResult[]> {
    const olElement = await page.$("ol.react-results--main");
    if (!olElement) {
      const boldElements = await page.$$("b");
      if (boldElements.length === 1) {
        throw new Error("No results found in DuckDuckGo search.");
      } else {
        await page.screenshot({ path: "duckduckgo_search_error.png" });
        throw new Error(
          "Might be blocked by DuckDuckGo, try using a different search engine.",
        );
      }
    }

    return await page.evaluate(() => {
      const results: SearchResult[] = [];
      const resultElements = document.querySelectorAll(
        "ol.react-results--main li[data-layout='organic']",
      );

      resultElements.forEach((element, index) => {
        const titleElement = element.querySelector("h2");
        const linkElement = element.querySelector(
          "a[data-testid='result-extras-url-link']",
        );
        const descriptionElement = element.querySelector(
          "div[data-result='snippet'] span",
        );

        if (titleElement && linkElement && descriptionElement) {
          const title = titleElement.textContent?.trim() || "";
          const link = linkElement.getAttribute("href") || "";
          const description = descriptionElement.textContent?.trim() || "";

          if (title && link && description) {
            try {
              const domain = new URL(link).hostname;
              results.push({
                title,
                link,
                description,
                rank: index + 1,
                domain,
              });
            } catch (e) {
              // Skip invalid URLs
            }
          }
        }
      });

      return results;
    });
  }

  private async processYahooResults(page: Page): Promise<SearchResult[]> {
    const regSearchCenterMiddle = await page.$("ol.searchCenterMiddle");
    if (!regSearchCenterMiddle) {
      const noResults = await page.$("ol.adultRegion");
      if (noResults) {
        throw new Error("No results found in Yahoo search.");
      } else {
        await page.screenshot({ path: "yahoo_search_error.png" });
        throw new Error(
          "Might be blocked by Yahoo, try using a different search engine.",
        );
      }
    }

    return await page.evaluate(() => {
      const results: SearchResult[] = [];
      const resultElements = document.querySelectorAll(
        "ol.searchCenterMiddle li",
      );

      resultElements.forEach((element, index) => {
        const titleElement = element.querySelector("h3");
        const linkElement = element.querySelector(
          "div.compTitle > a:first-child",
        );
        const descriptionElement = element.querySelector("div.compText");

        if (titleElement && linkElement && descriptionElement) {
          const title = titleElement.textContent?.trim() || "";
          const link = linkElement.getAttribute("href") || "";
          const description = descriptionElement.textContent?.trim() || "";

          if (title && link && description) {
            try {
              const domain = new URL(link).hostname;
              results.push({
                title,
                link,
                description,
                rank: index + 1,
                domain,
              });
            } catch (e) {
              // Skip invalid URLs
            }
          }
        }
      });

      return results;
    });
  }
  private async urlQueryProvider(
    query: string,
    searchEngine: SearchEngine = SearchEngine.GOOGLE,
  ): Promise<string> {
    switch (searchEngine) {
      case SearchEngine.GOOGLE:
        return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      case SearchEngine.BING:
        return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      case SearchEngine.DUCKDUCKGO:
        return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
      case SearchEngine.YAHOO:
        return `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
      default:
        throw new Error("Unsupported search engine");
    }
  }
  // Example search method
  async search(
    query: string,
    searchEngine: SearchEngine = SearchEngine.GOOGLE,
  ): Promise<SearchResult[] | undefined> {
    if (!this.browser) {
      await this.launchBrowser();
      console.log("Browser not launched yet, launching now...");
      return this.search(query, searchEngine);
    }
    let page: Page | null = null;
    try {
      page = await this.browser?.newPage();
      if (!page) {
        throw new Error("Failed to create a new page.");
      }
      const url = await this.urlQueryProvider(query, searchEngine);
      await page.goto(url, { waitUntil: "load" });
      const results = await this.preprocessPageResult(page, searchEngine);
      if (!page.isClosed()) {
        await page.close();
      }
      console.log("results:", results);
      return results;
    } catch (error) {
      if (!page?.isClosed()) {
        await page?.close();
      }
      console.error("Error during search:", error);
      throw error;
    }
  }
}
