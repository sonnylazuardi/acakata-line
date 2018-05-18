const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.writeHead(301, {
    Location: `http://media.sabda.org/${req.query.url}`
  });
  res.end();
});

app.listen(PORT, () => console.log("Example app listening on port 3000!"));
