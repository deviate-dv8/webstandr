"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchEngine = void 0;
const puppeteer_real_browser_1 = require("puppeteer-real-browser");
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const stealth = (0, puppeteer_extra_plugin_stealth_1.default)();
var SearchEngine;
(function (SearchEngine) {
    SearchEngine["GOOGLE"] = "https://google.com";
    SearchEngine["BING"] = "https://bing.com";
    SearchEngine["DUCKDUCKGO"] = "https://duckduckgo.com";
    SearchEngine["YAHOO"] = "https://search.yahoo.com";
})(SearchEngine || (exports.SearchEngine = SearchEngine = {}));
class SERPScraper {
    constructor(maxTabs = 1000, maxQueueSize = 1000) {
        this.browser = null;
        this.tabPool = [];
        this.taskQueue = [];
        this.processingQueue = false;
        this.tabIdleTimeout = 5000;
        this.maxTabs = maxTabs;
        this.maxQueueSize = maxQueueSize;
        this.launchBrowser();
    }
    launchBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Launching browser...");
                const { browser, page } = yield (0, puppeteer_real_browser_1.connect)({
                    headless: false,
                    args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-blink-features=AutomationControlled",
                    ],
                    disableXvfb: process.env.NODE_ENV === "development",
                    plugins: [],
                });
                this.browser = browser;
                yield page.setViewport({ width: 1280, height: 800 });
                // Initialize the first tab in the pool
                this.tabPool.push({
                    page: page,
                    busy: false,
                    lastUsed: Date.now(),
                });
                // Start idle tab cleanup
                this.startIdleTabCleanup();
            }
            catch (error) {
                console.error("Error launching browser:", error);
            }
        });
    }
    startIdleTabCleanup() {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            const idleTabs = this.tabPool.filter((tab) => !tab.busy && now - tab.lastUsed > this.tabIdleTimeout);
            // Keep at least 1 tab, close excess idle tabs
            if (this.tabPool.length > 1 && idleTabs.length > 0) {
                const tabsToClose = idleTabs.slice(0, idleTabs.length - 1);
                for (const tab of tabsToClose) {
                    try {
                        yield tab.page.close();
                        this.tabPool = this.tabPool.filter((t) => t !== tab);
                        console.log(`Closed idle tab. Pool size: ${this.tabPool.length}`);
                    }
                    catch (error) {
                        console.error("Error closing idle tab:", error);
                    }
                }
            }
        }), 60000); // Check every minute
    }
    getAvailableTab() {
        return __awaiter(this, void 0, void 0, function* () {
            // Try to find an available tab
            let availableTab = this.tabPool.find((tab) => !tab.busy);
            if (!availableTab && this.tabPool.length < this.maxTabs) {
                // Create new tab if under limit
                try {
                    const page = yield this.browser.newPage();
                    yield page.setViewport({ width: 1280, height: 800 });
                    const newTab = {
                        page,
                        busy: false,
                        lastUsed: Date.now(),
                    };
                    this.tabPool.push(newTab);
                    availableTab = newTab;
                    console.log(`Created new tab. Pool size: ${this.tabPool.length}`);
                }
                catch (error) {
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
                        }
                        else {
                            setTimeout(checkAvailability, 100);
                        }
                    };
                    checkAvailability();
                });
            }
            return availableTab;
        });
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.processingQueue || this.taskQueue.length === 0) {
                return;
            }
            this.processingQueue = true;
            while (this.taskQueue.length > 0) {
                // Remove cancelled tasks from queue
                const validTasks = this.taskQueue.filter((task) => !task.cancelled);
                const cancelledTasks = this.taskQueue.filter((task) => task.cancelled);
                // Clean up cancelled tasks
                cancelledTasks.forEach((task) => {
                    task.reject(new Error("Request cancelled"));
                });
                this.taskQueue = validTasks;
                if (this.taskQueue.length === 0) {
                    break;
                }
                const task = this.taskQueue.shift();
                // Double-check if task was cancelled while waiting
                if (task.cancelled) {
                    task.reject(new Error("Request cancelled"));
                    continue;
                }
                try {
                    const tab = yield this.getAvailableTab();
                    // Check again after getting tab (in case cancelled while waiting)
                    if (task.cancelled) {
                        task.reject(new Error("Request cancelled"));
                        continue;
                    }
                    tab.busy = true;
                    tab.lastUsed = Date.now();
                    console.log(`Processing task ${task.id}. Queue length: ${this.taskQueue.length}`);
                    // Process the search in background
                    this.executeSearch(tab, task).finally(() => {
                        tab.busy = false;
                        tab.lastUsed = Date.now();
                    });
                }
                catch (error) {
                    if (!task.cancelled) {
                        task.reject(error);
                    }
                }
            }
            this.processingQueue = false;
        });
    }
    executeSearch(tab, task) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if cancelled before starting
                if (task.cancelled || task.abortController.signal.aborted) {
                    throw new Error("Request cancelled");
                }
                const url = yield this.urlQueryProvider(task.query, task.searchEngine);
                // Check if cancelled before navigation
                if (task.cancelled || task.abortController.signal.aborted) {
                    throw new Error("Request cancelled");
                }
                // Navigate with timeout and abort signal awareness
                yield Promise.race([
                    tab.page.goto(url, { waitUntil: "load" }),
                    new Promise((_, reject) => {
                        task.abortController.signal.addEventListener("abort", () => {
                            reject(new Error("Request cancelled"));
                        });
                    }),
                ]);
                // Check if cancelled after navigation
                if (task.cancelled || task.abortController.signal.aborted) {
                    throw new Error("Request cancelled");
                }
                const results = yield this.preprocessPageResult(tab.page, task.searchEngine);
                // Final check before resolving
                if (task.cancelled || task.abortController.signal.aborted) {
                    throw new Error("Request cancelled");
                }
                task.resolve(results);
            }
            catch (error) {
                if (!task.cancelled) {
                    task.reject(error);
                }
            }
        });
    }
    // Public search method - adds to queue and returns cancellable promise
    search(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, searchEngine = SearchEngine.GOOGLE) {
            if (!this.browser) {
                yield this.launchBrowser();
                return this.search(query, searchEngine);
            }
            if (this.taskQueue.length >= this.maxQueueSize) {
                throw new Error(`Queue is full. Maximum queue size: ${this.maxQueueSize}`);
            }
            const abortController = new AbortController();
            const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const searchPromise = new Promise((resolve, reject) => {
                const task = {
                    query,
                    searchEngine,
                    resolve,
                    reject,
                    id: taskId,
                    abortController,
                    cancelled: false,
                };
                this.taskQueue.push(task);
                console.log(`Added task ${taskId} to queue. Queue length: ${this.taskQueue.length}`);
                // Start processing if not already processing
                this.processQueue();
            });
            const cancel = () => {
                // Find and mark task as cancelled
                const task = this.taskQueue.find((t) => t.id === taskId);
                if (task) {
                    task.cancelled = true;
                    task.abortController.abort();
                    console.log(`Cancelled task ${taskId}`);
                }
            };
            return {
                promise: searchPromise,
                cancel,
            };
        });
    }
    // Convenience method for backward compatibility
    searchSimple(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, searchEngine = SearchEngine.GOOGLE) {
            const { promise } = yield this.search(query, searchEngine);
            return promise;
        });
    }
    // Cancel all pending requests
    cancelAllRequests() {
        const cancelledCount = this.taskQueue.length;
        this.taskQueue.forEach((task) => {
            task.cancelled = true;
            task.abortController.abort();
            task.reject(new Error("All requests cancelled"));
        });
        this.taskQueue = [];
        console.log(`Cancelled ${cancelledCount} pending requests`);
        return cancelledCount;
    }
    // Cancel requests by search engine
    cancelRequestsByEngine(searchEngine) {
        const tasksToCancel = this.taskQueue.filter((task) => task.searchEngine === searchEngine);
        tasksToCancel.forEach((task) => {
            task.cancelled = true;
            task.abortController.abort();
            task.reject(new Error(`Requests for ${searchEngine} cancelled`));
        });
        this.taskQueue = this.taskQueue.filter((task) => task.searchEngine !== searchEngine);
        console.log(`Cancelled ${tasksToCancel.length} requests for ${searchEngine}`);
        return tasksToCancel.length;
    }
    // Get queue and pool status
    getStatus() {
        const activeTasks = this.taskQueue.filter((task) => !task.cancelled);
        const cancelledTasks = this.taskQueue.filter((task) => task.cancelled);
        return {
            queueLength: activeTasks.length,
            cancelledInQueue: cancelledTasks.length,
            totalTabs: this.tabPool.length,
            busyTabs: this.tabPool.filter((tab) => tab.busy).length,
            availableTabs: this.tabPool.filter((tab) => !tab.busy).length,
            maxTabs: this.maxTabs,
            maxQueueSize: this.maxQueueSize,
        };
    }
    closeBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Cancel and clear the queue
                const cancelledCount = this.cancelAllRequests();
                console.log(`Cancelled ${cancelledCount} pending requests during browser close`);
                // Close all tabs
                for (const tab of this.tabPool) {
                    try {
                        if (!tab.page.isClosed()) {
                            yield tab.page.close();
                        }
                    }
                    catch (error) {
                        console.error("Error closing tab:", error);
                    }
                }
                this.tabPool = [];
                yield ((_a = this.browser) === null || _a === void 0 ? void 0 : _a.close());
                this.browser = null;
                console.log("Browser closed successfully!");
            }
            catch (error) {
                console.error("Error closing browser:", error);
            }
        });
    }
    preprocessPageResult(page_1) {
        return __awaiter(this, arguments, void 0, function* (page, searchEngine = SearchEngine.GOOGLE) {
            try {
                yield page.bringToFront();
                switch (searchEngine) {
                    case SearchEngine.GOOGLE:
                        return yield this.processGoogleResults(page);
                    case SearchEngine.BING:
                        return yield this.processBingResults(page);
                    case SearchEngine.DUCKDUCKGO:
                        return yield this.processDuckDuckGoResults(page);
                    case SearchEngine.YAHOO:
                        return yield this.processYahooResults(page);
                    default:
                        throw new Error("Unsupported search engine");
                }
            }
            catch (error) {
                console.error("Error preprocessing page result:", error);
                throw error;
            }
        });
    }
    processGoogleResults(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const rsoDiv = yield page.$("#rso");
            if (!rsoDiv) {
                const captcha = yield page.$("form#captcha-form");
                if (captcha) {
                    throw new Error("Captcha detected");
                }
                const searchDiv = yield page.$("div#search");
                if (searchDiv) {
                    throw new Error("No results found in Google search.");
                }
                else {
                    yield page.screenshot({ path: "google_search_error.png" });
                    throw new Error("Might be blocked by Google, try using a different search engine.");
                }
            }
            return yield page.evaluate(() => {
                const results = [];
                const resultElements = document.querySelectorAll("#rso div[data-rpos]");
                let rank = 1;
                resultElements.forEach((element) => {
                    var _a, _b;
                    const titleElement = element.querySelector("h3");
                    const linkElement = element.querySelector("a");
                    const descriptionElement = element.querySelector("div[style='-webkit-line-clamp:2']");
                    if (titleElement && linkElement && descriptionElement) {
                        const title = ((_a = titleElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                        const link = linkElement.getAttribute("href") || "";
                        const description = ((_b = descriptionElement.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "";
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
                            }
                            catch (e) {
                                // Skip invalid URLs but don't increment rank
                            }
                        }
                    }
                });
                return results;
            });
        });
    }
    processBingResults(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const bResults = yield page.$("ol#b_results");
            if (!bResults) {
                yield page.screenshot({ path: "bing_search_error.png" });
                throw new Error("Might be blocked by Bing, try using a different search engine.");
            }
            const noResults = yield page.$("ol#b_results > li.b_no");
            if (noResults) {
                throw new Error("No results found in Bing search.");
            }
            return yield page.evaluate(() => {
                const results = [];
                const resultElements = document.querySelectorAll("li.b_algo");
                let rank = 1;
                resultElements.forEach((element) => {
                    var _a, _b;
                    const titleElement = element.querySelector("h2");
                    const linkElement = element.querySelector("a.tilk");
                    const descriptionElement = element.querySelector("p");
                    if (titleElement && linkElement && descriptionElement) {
                        const title = ((_a = titleElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                        const link = linkElement.getAttribute("href") || "";
                        const description = ((_b = descriptionElement.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "";
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
                            }
                            catch (e) {
                                // Skip invalid URLs but don't increment rank
                            }
                        }
                    }
                });
                return results;
            });
        });
    }
    processDuckDuckGoResults(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const olElement = yield page.$("ol.react-results--main");
            if (!olElement) {
                const boldElements = yield page.$$("b");
                if (boldElements.length === 1) {
                    throw new Error("No results found in DuckDuckGo search.");
                }
                else {
                    yield page.screenshot({ path: "duckduckgo_search_error.png" });
                    throw new Error("Might be blocked by DuckDuckGo, try using a different search engine.");
                }
            }
            return yield page.evaluate(() => {
                const results = [];
                const resultElements = document.querySelectorAll("ol.react-results--main li[data-layout='organic']");
                let rank = 1;
                resultElements.forEach((element) => {
                    var _a, _b;
                    const titleElement = element.querySelector("h2");
                    const linkElement = element.querySelector("a[data-testid='result-extras-url-link']");
                    const descriptionElement = element.querySelector("div[data-result='snippet'] span");
                    if (titleElement && linkElement && descriptionElement) {
                        const title = ((_a = titleElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                        const link = linkElement.getAttribute("href") || "";
                        const description = ((_b = descriptionElement.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "";
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
                            }
                            catch (e) {
                                // Skip invalid URLs but don't increment rank
                            }
                        }
                    }
                });
                return results;
            });
        });
    }
    processYahooResults(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const regSearchCenterMiddle = yield page.$("ol.searchCenterMiddle");
            if (!regSearchCenterMiddle) {
                const noResults = yield page.$("ol.adultRegion");
                if (noResults) {
                    throw new Error("No results found in Yahoo search.");
                }
                else {
                    yield page.screenshot({ path: "yahoo_search_error.png" });
                    throw new Error("Might be blocked by Yahoo, try using a different search engine.");
                }
            }
            return yield page.evaluate(() => {
                const results = [];
                const resultElements = document.querySelectorAll("ol.searchCenterMiddle li");
                let rank = 1;
                resultElements.forEach((element) => {
                    var _a, _b;
                    const titleElement = element.querySelector("h3");
                    const linkElement = element.querySelector("div.compTitle > a:first-child");
                    const descriptionElement = element.querySelector("div.compText");
                    if (titleElement && linkElement && descriptionElement) {
                        const title = ((_a = titleElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                        const link = linkElement.getAttribute("href") || "";
                        const description = ((_b = descriptionElement.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "";
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
                            }
                            catch (e) {
                                // Skip invalid URLs but don't increment rank
                            }
                        }
                    }
                });
                return results;
            });
        });
    }
    urlQueryProvider(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, searchEngine = SearchEngine.GOOGLE) {
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
        });
    }
}
exports.default = SERPScraper;
