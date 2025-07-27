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

interface SearchTask {
  query: string;
  searchEngine: SearchEngine;
  resolve: (results: SearchResult[]) => void;
  reject: (error: Error) => void;
  id: string;
}

interface TabPool {
  page: Page;
  busy: boolean;
  lastUsed: number;
}

export default class SERPScraper {
  private browser: Browser | null = null;
  private tabPool: TabPool[] = [];
  private taskQueue: SearchTask[] = [];
  private maxTabs: number;
  private maxQueueSize: number;
  private processingQueue: boolean = false;
  private tabIdleTimeout: number = 300000; // 5 minutes

  constructor(maxTabs: number = 1000, maxQueueSize: number = 1000) {
    this.maxTabs = maxTabs;
    this.maxQueueSize = maxQueueSize;
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
        disableXvfb: process.env.NODE_ENV === "development",
        plugins: [],
      });

      this.browser = browser as unknown as Browser;
      await page.setViewport({ width: 1280, height: 800 });

      // Initialize the first tab in the pool
      this.tabPool.push({
        page: page as unknown as Page,
        busy: false,
        lastUsed: Date.now(),
      });

      // Start idle tab cleanup
      this.startIdleTabCleanup();
    } catch (error) {
      console.error("Error launching browser:", error);
    }
  }

  private startIdleTabCleanup() {
    setInterval(async () => {
      const now = Date.now();
      const idleTabs = this.tabPool.filter(
        (tab) => !tab.busy && now - tab.lastUsed > this.tabIdleTimeout,
      );

      // Keep at least 1 tab, close excess idle tabs
      if (this.tabPool.length > 1 && idleTabs.length > 0) {
        const tabsToClose = idleTabs.slice(0, idleTabs.length - 1);

        for (const tab of tabsToClose) {
          try {
            await tab.page.close();
            this.tabPool = this.tabPool.filter((t) => t !== tab);
            console.log(`Closed idle tab. Pool size: ${this.tabPool.length}`);
          } catch (error) {
            console.error("Error closing idle tab:", error);
          }
        }
      }
    }, 60000); // Check every minute
  }

  private async getAvailableTab(): Promise<TabPool> {
    // Try to find an available tab
    let availableTab = this.tabPool.find((tab) => !tab.busy);

    if (!availableTab && this.tabPool.length < this.maxTabs) {
      // Create new tab if under limit
      try {
        const page = await this.browser!.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        const newTab: TabPool = {
          page,
          busy: false,
          lastUsed: Date.now(),
        };

        this.tabPool.push(newTab);
        availableTab = newTab;
        console.log(`Created new tab. Pool size: ${this.tabPool.length}`);
      } catch (error) {
        console.error("Error creating new tab:", error);
        throw error;
      }
    }

    if (!availableTab) {
      // Wait for a tab to become available
      return new Promise((resolve) => {
        const checkAvailability = () => {
          const tab = this.tabPool.find((t) => !t.busy);
          if (tab) {
            resolve(tab);
          } else {
            setTimeout(checkAvailability, 100);
          }
        };
        checkAvailability();
      });
    }

    return availableTab;
  }

  private async processQueue() {
    if (this.processingQueue || this.taskQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;

      try {
        const tab = await this.getAvailableTab();
        tab.busy = true;
        tab.lastUsed = Date.now();

        console.log(
          `Processing task ${task.id}. Queue length: ${this.taskQueue.length}`,
        );

        // Process the search in background
        this.executeSearch(tab, task).finally(() => {
          tab.busy = false;
          tab.lastUsed = Date.now();
        });
      } catch (error) {
        task.reject(error as Error);
      }
    }

    this.processingQueue = false;
  }

  private async executeSearch(tab: TabPool, task: SearchTask) {
    try {
      const url = await this.urlQueryProvider(task.query, task.searchEngine);
      await tab.page.goto(url, { waitUntil: "load" });
      const results = await this.preprocessPageResult(
        tab.page,
        task.searchEngine,
      );
      task.resolve(results);
    } catch (error) {
      task.reject(error as Error);
    }
  }

  // Public search method - adds to queue
  async search(
    query: string,
    searchEngine: SearchEngine = SearchEngine.GOOGLE,
  ): Promise<SearchResult[]> {
    if (!this.browser) {
      await this.launchBrowser();
      return this.search(query, searchEngine);
    }

    if (this.taskQueue.length >= this.maxQueueSize) {
      throw new Error(
        `Queue is full. Maximum queue size: ${this.maxQueueSize}`,
      );
    }

    return new Promise<SearchResult[]>((resolve, reject) => {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const task: SearchTask = {
        query,
        searchEngine,
        resolve,
        reject,
        id: taskId,
      };

      this.taskQueue.push(task);
      console.log(
        `Added task ${taskId} to queue. Queue length: ${this.taskQueue.length}`,
      );

      // Start processing if not already processing
      this.processQueue();
    });
  }

  // Get queue and pool status
  getStatus() {
    return {
      queueLength: this.taskQueue.length,
      totalTabs: this.tabPool.length,
      busyTabs: this.tabPool.filter((tab) => tab.busy).length,
      availableTabs: this.tabPool.filter((tab) => !tab.busy).length,
      maxTabs: this.maxTabs,
      maxQueueSize: this.maxQueueSize,
    };
  }

  async closeBrowser() {
    try {
      // Clear the queue
      this.taskQueue.forEach((task) => {
        task.reject(new Error("Browser is closing"));
      });
      this.taskQueue = [];

      // Close all tabs
      for (const tab of this.tabPool) {
        try {
          await tab.page.close();
        } catch (error) {
          console.error("Error closing tab:", error);
        }
      }
      this.tabPool = [];

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

    return await page.evaluate(() => {
      const results: SearchResult[] = [];
      const resultElements = document.querySelectorAll("#rso div[data-rpos]");
      let rank = 1;

      resultElements.forEach((element) => {
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
                rank: rank++,
                domain,
              });
            } catch (e) {
              // Skip invalid URLs but don't increment rank
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
      let rank = 1;

      resultElements.forEach((element) => {
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
                rank: rank++,
                domain,
              });
            } catch (e) {
              // Skip invalid URLs but don't increment rank
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
      let rank = 1;

      resultElements.forEach((element) => {
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
                rank: rank++,
                domain,
              });
            } catch (e) {
              // Skip invalid URLs but don't increment rank
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
      let rank = 1;

      resultElements.forEach((element) => {
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
                rank: rank++,
                domain,
              });
            } catch (e) {
              // Skip invalid URLs but don't increment rank
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
}
