const http=require('http');
const fs=require('fs');
const path=require('path');

const PORT = 3000;

const filePath=path.join(__dirname,'response.json');

const readData = () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing file:", error);
  }
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (url === "/posts" && method==="GET") { 
      const data = readData();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    } else if (url.startsWith("/posts/add") && method === "POST") {
      
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        const newItem = JSON.parse(body);
        const data = readData();
        newItem.id = data.length ? data[data.length - 1].id + 1 : 1; // Assign a new ID
        data.push(newItem);
        writeData(data);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newItem));
      });
    
  } else if (url.startsWith("/posts/")) {
    const id = parseInt(url.split("/")[2], 10);
    const data = readData();

    if (method === "GET") {
      
      const item = data.find((d) => d.id === id);
      if (item) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(item));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Item not found" }));
      }
    } else if (method === "PUT" &&  url.startsWith("/posts/update")) {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        const updatedItem = JSON.parse(body);
        const id = parseInt(url.split("/")[3], 10);
        const index = data.findIndex((d) => d.id === id);
        if (index !== -1) {
          data[index] = { ...data[index], ...updatedItem };
          writeData(data);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(data[index]));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Item not found" }));
        }
      });
    } else if (method === "PATCH" &&  url.startsWith("/posts/modify")) {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        const updatedItem = JSON.parse(body);
        const id = parseInt(url.split("/")[3], 10);
        const index = data.findIndex((d) => d.id === id);
        if (index !== -1) {
          data[index] = { ...data[index], ...updatedItem };
          writeData(data);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(data[index]));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Item not found" }));
        }
      });
    } else if (method === "DELETE" && url.startsWith("/posts/delete")) {
        const id=parseInt(url.split("/")[3],10);
      const index = data.findIndex((d) => d.id === id);
      if (index !== -1) {
        const deletedItem = data.splice(index, 1);
        writeData(data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(deletedItem));
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
