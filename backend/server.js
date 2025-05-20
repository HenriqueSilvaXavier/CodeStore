const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./db"); // Conexão com SQLite
require('dotenv').config({ path: __dirname + '/.env' });
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

const SECRET = process.env.SECRET;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../front-end')));

// -------------------- MIDDLEWARE DE AUTENTICAÇÃO ----------------------
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ erro: "Token inválido" });
    req.user = decoded; // { id, nome, email }
    next();
  });
}

// -------------------- USUÁRIOS ----------------------

// Cadastro de usuário
app.post("/cadastro", (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
  }

  if (nome.length < 3) {
    return res.status(400).json({ erro: "O nome deve ter pelo menos 3 caracteres" });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres" });
  }

  const sqlCheck = `SELECT * FROM users WHERE nome = ? OR email = ?`;
  db.get(sqlCheck, [nome, email], (err, userExistente) => {
    if (err) return res.status(500).json({ erro: "Erro ao verificar duplicatas" });
    if (userExistente) return res.status(400).json({ erro: "Nome ou e-mail já cadastrado" });

    bcrypt.hash(senha, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ erro: "Erro ao criptografar senha" });

      const sqlInsert = `INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)`;
      db.run(sqlInsert, [nome, email, hashedPassword], function (err) {
        if (err) return res.status(400).json({ erro: "Erro ao cadastrar" });

        const user = { id: this.lastID, nome, email };
        const token = jwt.sign(user, SECRET, { expiresIn: "2h" });
        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso", token });
      });
    });
  });
});

// Login com JWT
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar usuário" });
    if (!user) return res.status(401).json({ erro: "Credenciais inválidas" });

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) return res.status(401).json({ erro: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email },
      SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({ mensagem: "Login bem-sucedido", token });
  });
});


// Obter dados do usuário autenticado
app.get("/usuario-logado", autenticar, (req, res) => {
  res.json(req.user); // Dados extraídos do token
});

// Listar todos os usuários (apenas para testes)
app.get("/usuarios", autenticar, (req, res) => {
  const sql = "SELECT id, nome, email FROM users";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar usuários" });
    }
    res.status(200).json(rows);
  });
});

// -------------------- PRODUTOS ----------------------

app.get("/produtos", (req, res) => {
  const sql = "SELECT * FROM produtos";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar produtos" });
    }
    res.status(200).json(rows);
  });
});

app.post("/produtos", (req, res) => {
  const { nome, descricao, imagem, preco, promocao, categoria } = req.body;
  if (!nome || !descricao || !imagem || !preco || !promocao || !categoria) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
  }

  const sql = `INSERT INTO produtos (nome, descricao, imagem, preco, promocao, categoria) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [nome, descricao, imagem, preco, promocao, categoria], function (err) {
    if (err) {
      return res.status(500).json({ erro: "Erro ao adicionar produto" });
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.patch("/produtos/:id", (req, res) => {
  const { id } = req.params;
  const campos = req.body;
  const colunas = Object.keys(campos);
  const valores = Object.values(campos);

  if (colunas.length === 0) {
    return res.status(400).json({ erro: "Nenhum campo fornecido para atualização" });
  }

  const setClause = colunas.map(coluna => `${coluna} = ?`).join(", ");
  const sql = `UPDATE produtos SET ${setClause} WHERE id = ?`;

  db.run(sql, [...valores, id], function (err) {
    if (err) {
      return res.status(500).json({ erro: "Erro ao atualizar produto" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }
    res.status(200).json({ mensagem: "Produto atualizado com sucesso" });
  });
});

// -------------------- FAVORITOS ----------------------

// Rota para adicionar ou remover produtos dos favoritos
app.post('/favoritos', autenticar, (req, res) => {
  const userId = req.user.id;
  const { produtoId } = req.body;

  // Verifica se o produto já está nos favoritos
  const sqlCheck = `SELECT * FROM favoritos_users WHERE user_id = ? AND produto_id = ?`;
  db.get(sqlCheck, [userId, produtoId], (err, row) => {
    if (err) return res.status(500).json({ erro: 'Erro ao verificar favoritos' });

    if (row) {
      // Produto já favoritado, remover dos favoritos
      const sqlDelete = `DELETE FROM favoritos_users WHERE user_id = ? AND produto_id = ?`;
      db.run(sqlDelete, [userId, produtoId], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao desfavoritar produto' });
        res.status(200).json({ mensagem: 'Produto removido dos favoritos' });
      });
    } else {
      // Produto não favoritado, adicionar aos favoritos
      const sqlInsert = `INSERT INTO favoritos_users (user_id, produto_id) VALUES (?, ?)`;
      db.run(sqlInsert, [userId, produtoId], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao favoritar produto' });
        res.status(200).json({ mensagem: 'Produto adicionado aos favoritos' });
      });
    }
  });
});


app.delete("/favoritos/:produtoId", autenticar, (req, res) => {
  const { produtoId } = req.params;
  const userId = req.user.id;

  const sql = `DELETE FROM favoritos_users WHERE produto_id = ? AND user_id = ?`;
  db.run(sql, [produtoId, userId], function (err) {
    if (err) {
      return res.status(500).json({ erro: "Erro ao desfavoritar" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: "Favorito não encontrado" });
    }
    res.status(200).json({ mensagem: "Favorito removido com sucesso" });
  });
});

// Rota para obter os produtos favoritados de um usuário
app.get('/favoritos', autenticar, (req, res) => {
  const userId = req.user.id;

  const sql = `SELECT user_id, produto_id FROM favoritos_users WHERE user_id = ?`;
  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao recuperar favoritos' });

    const favoritos = rows.map(row => ({
      userId: row.user_id,
      produtoId: row.produto_id
    }));

    res.json(favoritos);
  });
});

app.get("/favoritos/:userId", (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT f.id AS favorito_id, p.*
    FROM favoritos_users f
    JOIN produtos p ON f.produto_id = p.id
    WHERE f.user_id = ?
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar favoritos:", err);
      return res.status(500).json({ erro: "Erro ao buscar favoritos" });
    }

    // Caso o usuário não tenha favoritos, retorna um array vazio
    res.status(200).json(rows);
  });
});

// -------------------- INICIAR SERVIDOR ----------------------

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});