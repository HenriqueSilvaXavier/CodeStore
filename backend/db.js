const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.join(__dirname, "loja.db");
const db = new sqlite3.Database(dbPath);

// Cria tabelas separadamente
db.serialize(() => {
  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL
    )
  `);

  // Tabela de produtos
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT NOT NULL,
      imagem TEXT NOT NULL,
      preco DECIMAL(10, 2) NOT NULL,
      promocao TEXT NOT NULL,
      fim_promocao DATETIME,
      categoria TEXT NOT NULL,
      estoque INTEGER NOT NULL DEFAULT 0,
      colecao TEXT
      )
  `);

  // Tabela de favoritos (relaciona usuários com produtos)
  db.run(`
    CREATE TABLE IF NOT EXISTS carrinho (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      UNIQUE(user_id, produto_id), -- evita duplicatas
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      comentario TEXT NOT NULL,
      nota INTEGER CHECK(nota >= 1 AND nota <= 5),
      data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;

