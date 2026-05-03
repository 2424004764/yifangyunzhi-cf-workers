import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";

// Auth
import { AuthLogin } from "./endpoints/authLogin";
import { UserMe } from "./endpoints/userMe";
import { UpdateUserMe } from "./endpoints/updateUserMe";

// System
import { GetSystemConfig } from "./endpoints/getSystemConfig";
import { GetSystemConfigByGet } from "./endpoints/getSystemConfigByGet";
import { SetSystemConfig } from "./endpoints/setSystemConfig";

// File
import { handleFileUpload } from "./endpoints/fileUploadOss";
import { handleFileGet } from "./endpoints/fileGet";
import { AliyunTimerDelete } from "./endpoints/aliyunTimerDelete";

// Fund & Gold & Baidu
import { GetFundPrice } from "./endpoints/getFundPrice";
import { GetFundHistory } from "./endpoints/getFundHistory";
import { GetGoldPrice } from "./endpoints/getGoldPrice";
import { GetBaiduAiAccessToken } from "./endpoints/getBaiduAiAccessToken";

// Permissions
import { GetShareRecord } from "./endpoints/getShareRecord";
import { CreateShareRecord } from "./endpoints/createShareRecord";
import { GetShareableRoles } from "./endpoints/getShareableRoles";
import { GetUserInfo } from "./endpoints/getUserInfo";
import { GetUserPermission } from "./endpoints/getUserPermission";
import { UpdateUserRole } from "./endpoints/updateUserRole";

// Onenote
import { OnenoteCreate } from "./endpoints/onenoteCreate";
import { OnenoteDelete } from "./endpoints/onenoteDelete";
import { OnenoteList } from "./endpoints/onenoteList";
import { OnenoteUpdate } from "./endpoints/onenoteUpdate";

// Additive Type
import { AdditiveTypeList } from "./endpoints/additiveTypeList";
import { AdditiveTypeCreate } from "./endpoints/additiveTypeCreate";
import { AdditiveTypeUpdate } from "./endpoints/additiveTypeUpdate";
import { AdditiveTypeDelete } from "./endpoints/additiveTypeDelete";
import { AdditiveBatchCount } from "./endpoints/additiveBatchCount";

// Additive Page
import { AdditiveListItems } from "./endpoints/additiveListItems";
import { AdditiveItemCreate } from "./endpoints/additiveItemCreate";
import { AdditiveItemUpdate } from "./endpoints/additiveItemUpdate";
import { AdditiveItemDelete } from "./endpoints/additiveItemDelete";
import { IncAdditiveThumbUp } from "./endpoints/incAdditiveThumbUp";
import { IncAdditiveThumbDown } from "./endpoints/incAdditiveThumbDown";
import { GetAdditiveListAll } from "./endpoints/getAdditiveListAll";
import { AdditiveItemGet } from "./endpoints/additiveItemGet";

// Chat
import { ChatSessionList } from "./endpoints/chatSessionList";
import { ChatSessionCreate } from "./endpoints/chatSessionCreate";
import { ChatSessionUpdate } from "./endpoints/chatSessionUpdate";
import { ChatSessionDelete } from "./endpoints/chatSessionDelete";
import { ChatMessageList } from "./endpoints/chatMessageList";
import { ChatMessageCreate } from "./endpoints/chatMessageCreate";
import { ChatMessageDelete } from "./endpoints/chatMessageDelete";
import { ChatMessageDeleteBySession } from "./endpoints/chatMessageDeleteBySession";

// Annual Savings
import { AnnualSavingsList } from "./endpoints/annualSavingsList";
import { AnnualSavingsUpsert } from "./endpoints/annualSavingsUpsert";
import { AnnualSavingsDelete } from "./endpoints/annualSavingsDelete";

// Birthday
import { BirthdayList } from "./endpoints/birthdayList";
import { BirthdayGetById } from "./endpoints/birthdayGetById";
import { BirthdayCreate } from "./endpoints/birthdayCreate";
import { BirthdayUpdate } from "./endpoints/birthdayUpdate";
import { BirthdayDelete } from "./endpoints/birthdayDelete";
import { BirthdayGroups } from "./endpoints/birthdayGroups";
import { BirthdayCheckName } from "./endpoints/birthdayCheckName";

// Random Select
import { RandomGroupList } from "./endpoints/randomGroupList";
import { RandomGroupCreate } from "./endpoints/randomGroupCreate";
import { RandomGroupUpdate } from "./endpoints/randomGroupUpdate";
import { RandomGroupDelete } from "./endpoints/randomGroupDelete";
import { RandomItemList } from "./endpoints/randomItemList";
import { RandomItemBatchCreate } from "./endpoints/randomItemBatchCreate";
import { RandomItemUpdate } from "./endpoints/randomItemUpdate";
import { RandomItemDelete } from "./endpoints/randomItemDelete";
import { RandomItemDeleteByGroup } from "./endpoints/randomItemDeleteByGroup";

// YFD Price
import { YfdPriceLatest } from "./endpoints/yfdPriceLatest";
import { YfdPriceCreate } from "./endpoints/yfdPriceCreate";
import { YfdPriceList } from "./endpoints/yfdPriceList";
import { YfdPriceDelete } from "./endpoints/yfdPriceDelete";

// ThIdeas
import { ThIdeasList } from "./endpoints/thIdeasList";
import { ThIdeasGet } from "./endpoints/thIdeasGet";
import { ThIdeasCreate } from "./endpoints/thIdeasCreate";
import { ThIdeasUpdate } from "./endpoints/thIdeasUpdate";
import { ThIdeasDelete } from "./endpoints/thIdeasDelete";

// Anime
import { AnimeHistoryList } from "./endpoints/animeHistoryList";
import { AnimeGroupGet } from "./endpoints/animeGroupGet";
import { AnimeGroupCreate } from "./endpoints/animeGroupCreate";
import { AnimeGroupItemCreate } from "./endpoints/animeGroupItemCreate";
import { AnimeGroupDelete } from "./endpoints/animeGroupDelete";
import { AnimeGroupItemDelete } from "./endpoints/animeGroupItemDelete";
import { AnimeGroupItemList } from "./endpoints/animeGroupItemList";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

const openapi = fromHono(app, { docs_url: "/" });

// ====== 公开接口 ======
openapi.post("/api/auth/login", AuthLogin);
app.get("/files/*", async (c) => await handleFileGet(c));

// ====== 受保护接口中间件 ======
const PROTECTED = [
	"/api/user", "/api/system", "/api/file", "/api/aliyun",
	"/api/additive", "/api/baidu", "/api/permissions",
	"/api/onenote", "/api/chat", "/api/annual-savings", "/api/birthday",
	"/api/random-select", "/api/yfd-price", "/api/aigc", "/api/th-ideas",
];
for (const prefix of PROTECTED) {
	app.use(`${prefix}/*`, authMiddleware);
	app.use(prefix, authMiddleware);
}

// ====== 用户 ======
openapi.get("/api/user/me", UserMe);
openapi.put("/api/user/me", UpdateUserMe);

// ====== 系统配置 ======
openapi.post("/api/system/config", GetSystemConfig);
openapi.get("/api/system/config", GetSystemConfigByGet);
openapi.post("/api/system/config/set", SetSystemConfig);

// ====== 文件 ======
app.post("/api/file/upload-oss", async (c) => await handleFileUpload(c));
openapi.post("/api/aliyun/timer-delete", AliyunTimerDelete);

// ====== 基金 ======
openapi.get("/api/fund/price", GetFundPrice);
openapi.post("/api/fund/price", GetFundPrice);
openapi.get("/api/fund/history", GetFundHistory);
openapi.get("/api/fund/gold", GetGoldPrice);

// ====== 百度 AI ======
openapi.post("/api/baidu/access-token", GetBaiduAiAccessToken);

// ====== 权限 ======
openapi.get("/api/permissions/share-record", GetShareRecord);
openapi.post("/api/permissions/share-record", CreateShareRecord);
openapi.get("/api/permissions/shareable-roles", GetShareableRoles);
openapi.get("/api/permissions/user-info", GetUserInfo);
openapi.get("/api/permissions/user-permission", GetUserPermission);
openapi.post("/api/permissions/update-user-role", UpdateUserRole);

// ====== 笔记本 ======
openapi.get("/api/onenote/list", OnenoteList);
openapi.post("/api/onenote/create", OnenoteCreate);
openapi.post("/api/onenote/update", OnenoteUpdate);
openapi.post("/api/onenote/delete", OnenoteDelete);

// ====== 记事本分区 ======
openapi.get("/api/additive/type", AdditiveTypeList);
openapi.post("/api/additive/type", AdditiveTypeCreate);
openapi.put("/api/additive/type/:id", AdditiveTypeUpdate);
openapi.delete("/api/additive/type/:id", AdditiveTypeDelete);
openapi.post("/api/additive/batch-count", AdditiveBatchCount);

// ====== 记事本页面 ======
openapi.get("/api/additive/list", AdditiveListItems);
openapi.post("/api/additive/list", AdditiveItemCreate);
openapi.put("/api/additive/list/:id", AdditiveItemUpdate);
openapi.get("/api/additive/list/:id", AdditiveItemGet);
openapi.delete("/api/additive/list/:id", AdditiveItemDelete);
openapi.post("/api/additive/thumb-up", IncAdditiveThumbUp);
openapi.post("/api/additive/thumb-down", IncAdditiveThumbDown);
openapi.post("/api/additive/list-all", GetAdditiveListAll);

// ====== AI 聊天 ======
openapi.get("/api/chat/session", ChatSessionList);
openapi.post("/api/chat/session", ChatSessionCreate);
openapi.put("/api/chat/session/:id", ChatSessionUpdate);
openapi.delete("/api/chat/session/:id", ChatSessionDelete);
openapi.get("/api/chat/message", ChatMessageList);
openapi.post("/api/chat/message", ChatMessageCreate);
openapi.delete("/api/chat/message/:id", ChatMessageDelete);
openapi.delete("/api/chat/message/by-session/:id", ChatMessageDeleteBySession);

// ====== 年度结余 ======
openapi.get("/api/annual-savings", AnnualSavingsList);
openapi.post("/api/annual-savings", AnnualSavingsUpsert);
openapi.delete("/api/annual-savings/:id", AnnualSavingsDelete);

// ====== 生日备注 ======
openapi.get("/api/birthday", BirthdayList);
openapi.get("/api/birthday/groups", BirthdayGroups);
openapi.get("/api/birthday/check-name", BirthdayCheckName);
openapi.get("/api/birthday/:id", BirthdayGetById);
openapi.post("/api/birthday", BirthdayCreate);
openapi.put("/api/birthday/:id", BirthdayUpdate);
openapi.delete("/api/birthday/:id", BirthdayDelete);

// ====== 随机选择 ======
openapi.get("/api/random-select/group", RandomGroupList);
openapi.post("/api/random-select/group", RandomGroupCreate);
openapi.put("/api/random-select/group/:id", RandomGroupUpdate);
openapi.delete("/api/random-select/group/:id", RandomGroupDelete);
openapi.get("/api/random-select/item", RandomItemList);
openapi.post("/api/random-select/item/batch", RandomItemBatchCreate);
openapi.put("/api/random-select/item/:id", RandomItemUpdate);
openapi.delete("/api/random-select/item/:id", RandomItemDelete);
openapi.delete("/api/random-select/item/group/:group_id", RandomItemDeleteByGroup);

// ====== 易方达价格 ======
openapi.get("/api/yfd-price", YfdPriceLatest);
openapi.get("/api/yfd-price/list", YfdPriceList);
openapi.post("/api/yfd-price", YfdPriceCreate);
openapi.delete("/api/yfd-price/:id", YfdPriceDelete);

// ====== 所思所想 ======
openapi.get("/api/th-ideas", ThIdeasList);
openapi.get("/api/th-ideas/:id", ThIdeasGet);
openapi.post("/api/th-ideas", ThIdeasCreate);
openapi.put("/api/th-ideas/:id", ThIdeasUpdate);
openapi.delete("/api/th-ideas/:id", ThIdeasDelete);

// ====== AI 生图 ======
openapi.get("/api/aigc/anime/history", AnimeHistoryList);
openapi.get("/api/aigc/anime/history/group/:id", AnimeGroupGet);
openapi.post("/api/aigc/anime/history/group", AnimeGroupCreate);
openapi.post("/api/aigc/anime/history/group-item", AnimeGroupItemCreate);
openapi.delete("/api/aigc/anime/history/group/:id", AnimeGroupDelete);
openapi.delete("/api/aigc/anime/history/group-item/:id", AnimeGroupItemDelete);
openapi.get("/api/aigc/anime/history/group-item/:groupId", AnimeGroupItemList);

export default app;
