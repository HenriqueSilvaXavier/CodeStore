# Requirements

Make sure you have installed:

- **Node.js** (recommended: v18 or higher)
- **npm**
- **Git**

---

## Project Structure

```
CodeStore-main/
├── backend/ # Node.js server with Express and SQLite
├── frontend/ # Static UI with HTML and Tailwind CSS
└── package.json # Backend Dependencies
```

---

## Step-by-Step Installation

### 1. Clone the repository

```bash
git clone https://github.com/HenriqueSilvaXavier/CodeStore.git
cd CodeStore
```

### 2. Install the backend dependencies

```bash
cd backend
npm install
```

### 3. Start the server

```bash
node server.js
```

The backend will be started, usually at:
[http://localhost:3000](http://localhost:3000)

Check the port in the `server.js` file. The default is **3000**.

### 4. Access the frontend

Open the file directly in the browser:

```bash
cd ../frontend

# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

Or serve static files using an extension like **Live Server** in VS Code.
