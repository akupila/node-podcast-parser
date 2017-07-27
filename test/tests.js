const path   = require('path');
const fs     = require('fs');
const expect = require('expect.js');
const parse  = require('./../index');

describe('Podcast feed parser', () => {

  const fixtures = {};

  before(function(done) {
    const fixturePath = path.join(__dirname, 'fixtures');
    fs.readdir(fixturePath, (err, files) => {
      if (err) {
        return done(err);
      }

      files
        .filter(name => fs.statSync(path.join(fixturePath, name)).isFile())
        .forEach(name => {
          var fileContent;
          try {
            fileContent = fs.readFileSync(path.join(fixturePath, name)).toString();
          } catch (readError) {
            done(readError);
            return;
          }

          fixtures[name.substr(0, name.indexOf('.'))] = fileContent;
        });

      done();
    });
  });

  it('should return expected format', function(done) {
    parse(fixtures['apple-example'], (err, data) => {
      if (err) {
        return done(err);
      }

      expect(data).to.have.property('title');
      expect(data).to.have.property('link');
      expect(data).to.have.property('language');
      expect(data).to.have.property('description');
      expect(data.description).to.have.property('short');
      expect(data.description).to.have.property('long');
      expect(data).to.have.property('image');
      expect(data).to.have.property('categories');
      expect(data).to.have.property('owner');
      expect(data).to.have.property('updated');
      expect(data).to.have.property('episodes');

      expect(data.title).to.be.a('string');
      expect(data.link).to.be.a('string');
      expect(data.language).to.be.a('string');
      expect(data.description.short).to.be.a('string');
      expect(data.description.long).to.be.a('string');
      expect(data.image).to.be.a('string');
      expect(data.categories).to.be.an(Array);
      expect(data.updated).to.be.a(Date);
      expect(data.episodes).to.be.an(Array);

      expect(data.owner).to.have.property('name');
      expect(data.owner).to.have.property('email');

      const episode = data.episodes[0];
      expect(episode).to.have.property('guid');
      expect(episode).to.have.property('title');
      expect(episode).to.have.property('description');
      expect(episode).to.have.property('published');
      expect(episode).to.have.property('image');
      expect(episode).to.have.property('duration');
      expect(episode).to.have.property('enclosure');

      expect(episode.guid).to.be.a('string');
      expect(episode.title).to.be.a('string');
      expect(episode.description).to.be.a('string');
      expect(episode.published).to.be.a(Date);
      expect(episode.image).to.be.a('string');
      expect(episode.duration).to.be.a('number');

      expect(episode.enclosure).to.have.property('filesize');
      expect(episode.enclosure).to.have.property('type');
      expect(episode.enclosure).to.have.property('url');

      done();
    });
  });

  it('should parse apple feed', function(done) {
    parse(fixtures['apple-example'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'All About Everything',
        description: {
          short: 'A show about everything',
          long: 'All About Everything is a show about everything. Each week we dive into any subject known to man and talk about it as much as we can. Look for our podcast in the Podcasts app or in the iTunes Store',
        },
        link: 'http://www.example.com/podcasts/everything/index.html',
        image: 'http://example.com/podcasts/everything/AllAboutEverything.jpg',
        language: 'en-us',
        updated: utcDate(2014, 5, 15, 19, 0, 0),
        owner: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        categories: [
          'Technology',
          'Technology>Gadgets',
          'TV & Film',
        ]
      });

      expect(data.episodes).to.have.length(3);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'http://example.com/podcasts/archive/aae20140615.m4a',
        title: 'Shake Shake Shake Your Spices',
        published: utcDate(2014, 5, 15, 19, 0, 0),
        image: 'http://example.com/podcasts/everything/AllAboutEverything/Episode1.jpg',
        duration: 424,
        enclosure: {
          filesize: 8727310,
          type: 'audio/x-m4a',
          url: 'http://example.com/podcasts/everything/AllAboutEverythingEpisode3.m4a'
        }
      });

      done();
    });
  });

  it('should parse javascript air feed', function(done) {
    parse(fixtures['javascript-air'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'JavaScript Air',
        description: {
          short: 'The live broadcast podcast all about JavaScript',
          long: 'The live broadcast podcast all about JavaScript and the Web',
        },
        link: 'http://javascriptair.podbean.com',
        image: 'http://imglogo.podbean.com/image-logo/862611/2048.png',
        language: 'en-us',
        updated: utcDate(2016, 0, 28, 0, 21, 35),
        ttl: 1440,
        owner: {
          name: 'Kent C. Dodds',
          email: 'javascriptair@gmail.com'
        },
        categories: [
          'Technology',
          'Technology>Podcasting'
        ]
      });

      expect(data.episodes).to.have.length(8);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'http://audio.javascriptair.com/e/007-jsair-chakra-microsofts-open-source-javascript-engine-with-ed-maurer-gaurav-seth-and-steve-lucco/',
        title: '007 jsAir - Chakra, Microsoft’s Open Source JavaScript Engine with Ed Maurer, Gaurav Seth, and Steve Lucco',
        published: utcDate(2016, 0, 28, 0, 21, 35),
        // no image
        duration: 3550,
        enclosure: {
          filesize: 56787979,
          type: 'audio/mpeg',
          url: 'http://javascriptair.podbean.com/mf/feed/dk3eif/JavaScriptAirEpisode007-ChakraMicrosoftsOpenSourceJavaScriptEngine.mp3'
        },
        categories: [
          'Uncategorized'
        ]
      });

      done();
    });
  });

  it('should parse scale your code feed', function(done) {
    parse(fixtures['scale-your-code'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'Scale Your Code Podcast',
        description: {
          short: 'Interviews of proven developers',
          long: 'Learn from proven developers through interviews.',
        },
        link: 'https://scaleyourcode.com/',
        image: 'http://d1ngwfo98ojxvt.cloudfront.net/public/itunes/cover_art.jpg',
        language: 'en-us',
        updated: utcDate(2016, 1, 2, 1, 5, 26),
        owner: {
          name: 'Christophe Limpalair',
          email: 'chris@scaleyourcode.com'
        },
        categories: [
          'Technology'
        ]
      });

      expect(data.episodes).to.have.length(23);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'https://d1ngwfo98ojxvt.cloudfront.net/public/mp3/interviews/jack_levin_23.mp3',
        title: 'Large scale image processing on the fly in 25ms with Google\'s first Network Engineer',
        published: utcDate(2016, 1, 2, 1, 5, 26),
        image: 'https://d1ngwfo98ojxvt.cloudfront.net/images/interviews/jack_levin/jack-levin_opt_hi.jpg',
        // no duration
        enclosure: {
          filesize: undefined, // filesize not set
          type: 'audio/x-mp3',
          url: 'https://d1ngwfo98ojxvt.cloudfront.net/public/mp3/interviews/jack_levin_23.mp3'
        },
        // no categories
      });

      done();
    });
  });

  it('should parse rtve-podcast feed', function(done) {
    parse(fixtures['rtve-podcast'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

       expect(podcast).to.eql({
         title: 'Tiempo de valientes. El diario de Julián Martínez',
        description: {
          long: 'Al final del capítulo 9 de El Ministerio del Tiempo, vimos a Julián Martínez huir del ministerio por una puerta. ¿Qué sucedió con él? ¿Volverá? Descúbrelo en el diario sonoro de Julián Martínez en Cuba, la ficción sonora de RTVE.ES, Radio Nacional, Onza Entertainment y Cliffhanger TV protagonizada por Rodolfo Sancho.',
        },
        link: 'http://www.rtve.es/alacarta/audios/tiempo-de-valientes-el-diario-de-julian-martinez/',
        image: 'http://img.rtve.es/imagenes/tiempo-valientes-diario-julian-martinez/1455556336980.jpg',
        language: 'es-es',
        updated: utcDate(2016, 4, 17, 12, 08, 49),
        owner: {

        },
        categories: [
        ]
      });

      done();
    });
  });


  it('should parse se-radio feed', function(done) {
    parse(fixtures['se-radio'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'Software Engineering Radio - The Podcast for Professional Software Developers',
        description: {
          short: 'Information for Software Developers and Architects',
          long: 'Software Engineering Radio is a podcast targeted at the professional software developer. The goal is to be a lasting educational resource, not a newscast. Every 10 days, a new episode is published that covers all topics software engineering. Episodes are either tutorials on a specific topic, or an interview with a well-known character from the software engineering world. All SE Radio episodes are original content — we do not record conferences or talks given in other venues. Each episode comprises two speakers to ensure a lively listening experience. SE Radio is an independent and non-commercial organization. All content is licensed under the Creative Commons 2.5 license.',
        },
        link: 'http://www.se-radio.net',
        image: 'http://media.computer.org/sponsored/podcast/se-radio/se-radio-logo-1400x1475.jpg',
        language: 'en-us',
        updated: utcDate(2016, 0, 28, 18, 6, 52),
        owner: {
          name: 'SE-Radio Team',
          email: 'team@se-radio.net'
        },
        categories: [
          'Technology',
          'Technology>Software How-To'
        ]
      });

      expect(data.episodes).to.have.length(249);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'http://www.se-radio.net/?p=1939',
        title: 'SE-Radio Episode 248: Axel Rauschmayer on JavaScript and ECMAScript 6',
        published: utcDate(2016, 0, 28, 18, 6, 52),
        image: 'http://media.computer.org/sponsored/podcast/se-radio/se-radio-logo-1400x1475.jpg',
        duration: 3793,
        enclosure: {
          filesize: 151772209,
          type: 'audio/mpeg',
          url: 'http://feedproxy.google.com/~r/se-radio/~5/_V8a9ATpdxk/SE-Radio-Episode-248-Axel-Rauschmayer-on-JavaScript-and-ECMAScript-6.mp3'
        },
        categories: [
          'Episodes',
          'ECMAScript',
          'JavaScript'
        ]
      });

      done();
    });
  });

  it('should parse design details feed', function(done) {
    parse(fixtures['design-details'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'Design Details',
        description: {
          short: 'A show about the people who design our favorite products.',
          long: 'A show about the people who design our favorite products. Hosted by Bryn Jackson and Brian Lovin.',
        },
        link: 'http://spec.fm/show/design-details',
        image: 'https://media.simplecast.com/podcast/image/1034/1452553074-artwork.jpg',
        language: 'en-us',
        updated: utcDate(2016, 1, 1, 13, 0, 0),
        owner: {
          name: 'Spec.FM',
          email: 'designdetailsfm@gmail.com'
        },
        categories: [
          'Technology',
          'Arts',
          'Arts>Design',
          'Technology>Podcasting'
        ]
      });

      expect(data.episodes).to.have.length(102);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'ea43eba3-3a9e-4593-a69b-1a78465d9e76',
        title: '100: Goldilocks Fidelity (feat. Daniel Burka)',
        published: utcDate(2016, 1, 1, 13, 0, 0),
        image: 'https://media.simplecast.com/episode/image/25164/1454282072-artwork.jpg',
        duration: 3932,
        enclosure: {
          filesize: 62948884,
          type: 'audio/mpeg',
          url: 'https://audio.simplecast.com/25164.mp3'
        },
        // no categories
      });

      done();
    });
  });

  it('should parse neo4j feed', function(done) {
    parse(fixtures['neo4j'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'Podcast on Graph Databases and Neo4j',
        description: {
          short: 'Podcast by The Neo4j Graph Database Community',
          long: 'Podcast by The Neo4j Graph Database Community',
        },
        link: 'http://blog.bruggen.com',
        image: 'http://i1.sndcdn.com/avatars-000135096101-qekfg1-original.png',
        language: 'en-us',
        ttl: 60,
        updated: utcDate(2016, 0, 29, 8, 44, 0),
        owner: {
          name: 'Graphistania',
          email: 'rik@neotechnology.com'
        },
        categories: [
          'Technology'
        ]
      });

      expect(data.episodes).to.have.length(54);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'tag:soundcloud,2010:tracks/244374452',
        title: 'Podcast Interview With Stuart Begg And Matt Byrne, Independent Contractors at Sensis',
        published: utcDate(2016, 0, 29, 0, 0, 0),
        image: 'http://i1.sndcdn.com/avatars-000135096101-qekfg1-original.png',
        duration: 638,
        enclosure: {
          filesize: 6381794,
          type: 'audio/mpeg',
          url: 'http://www.podtrac.com/pts/redirect.mp3/feeds.soundcloud.com/stream/244374452-graphistania-podcast-recording-with-stuart-begg-and-matt-byrne-independent-contractors-at-sensis.mp3'
        },
        // no categories
      });

      done();
    });
  });

  it('should parse complex genres', function(done) {
    parse(fixtures['complex-genre'], (err, data) => {
      if (err) {
        return done(err);
      }

      expect(data.categories).to.eql([
        'A',
        'A>A1',
        'A>A1>A11',
        'A>A1>A11>A111',
        'A>A2',
        'B',
        'B>B1',
        'B>B2',
        'B>B2>B21'
      ]);

      done();
    });
  });

  it('should call callback', function(done) {
    parse(fixtures['apple-example'], (err) => {
      if (!err) {
        return done(err);
      }

      done();
    });
  });

  it('should callback with error', function(done) {
    parse('invalid xml', (err) => {
      if (err) {
        return done();
      }

      done('Error was not set');
    });
  });
});

// -----------------------------------------------------
//
// Helpers

function utcDate(year, month, day, hour, minute, second) {
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}
