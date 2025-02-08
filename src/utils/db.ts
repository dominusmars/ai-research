import Database from "better-sqlite3";
import { ChatHistory } from "./bot";

type ChatMessage = {
  bot_name: string;
  content: string;
  role: string;
  created_at: number;
  total_duration: number;
};

class PlayFeildDB {
  private db: Database.Database;

  constructor(dbFilePath?: string) {
    this.db = new Database(dbFilePath || ":memory:");
    this.init();
  }
  private init() {
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
  public addMessage(botName: string, message: ChatHistory) {
    const insertQuery = `
          INSERT INTO messages (bot_name, content, role, created_at, total_duration)
          VALUES (@bot_name, @content, @role, @created_at, @total_duration)
        `;
    const stmt = this.db.prepare<ChatMessage>(insertQuery);
    stmt.run({
      bot_name: botName,
      content: message.content,
      role: message.role,
      created_at: message.created_at,
      total_duration: message.total_duration,
    });
  }
  public getMessages(botName: string): Omit<ChatMessage, "bot_name">[] {
    const selectQuery = `
        SELECT content, role, created_at, total_duration
        FROM messages
        WHERE bot_name = ?
        LIMIT 50
      `;
    const stmt = this.db.prepare<string, ChatMessage>(selectQuery);
    const rows = stmt.all(botName);

    return rows.map((row) => ({
      content: row.content,
      role: row.role,
      created_at: row.created_at,
      total_duration: row.total_duration,
    }));
  }
  public getBotMessages(botName: string): Omit<ChatMessage, "bot_name">[] {
    const selectQuery = `
        SELECT content, role, created_at, total_duration
        FROM messages
        WHERE bot_name = ?
        AND role = 'assistant'
        LIMIT 50`;
    const stmt = this.db.prepare<string, ChatMessage>(selectQuery);
    const rows = stmt.all(botName);

    return rows.map((row) => ({
      content: row.content,
      role: row.role,
      created_at: row.created_at,
      total_duration: row.total_duration,
    }));
  }
}

export default new PlayFeildDB();
