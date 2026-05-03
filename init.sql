-- ============================================================
-- 一方云知 (yifangyunzhi) D1 数据库初始化
-- ============================================================

-- 1. 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_name TEXT,
    config_value TEXT,
    config_desc TEXT,
    config_key TEXT UNIQUE
);

INSERT OR IGNORE INTO system_config (config_key, config_name, config_value, config_desc) VALUES (
    'avatar_select_list',
    '用户可选择的头像',
    '[{"name":"影视头像","list":[1,2,3,4,5,6,7,8,9,10,11,12]},{"name":"职业头像","list":[13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]},{"name":"修勾头像","list":[31,32,33,34,35,36,37,38,39,40,41,42]},{"name":"圣诞节头像","list":[43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58]},{"name":"学生头像","list":[59,60,61,62,63,64,65,66,67,68,69,70,82,83,84,85,86,87,88,89,90,91,92,93]},{"name":"职场生活头像","list":[71,72,73,74,75,76,77,78,79,80,81]},{"name":"创意头像","list":[94,95,96,97,98,99,100,101,102,103,104,105]},{"name":"扁平头像","list":[106,107,108,109,110,111,112,113,114,115,116,117]}]',
    '用户信息->设置头像时的可选头像'
);

-- 2. 用户表
CREATE TABLE IF NOT EXISTS "user" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "wx_openid" TEXT,
    "third_party" TEXT,
    "register_env" TEXT,
    "register_date" INTEGER,
    "dcloud_appid" TEXT,
    "my_invite_code" TEXT,
    "last_login_date" INTEGER,
    "last_login_ip" TEXT,
    "token" TEXT,
    "nickname" TEXT,
    "avatar_file" TEXT,
    "role" TEXT
);

-- 3. 角色表
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id TEXT NOT NULL UNIQUE,
    role_name TEXT NOT NULL,
    comment TEXT,
    permission TEXT DEFAULT '[]',
    is_shareable INTEGER DEFAULT 0
);

-- 默认角色（与前端 common/consts/system_config.js 权限点对应）
INSERT OR IGNORE INTO roles (role_id, role_name, comment, permission, is_shareable) VALUES
('admin', '管理员', '拥有所有权限', '[1,2,3,4,5,6,7,8,9]', 0),
('chatgpt', 'AI聊天', 'AI对话功能', '[1]', 0),
('share_permission', '权限分享', '可将角色分享给其他用户', '[2]', 1),
('ai_image', 'AI画图', 'AI图片生成功能', '[3]', 0),
('additive', '添加剂', '访问添加剂列表和详情', '[4]', 0),
('executive_standards_share', '执行标准分享', '执行标准列表和详情分享', '[5]', 0),
('price', '易方达金价', '易方达金价首页和详情页', '[6]', 0),
('random_select', '随机选择', '随机选择功能', '[7]', 0),
('additive_edit', '公共文章编辑', '编辑公共文章', '[8]', 0),
('to_anime', '人像动漫化', '人像动漫化功能', '[9]', 0),
('invite', '受邀用户', '基本使用权限', '[]', 1);

-- 4. 权限分享记录表
CREATE TABLE IF NOT EXISTS share_permission_record (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    permission TEXT NOT NULL DEFAULT '[]',
    expiration_seconds INTEGER DEFAULT 0,
    create_date INTEGER NOT NULL
);

-- 5. 笔记本表 (onenote)
CREATE TABLE IF NOT EXISTS onenote (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT,
    icon_color TEXT,
    created_on INTEGER NOT NULL,
    updated_on INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_onenote_user_id ON onenote(user_id);

-- 6. 笔记本分类表 (additive_type)
CREATE TABLE IF NOT EXISTS additive_type (
    id TEXT PRIMARY KEY,
    onenote_id INTEGER NOT NULL,
    name TEXT,
    desc TEXT,
    type INTEGER DEFAULT 1,
    created_on INTEGER NOT NULL,
    updated_on INTEGER NOT NULL,
    FOREIGN KEY (onenote_id) REFERENCES onenote(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_additive_type_onenote_id ON additive_type(onenote_id);

-- 7. 笔记本页面表 (additive_list)
CREATE TABLE IF NOT EXISTS additive_list (
    id TEXT PRIMARY KEY,
    type_id TEXT NOT NULL,
    onenote_id INTEGER NOT NULL,
    name TEXT,
    icon TEXT,
    effect TEXT,
    making_raw_materials TEXT,
    what TEXT,
    make TEXT,
    use_to TEXT,
    thumb_down INTEGER DEFAULT 0,
    thumb_up INTEGER DEFAULT 0,
    created_on INTEGER NOT NULL,
    updated_on INTEGER NOT NULL,
    FOREIGN KEY (type_id) REFERENCES additive_type(id) ON DELETE CASCADE,
    FOREIGN KEY (onenote_id) REFERENCES onenote(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_additive_list_type_id ON additive_list(type_id);
CREATE INDEX IF NOT EXISTS idx_additive_list_onenote_id ON additive_list(onenote_id);

-- 8. AI聊天会话表
CREATE TABLE IF NOT EXISTS chat_session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL UNIQUE,
    session_title TEXT,
    session_type INTEGER DEFAULT 1,
    template_content TEXT,
    created_on INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_session_user_id ON chat_session(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_session_session_id ON chat_session(session_id);

-- 9. AI聊天消息表
CREATE TABLE IF NOT EXISTS ai_message_list (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    message TEXT,
    created_on INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_message_session_id ON ai_message_list(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_user_id ON ai_message_list(user_id);

-- 10. AI图片生成任务表
CREATE TABLE IF NOT EXISTS ai_image (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type INTEGER DEFAULT 1,
    state INTEGER DEFAULT 1,
    params_pack TEXT,
    start_date TEXT,
    end_date TEXT,
    result_url TEXT,
    created_on INTEGER NOT NULL,
    updated_on INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_image_task_id ON ai_image(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_image_user_id ON ai_image(user_id);

-- 11. 年度结余表
CREATE TABLE IF NOT EXISTS annual_savings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    savings_amount REAL NOT NULL DEFAULT 0,
    description TEXT,
    created_date TEXT,
    updated_date TEXT
);
CREATE INDEX IF NOT EXISTS idx_annual_savings_user_id ON annual_savings(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_annual_savings_user_year ON annual_savings(user_id, year);

-- 12. 生日备注表
CREATE TABLE IF NOT EXISTS brithday_remark (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT,
    avatar TEXT,
    brithday_date TEXT,
    is_lunar_date INTEGER DEFAULT 0,
    group_name TEXT,
    remark TEXT,
    more_field TEXT,
    created_on INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_brithday_remark_user_id ON brithday_remark(user_id);

-- 13. 动漫生成分组表
CREATE TABLE IF NOT EXISTS anime_gen_group (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    created_on INTEGER NOT NULL,
    updated_on INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_anime_gen_group_user_id ON anime_gen_group(user_id);

-- 14. 动漫生成条目表
CREATE TABLE IF NOT EXISTS anime_gen_group_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    is_row INTEGER DEFAULT 1,
    style TEXT,
    image_url TEXT,
    created_on INTEGER NOT NULL,
    updated_on INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES anime_gen_group(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_anime_gen_group_item_group_id ON anime_gen_group_item(group_id);

-- 15. 随机选择分组表
CREATE TABLE IF NOT EXISTS random_select_group (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    group_title TEXT,
    created_on INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_random_select_group_user_id ON random_select_group(user_id);

-- 16. 随机选择条目表
CREATE TABLE IF NOT EXISTS random_select_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    group_id INTEGER NOT NULL,
    message TEXT,
    created_on INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES random_select_group(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_random_select_item_group_id ON random_select_item(group_id);
CREATE INDEX IF NOT EXISTS idx_random_select_item_user_id ON random_select_item(user_id);

-- 17. 黄金基金净值表（net_worth=净值, gold_price=金价）
CREATE TABLE IF NOT EXISTS gold_trend (
    id TEXT PRIMARY KEY,
    net_worth TEXT,
    gold_price TEXT,
    ymd TEXT NOT NULL UNIQUE,
    created_on TEXT
);
CREATE INDEX IF NOT EXISTS idx_gold_trend_ymd ON gold_trend(ymd);

-- 18. 易方达卖出价格表
CREATE TABLE IF NOT EXISTS yfd_sell_price (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    yfd_sell_price TEXT,
    created_on INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_yfd_sell_price_user_id ON yfd_sell_price(user_id);

-- 19. 临时上传文件表
CREATE TABLE IF NOT EXISTS upload_file_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    expiration_time INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_upload_file_temp_expiration ON upload_file_temp(expiration_time);

-- 20. 文章表（th_ideas 所思所想）
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    article_status INTEGER,
    publish_date INTEGER,
    last_modify_date INTEGER,
    title TEXT,
    content TEXT,
    excerpt TEXT,
    publish_ip TEXT,
    last_modify_ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
