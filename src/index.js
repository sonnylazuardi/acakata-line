const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.writeHead(301, {
    Location: `http://media.sabda.org/${req.query.url}`
  });
  res.end();
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
