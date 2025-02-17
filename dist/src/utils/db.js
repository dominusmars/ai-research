"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
class PlayFeildDB {
    constructor(dbFilePath) {
        this.db = new better_sqlite3_1.default(dbFilePath || ":memory:");
        this.init();
    }
    init() {
        const createChatTableQuery = `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_name TEXT,
        content TEXT,
        role TEXT,
        created_at INTEGER,
        total_duration INTEGER
        )
      `;
        this.db.exec(createChatTableQuery);
    }
    addMessage(botName, message) {
        const insertQuery = `
          INSERT INTO messages (bot_name, content, role, created_at, total_duration)
          VALUES (@bot_name, @content, @role, @created_at, @total_duration)
        `;
        const stmt = this.db.prepare(insertQuery);
        stmt.run({
            bot_name: botName,
            content: message.content,
            role: message.role,
            created_at: message.created_at,
            total_duration: message.total_duration,
        });
    }
    getMessages(botName) {
        const selectQuery = `
        SELECT content, role, created_at, total_duration
        FROM messages
        WHERE bot_name = ?
        ORDER BY ID DESC
        LIMIT 50;`;
        const stmt = this.db.prepare(selectQuery);
        const rows = stmt.all(botName);
        return rows
            .map((row) => ({
            content: row.content,
            role: row.role,
            created_at: row.created_at,
            total_duration: row.total_duration,
        }))
            .reverse();
    }
    getAllMessages(botName) {
        const selectQuery = `
        SELECT bot_name, content, role, created_at, total_duration
        FROM messages
        ORDER BY ID DESC`;
        const stmt = this.db.prepare(selectQuery);
        const rows = stmt.all(botName);
        return rows
            .map((row) => ({
            content: row.content,
            role: row.role,
            created_at: row.created_at,
            total_duration: row.total_duration,
        }))
            .reverse();
    }
    getBotMessages(botName) {
        const selectQuery = `
        SELECT content, role, created_at, total_duration
        FROM messages
        WHERE bot_name = ?
        AND role = 'assistant'
        ORDER BY ID DESC
        LIMIT 50`;
        const stmt = this.db.prepare(selectQuery);
        const rows = stmt.all(botName);
        return rows
            .map((row) => ({
            content: row.content,
            role: row.role,
            created_at: row.created_at,
            total_duration: row.total_duration,
        }))
            .reverse();
    }
    removeMessages(botName) {
        const deleteQuery = `
        DELETE FROM messages
        WHERE bot_name = ?
      `;
        const stmt = this.db.prepare(deleteQuery);
        stmt.run(botName);
    }
}
exports.default = new PlayFeildDB();
