import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.resolve(__dirname, '..','data', 'devblog.db')

// 确保数据库文件存在  同步创建数据库文件所在的目录（即 data/）。
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

const db = new Database(DB_PATH)

//性能优化：启用WAL模式和内存缓存
db.pragma('journal_mode = WAL') //将 SQLite 的日志模式设置为 WAL（Write-Ahead Logging，预写日志）
db.pragma('foreign_keys = ON') // 启用外键约束
db.pragma('cache_size = -20000') // 设置缓存大小为 20MB（负值表示以 KB 为单位）

export function initDB():void{
  db.exec(`
    -- 用户表
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT,
      user_pic TEXT,
      nickname TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 分类表
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    );

    -- 标签表
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    -- 文章表
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      cover_url TEXT,
      author_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- 文章-标签关联表（多对多）
    CREATE TABLE IF NOT EXISTS article_tags (
      article_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (article_id, tag_id),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
    -- 评论表
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      article_id INTEGER NOT NULL,  -- ⚠️ 关联文章ID
      user_id INTEGER NOT NULL,     -- ⚠️ 关联用户ID
      parent_id INTEGER DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      -- ✅ 核心：级联删除 → 文章/用户删了，评论自动删
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    );
    -- 点赞表
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      article_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      -- ✅ 核心：联合唯一约束 → 数据库层面防重复点赞
      UNIQUE(user_id, article_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );
    -- FTS5 虚拟表（全文搜索核心）
    CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
      title, content, summary,
      content='articles',        -- 关联真实表
      content_rowid='id'         -- 关联主键
    );
    
    -- ✅ 3个触发器必须全写！少一个索引不同步
    -- 新增文章时同步索引
    CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
      INSERT INTO articles_fts(rowid, title, content, summary)
      VALUES (new.id, new.title, new.content, new.summary);
    END;
    -- 删除文章时同步索引
    CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
      INSERT INTO articles_fts(articles_fts, rowid, title, content, summary)
      VALUES ('delete', old.id, old.title, old.content, old.summary);
    END;
    -- 更新文章时同步索引
    CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
      INSERT INTO articles_fts(articles_fts, rowid, title, content, summary)
      VALUES ('delete', old.id, old.title, old.content, old.summary);
      INSERT INTO articles_fts(rowid, title, content, summary)
      VALUES (new.id, new.title, new.content, new.summary);
    END;
  `)

  // 【幂等升级】兼容旧数据库：补齐可能缺失的列
  // SQLite 不支持 ALTER TABLE ... ADD COLUMN IF NOT EXISTS，
  // 用 JS try-catch 捕获"列已存在"错误并静默忽略
  try {
    db.exec('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    console.log('✅ 数据库升级：users 表已添加 updated_at 列')
  } catch {
    // 列已存在 → 忽略
  }
}

export default db

