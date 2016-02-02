const expat = require('node-expat')
const recursivelyRemoveKeys = require('./lib/recursivelyRemoveKeys');

module.exports = function parse(feedXML, callback) {
  const parser = new expat.Parser('UTF-8');

  // -----------------------------------------------------

  const result = {
    explicit: false,
    categories: [],
    episodes: []
  };
  var node = null;

  var tmpCategory;
  var tmpEpisode;

  parser.on('startElement', function (name, attrs) {
    node = {
      name: name,
      attrs: attrs,
      parent: node
    };

    if (!node.parent) {
      return;
    }

    // console.log(`${node.parent.name} -> ${name}`);

    if (name === 'channel') {
      // root channel
      node.target = result;
      node.textMap = {
        'title': true,
        'link': true,
        'language': true,
        'copyright': true,
        'itunes:subtitle': 'subtitle',
        'description': true,
        'itunes:explicit': text => { return { explicit: text === 'yes' }}
      };
    } else if (node.name === 'itunes:image' && node.parent.name === 'channel') {
      result.image = attrs.href;
    } else if (node.name === 'itunes:owner' && node.parent.name === 'channel') {
      result.owner = node.target = {};
      node.textMap = {
        'itunes:name': 'name',
        'itunes:email': 'email'
      };
    } else if (name === 'itunes:category') {
      if (node.parent.name === 'channel') {
        // root category
        tmpCategory = {
          name: attrs.text
        };
      } else if (node.parent.name === 'itunes:category') {
        // sub category
        if (tmpCategory) {
          if (!tmpCategory.children) tmpCategory.children = [];
          const subCategory = {
            name: attrs.text,
            parent: tmpCategory
          };
          tmpCategory.children.push(subCategory);
          tmpCategory = subCategory;
        }
      } else {
        // throw away stray genre
      }
    } else if (name === 'item' && node.parent.name === 'channel') {
      // New item
      tmpEpisode = {
        image: null,   // optional
        categories: [] // optional
      };
      node.target = tmpEpisode;
      node.textMap = {
        'title': true,
        'guid': true,
        'itunes:summary': 'description',
        'pubDate': text => { return { published: new Date(text) }; },
        'author': true,
        'itunes:duration': text => { return { duration: parseInt(text) }; },
        'itunes:author': 'author'
      };
    } else if (tmpEpisode) {
      // Episode specific attributes
      if (name === 'itunes:image') {
        // episode image
        tmpEpisode.image = attrs.href;
      } else if (name === 'enclosure') {
        tmpEpisode.enclosure = {
          filesize: attrs.length ? parseInt(attrs.length) : undefined,
          type: attrs.type,
          url: attrs.url
        };
      }
    }
  });

  parser.on('endElement', function (name) {
    node = node.parent;

    if (name === 'itunes:category') {
      if (tmpCategory && tmpCategory.parent) {
        tmpCategory = tmpCategory.parent;
      } else {
        result.categories.push(tmpCategory);
        tmpCategory = null;
      }
    } else if (tmpEpisode && name === 'item') {
      result.episodes.push(tmpEpisode);
      tmpEpisode = null;
    }

    if (node === null) {
      result.categories = recursivelyRemoveKeys(result.categories, 'children', ['parent']);

      callback(null, result);
    }
  })

  parser.on('text', function (text) {
    text = text.trim();
    if (text.length === 0) {
      return;
    }

    if (node && node.parent && node.parent.textMap) {
      const key = node.parent.textMap[node.name];
      if (key) {
        if (typeof key === 'function') {
          // value preprocessor
          Object.assign(node.parent.target, key(text));
        } else {
          const keyName = key === true ? node.name : key;
          const prevValue = node.parent.target[keyName];
          // ontext can fire multiple times, if so append to previous value
          // this happens with "text &amp; other text"
          node.parent.target[keyName] = prevValue ? `${prevValue} ${text}` : text;
        }
      }
    }
  })

  parser.on('error', function (error) {
    callback(error, result);
  });

  parser.write(feedXML);
}
