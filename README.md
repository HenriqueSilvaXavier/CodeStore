# CodeStore

This project is a e-commerce web application for IT, gamers and design public. Products range from peripherals, devices, cables, etc. Built with **JavaScript**, **HTML**, and **TailwindCSS**, it connects to a backend API to fetch available products.

## 📦 Features

- Product carousel with slide indicators, each products includes name, image, price, and discounts.
- Display a list of categories of the products.
- Dynamic price calculation based on active promotions.
- Highlight of the **highest current promotion**, including:
  - Description.
  - Image.
  - Countdown timer until the end of the promotion.
- A list of products collection.
- The newsletter, for receive news in email.

## 🔧 Technologies Used

- HTML5
- JavaScript 
- TailwindCSS
- REST API (JSON-based product endpoint)
- Node.js
- SQLite

## 🚀 How to run

First, clone the repository in your VSCode with the commands:
```cmd
git clone https://github.com/HenriqueSilvaXavier/CodeStore.git
cd CodeStore
code .
```
To start the server, open the CMD in the project root and run the commands:

```cmd
npm install
node backend/server.js
```
After that, open a new CMD terminal and run this command:

```cmd
start frontend/index.html
```
