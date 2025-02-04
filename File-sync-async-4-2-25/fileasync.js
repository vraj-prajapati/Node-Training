const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const PORT = 3000;
const filePath = path.join(__dirname, "response.json");

const readData = async () => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};

const writeData = async (data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing file:", error);
  }
};

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (url === "/posts" && method === "GET") {
    const data = await readData();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  } else if (url === "/posts" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const newItem = JSON.parse(body);
        const data = await readData();
        newItem.id = data.length ? data[data.length - 1].id + 1 : 1;
        data.push(newItem);
        await writeData(data);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newItem));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON format" }));
      }
    });
  } else if (url.startsWith("/posts/")) {
    const parts = url.split("/");
    const id = parseInt(parts[2], 10);
    const data = await readData();

    if (method === "GET") {
      const item = data.find((d) => d.id === id);
      if (item) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(item));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Item not found" }));
      }
    } else if (method === "PUT" || method === "PATCH") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const updatedItem = JSON.parse(body);
          const index = data.findIndex((d) => d.id === id);
          if (index !== -1) {
            data[index] = { ...data[index], ...updatedItem };
            await writeData(data);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data[index]));
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Item not found" }));
          }
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Invalid JSON format" }));
        }
      });
    } else if (method === "DELETE") {
      const index = data.findIndex((d) => d.id === id);
      if (index !== -1) {
        const deletedItem = data.splice(index, 1);
        await writeData(data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            meaasage: "Item deleted",
            item: deletedItem}));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Item not found" }));
      }
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
