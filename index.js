const _ = require('lodash');
const expat = require('node-expat');

module.exports = function parse(feedXML, callback) {
  const parser = new expat.Parser('UTF-8');

  // -----------------------------------------------------

  const result = {
    explicit: false,
    categories: [],
    episodes: []
  };
  var node = null;

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

    if (name === 'channel') {
      // root channel
      node.target = result;
      node.textMap = {
        'title': true,
        'link': true,
        'language': text => {
          var lang = text;
          if (!/\w\w-\w\w/i.test(text)) {
            if (lang === 'en') {
              // sloppy language does not conform to ISO 639
              lang = 'en-us';
            } else {
              // de-de etc
              lang = `${lang}-${lang}`;
            }
          }
          return { language: lang.toLowerCase() }; },
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
      const path = [attrs.text];
      var tmp = node.parent;
      // go up to fill in parent categories
      while (tmp && tmp.name === 'itunes:category') {
        path.unshift(tmp.attrs.text);
        tmp = tmp.parent;
      }

      result.categories.push(path.join('>'));
    } else if (name === 'item' && node.parent.name === 'channel') {
      // New item
      tmpEpisode = {
        // optional field have reasonable defaults
        image: null,
        categories: [],
        explicit: false
      };
      node.target = tmpEpisode;
      node.textMap = {
        'title': true,
        'guid': true,
        'itunes:summary': 'description',
        'pubDate': text => { return { published: new Date(text) }; },
        'itunes:author': 'author',
        'itunes:duration': text => {
          return {
            // parse '1:03:13' into 3793 seconds
            duration: text
              .split(':')
              .reverse()
              .reduce((acc, val, index) => {
                const steps = [60, 60, 24];
                var muliplier = 1;
                while (index--) {
                  muliplier *= steps[index];
                }
                return acc + parseInt(val) * muliplier;
              }, 0)
          };
        },
        'itunes:author': 'author',
        'itunes:explicit': text => { return { explicit: text === 'yes' }; }
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

    if (tmpEpisode && name === 'item') {
      result.episodes.push(tmpEpisode);
      tmpEpisode = null;
    }

    if (node === null) {
      result.categories = _.uniq(result.categories.sort());

      callback(null, result);
    }
  })

  parser.on('text', function (text) {
    text = text.trim();
    if (text.length === 0) {
      return;
    }

    /* istanbul ignore if */
    if (!node || !node.parent) {
      // This should never happen but it's here as a safety net
      // I guess this might happen if a feed was incorrectly formatted
      return;
    }

    if (node.parent.textMap) {
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

    if (tmpEpisode && node.name === 'category') {
      tmpEpisode.categories.push(text);
    }
  })

  parser.on('error', function (error) {
    callback(error, result);
  });

  parser.write(feedXML);
}
