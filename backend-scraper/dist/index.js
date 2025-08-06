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
exports.scraper = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const scraper_provider_1 = __importDefault(require("./scraper-provider"));
const routes_1 = __importDefault(require("./routes"));
// Initialize
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.scraper = null;
const PORT = 3000;
// Middleware
app.use(express_1.default.static("public"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.json({ message: "Welcome to SERP Scraper API" });
});
app.use("/api", routes_1.default);
app.listen(PORT, () => {
    exports.scraper = new scraper_provider_1.default(parseInt(process.env.TAB_LIMIT) || 1000);
    console.log("⚡️[server]: Server is running at http://localhost:" + PORT);
});
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (exports.scraper === null || exports.scraper === void 0 ? void 0 : exports.scraper.closeBrowser());
    process.exit();
}));
process.on("SIGUSR2", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (exports.scraper === null || exports.scraper === void 0 ? void 0 : exports.scraper.closeBrowser());
    process.exit();
}));
