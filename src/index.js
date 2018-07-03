const express = require("express");
const Books = require("./books");
const bodyParser = require("body-parser");

var ApolloClient = require('apollo-client').default;
var HttpLink = require('apollo-link-http').HttpLink;
var gql = require('graphql-tag');
var InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var client = new ApolloClient({ 
  link: new HttpLink({ uri: 'https://api.graph.cool/simple/v1/cjj3qc65855ik0115w5jmxm6r', fetch }),
  cache: new InMemoryCache().restore({}),
});

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const pad = (num, size) => {
  var s = num + "";
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
};

app.get("/audio", (req, res) => {
  res.writeHead(301, {
    Location: `http://media.sabda.org/${req.query.url}`
  });
  res.end();
});

app.post("/read", (req, res) => {
  const { queryResult } = req.body;
  const { buku, pasal } = queryResult.parameters;
  const activeBook = Books.find(book => book.value == buku);
  let bookId = Books.findIndex(book => book.value == activeBook.value);
  if (activeBook.type == "new") {
    bookId = bookId - 39;
  }
  const bookNumber = pad(bookId + 1, 2);
  let bookName = activeBook.name_id.toLowerCase();
  bookName = bookName
    .replace("1 ", "1")
    .replace("2 ", "2")
    .replace("3 ", "3");
  if (bookName.indexOf(" " != -1)) {
    let bookSplit = bookName.split(" ");
    bookName = bookSplit[0];
  }
  if (bookName.indexOf("-" != -1)) {
    let bookSplit = bookName.split("-");
    bookName = bookSplit[0];
  }
  let bookShortName = activeBook.value_id.toLowerCase();

  const testament = activeBook.type == "old" ? "pl" : "pb";
  let chapterNumber = activeBook.total > 99 ? pad(pasal, 3) : pad(pasal, 2);
  const streamUrl = `https://acakata.getputik.com/audio?url=alkitab_audio/tb_alkitabsuara/${testament}/mp3/mobile/${bookNumber}_${bookName}/${bookNumber}_${bookShortName}${chapterNumber}.mp3`;
  const fulfillmentText = `<speak>
  Here is ${activeBook.name} chapter ${pasal}...
  <audio src="${streamUrl}" />
  </speak>`;
  console.log(fulfillmentText);
  res.json({
    fulfillmentText: fulfillmentText
  });
});

app.post("/readhd", (req, res) => {
  const { queryResult } = req.body;
  const { buku, pasal } = queryResult.parameters;
  const activeBook = Books.find(book => book.value == buku);
  let bookId = Books.findIndex(book => book.value == activeBook.value);
  if (activeBook.type == "new") {
    bookId = bookId - 39;
  }
  const bookNumber = pad(bookId + 1, 2);
  let bookName = activeBook.name_id.toLowerCase();
  bookName = bookName
    .replace("1 ", "1")
    .replace("2 ", "2")
    .replace("3 ", "3");
  if (bookName.indexOf(" " != -1)) {
    let bookSplit = bookName.split(" ");
    bookName = bookSplit[0];
  }
  if (bookName.indexOf("-" != -1)) {
    let bookSplit = bookName.split("-");
    bookName = bookSplit[0];
  }
  let bookShortName = activeBook.value_id.toLowerCase();

  const testament = activeBook.type == "old" ? "pl" : "pb";
  let chapterNumber = activeBook.total > 99 ? pad(pasal, 3) : pad(pasal, 2);
  const streamUrl = `https://acakata.getputik.com/audio?url=alkitab_audio/tb_alkitabsuara/${testament}/mp3/cd/${bookNumber}_${bookName}/${bookNumber}_${bookShortName}${chapterNumber}.mp3`;
  const fulfillmentText = `<speak>
  Here is ${activeBook.name} chapter ${pasal}...
  <audio src="${streamUrl}" />
  </speak>`;
  console.log(fulfillmentText);
  res.json({
    fulfillmentText: fulfillmentText
  });
});

app.get('/grabdaily', (req, res) => {
  const request = req.query;
  console.log(request);
  const {
    createdAt,
    activityType,
    name,
    distanceMeters,
    elapsedTime,
    elapsedTimeInSeconds,
    linkToActivity,
    routeMapImageUrl,
  } = request;

  client.mutate({
    mutation: gql`
      mutation (
        $createdAt: String!,
        $activityType: String!,
        $name: String!,
        $distanceMeters: Float!,
        $elapsedTime: String!,
        $elapsedTimeInSeconds: Float!,
        $linkToActivity: String!,
        $routeMapImageUrl: String
      ) {
        createStrava(
          createdAtFormat: $createdAt,
          activityType: $activityType,
          name: $name,
          distanceMeters: $distanceMeters,
          elapsedTime: $elapsedTime,
          elapsedTimeInSeconds: $elapsedTimeInSeconds,
          linkToActivity: $linkToActivity,
          routeMapImageUrl: $routeMapImageUrl
        ) {
          id,
          name,
          linkToActivity,
          activityType,
          distanceMeters
        }
      }
    `,
    variables: {
      createdAt,
      activityType,
      name,
      distanceMeters: parseFloat(distanceMeters) || 0,
      elapsedTime,
      elapsedTimeInSeconds: parseFloat(elapsedTimeInSeconds) || 0,
      linkToActivity,
      routeMapImageUrl,
    },
  })
  .then((data) => {
    res.json(data);
  })
  .catch((error) => {
    console.log(error);
    res.json(error);
  });
})

app.get('/grabdaily/all', (req, res) => {
  const request = req.query;
  console.log(request);
  const {
    createdAt,
    activityType,
    name,
    distanceMeters,
    elapsedTime,
    elapsedTimeInSeconds,
    linkToActivity,
    routeMapImageUrl,
  } = request;

  client.query({
    query: gql`
      query Strava {
        allStravas {
          createdAtFormat,
          activityType,
          name,
          distanceMeters,
          elapsedTime,
          elapsedTimeInSeconds,
          linkToActivity,
          routeMapImageUrl,
        }
      }
    `,
  })
  .then((data) => {
    res.json(data.data.allStravas);
  })
  .catch((error) => {
    console.log(error);
    res.json(error);
  });
})


app.listen(PORT, () => console.log("Example app listening on port 3000!"));
