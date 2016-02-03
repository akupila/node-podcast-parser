# node-podcast-parser

Parses a podcast RSS feed and returns easy to use result

## Usage

```js
const parsePodcast = require('node-podcast-parser');

parsePodcast('<podcast xml>', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // data looks like the format below
  console.log(data);
});
```

## Parsing a remote feed

`node-podcast-parser` only takes care of the parsing itself, you'll need to download the feed first yourself.

Download the feed however you want, for instance using [request](https://github.com/request/request)

Example:

```js
const request = require('request');
const parsePodcast = require('node-podcast-parser');

request('<podcast url>', (err, res, data) => {
  if (err) {
    console.error('Network error', err);
    return;
  }

  parsePodcast(data, (err, data) => {
    if (err) {
      console.error('Parsing error', err);
      return;
    }

    console.log(data);
  });
});
```

Output format:

```json
{
  "title":       "<Podcast title>",
  "description": {
    "short": "<Podcast subtitle>",
    "description": "<Podcast description>"
  },
  "link":        "<Podcast link (usually website for podcast)>",
  "image":       "<Podcast image>",
  "language":    "<ISO 639 language>", // http://www.loc.gov/standards/iso639-2/php/code_list.php
  "copyright":   "<Podcast copyright>",
  "categories": [{
    "Category",
    "Category>Subcategory",
  }],
  "explicit": false,
  "owner": {
    "name":  "<Author name>",
    "email": "<Author email>"
  },
  "episodes": [
    {
      "guid":        "<Unique id>",
      "title":       "<Episode title>",
      "description": "<Episode description>",
      "image":       "<Episode image>", // if available
      "published":   "<date>",
      "author":      "<Author name>",
      "duration":    120 // duration in seconds
      "categories":  [
        "Category"
      ],
      "enclosure": {
        "filesize": 5650889, // bytes
        "type":     "audio/mpeg",
        "url":      "<mp3 file>"
      }
    }
  ]
}
```

## Note for Windows users

Under the hood this depends on `expat` for RSS parsing. Apparently there are some issues here on Windows but i'm not sure what they are & not able to test on Windows. Your milage may vary..

## Generic RSS feeds

Use [node-feedparser](https://github.com/danmactough/node-feedparser)
