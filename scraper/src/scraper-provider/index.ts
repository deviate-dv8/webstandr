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
  ) {
    const results: SearchResult[] = [];
    try {
      if (searchEngine === SearchEngine.GOOGLE) {
        // Google search result preprocessing
        // Google search will always have div#rso which contains all the result
        // All divs inside div#rso is ranked by data-rpos={rank}
        // all data-rpos contains a tag with link
        // all data-rpos contains h3 for title
        // all data-rpos contains span for description
        await page.bringToFront();
        const rsoDiv = await page.$("#rso");
        if (!rsoDiv) {
          await page.bringToFront();
          const captcha = await page.$("form#captcha-form");
          if (captcha) {
            throw new Error("Captcha detected");
          }
          const searchDiv = await page.$("div#search");
          await page.bringToFront();
          if (searchDiv) {
            throw new Error("No results found in Google search.");
          } else {
            await page.screenshot({ path: "google_search_error.png" });
            throw new Error(
              "Might be blocked by Google, try using a different search engine.",
            );
          }
        }
        const resultElements = await rsoDiv?.$$("div[data-rpos]");
        let rank = 0;
        for (const element of resultElements) {
          const titleElement = await element.$("h3");
          const linkElement = await element.$("a");
          const descriptionElement = await element.$(
            "div[style='-webkit-line-clamp:2']",
          );

          if (titleElement && linkElement && descriptionElement) {
            const title = await titleElement.evaluate(
              (el) => el.textContent?.trim() || "",
            );
            const link = await linkElement.evaluate(
              (el) => el.getAttribute("href") || "",
            );
            const description = await descriptionElement.evaluate(
              (el) => el.textContent?.trim() || "",
            );
            rank++;
            const domain = new URL(link).hostname;
            const data = { title, link, description, rank, domain };
            results.push(data);
          }
        }
      } else if (searchEngine === SearchEngine.BING) {
        // Bing search result preprocessing
        // Bing search will always have ol#b_results which contains all the result
        // All li inside ol#b_results is classified by b_algo
        // all li contains a.tilk tag with link
        // all li contains hw for title
        // all datail contains p for description
        await page.bringToFront();
        const bResults = await page.$("ol#b_results");
        if (!bResults) {
          await page.screenshot({ path: "bing_search_error.png" });
          throw new Error(
            "Might be blocked by Bing, try using a different search engine.",
          );
        } else {
          await page.bringToFront();
          const b_no = await page.$("ol#b_results > li.b_no");
          if (b_no) {
            throw new Error("No results found in Bing search.");
          }
        }
        await page.bringToFront();
        const resultElements = await page.$$("li.b_algo");
        let rank = 0;
        for (const element of resultElements) {
          const titleElement = await element.$("h2");
          const linkElement = await element.$("a.tilk");
          const descriptionElement = await element.$("p");

          if (titleElement && linkElement && descriptionElement) {
            const title = await titleElement.evaluate(
              (el) => el.textContent?.trim() || "",
            );
            const link = await linkElement.evaluate(
              (el) => el.getAttribute("href") || "",
            );
            const description = await descriptionElement.evaluate(
              (el) => el.textContent?.trim() || "",
            );
            rank++;
            const domain = new URL(link).hostname;
            const data = { title, link, description, rank, domain };
            results.push(data);
          }
        }
      } else if (searchEngine === SearchEngine.DUCKDUCKGO) {
        // DuckDuckGo search result preprocessing
        // DuckDuckGo search will always have ol.react-results--main which contains all the result
        // All li inside ol.react-results--main is classified by data-layout="organic"
        // all li contains a tag with link classified by data-testid="result-extras-url-link"
        // all li contains h2 for title
        // all li contains a div[data-result="snippet"] span for description
        await page.bringToFront();
        const olElement = await page.$("ol.react-results--main");
        if (!olElement) {
          await page.bringToFront();
          const noResultFound = (await page.$$("b")).length == 1;
          if (noResultFound) {
            throw new Error("No results found in DuckDuckGo search.");
          } else {
            await page.screenshot({ path: "duckduckgo_search_error.png" });
            throw new Error(
              "Might be blocked by DuckDuckGo, try using a different search engine.",
            );
          }
        }
        const resultElements = await olElement?.$$("li[data-layout='organic']");
        let rank = 0;
        for (const element of resultElements || []) {
          const titleElement = await element.$("h2");
          const linkElement = await element.$(
            "a[data-testid='result-extras-url-link']",
          );
          const descriptionElement = await element.$(
            "div[data-result='snippet'] span",
          );
          if (titleElement && linkElement && descriptionElement) {
            const title = await titleElement.evaluate(
              (el) => el.textContent?.trim() || "",
            );
            const link = await linkElement.evaluate(
              (el) => el.getAttribute("href") || "",
            );
            const description = await descriptionElement.evaluate(
              (el) => el.textContent?.trim() || "",
            );
            rank++;
            const domain = new URL(link).hostname;
            const data = { title, link, description, rank, domain };
            results.push(data);
          }
        }
      } else if (searchEngine === SearchEngine.YAHOO) {
        // Yahoo search will always have ol.searchCenterMiddle which contains all the result
        // All li inside ol#reg_searchCenterMiddle contains all details
        // all li contains div.compTitle > a:first-child  tag with link
        // all li contains h3 for title
        // all details contains div.compText for description
        await page.bringToFront();
        const regSearchCenterMiddle = await page.$("ol.searchCenterMiddle");
        if (!regSearchCenterMiddle) {
          await page.bringToFront();
          const noResultFound = await page.$("ol.adultRegion");
          if (noResultFound) {
            throw new Error("No results found in Yahoo search.");
          } else {
            await page.screenshot({ path: "yahoo_search_error.png" });
            throw new Error(
              "Might be blocked by Yahoo, try using a different search engine.",
            );
          }
        }
        const resultElements = await regSearchCenterMiddle?.$$("li");
        let rank = 0;
        for (const element of resultElements) {
          const titleElement = await element.$("h3");
          const linkElement = await element.$("div.compTitle > a:first-child");
          const descriptionElement = await element.$("div.compText");

          if (titleElement && linkElement && descriptionElement) {
            const title = await titleElement.evaluate(
              (el) => el.textContent?.trim() || "",
            );
            const link = await linkElement.evaluate(
              (el) => el.getAttribute("href") || "",
            );
            const description = await descriptionElement.evaluate(
              (el) => el.textContent?.trim() || "",
            );
            rank++;
            const domain = new URL(link).hostname;
            const data = { title, link, description, rank, domain };
            results.push(data);
          }
        }
      } else {
        await page.close();
        throw new Error("Unsupported search engine");
      }
      return results;
    } catch (error) {
      await page.close();
      console.error("Error preprocessing page result:", error);
      throw error;
    }
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
