Output:

```json
{
  "title":       "<Podcast title>",
  "description": "<Podcast subtitle>",
  "description": "<Podcast description>",
  "image":       "<Podcast image>",
  "link":        "<Podcast link>",
  "language":    "<ISO 639 language>", // http://www.loc.gov/standards/iso639-2/php/code_list.php
  "copyright":   "<Podcast copyright>",
  "categories": [{
    name: 'Technology',
    children: [{
      name: 'Podcasting'
    }]
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
      "image":       "<Episode image>",
      "published":   "<date>",
      "author":      "<Author name>",
      "duration":    120 // duration in seconds
      "categories":  [
        "<Category>"
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
