# node-podcast-parser

Parses a podcast RSS feed and returns easy to use result

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

## I want to parse Generic RSS feeds

Use [node-feedparser](https://github.com/danmactough/node-feedparser)
