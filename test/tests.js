const path   = require('path');
const fs     = require('fs');
const expect = require('expect.js');
const parse  = require('./../index');

describe('Podcast feed parser', () => {

  const fixtures = {};

  before(done => {
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

  it('should parse feed', done => {
    parse(fixtures['apple-example'], (err, data) => {
      if (err) {
        return done(err);
      }

      try {
        expect(data).to.have.property('title');
        expect(data).to.have.property('link');
        expect(data).to.have.property('language');
        expect(data).to.have.property('subtitle');
        expect(data).to.have.property('description');
        expect(data).to.have.property('image');
        expect(data).to.have.property('copyright');
        expect(data).to.have.property('categories');
        expect(data).to.have.property('explicit');
        expect(data).to.have.property('owner');
        expect(data.owner).to.have.property('name');
        expect(data.owner).to.have.property('email');
        expect(data).to.have.property('episodes');
        expect(data.episodes).to.be.an(Array);

        const episode = data.episodes[0];
        expect(episode).to.have.property('guid');
        expect(episode).to.have.property('title');
        expect(episode).to.have.property('description');
        expect(episode).to.have.property('published');
        expect(episode).to.have.property('image');
        expect(episode).to.have.property('author');
        expect(episode).to.have.property('duration');
        expect(episode).to.have.property('categories');
        expect(episode).to.have.property('enclosure');
        expect(episode.categories).to.be.an(Array);
        expect(episode.enclosure).to.have.property('filesize');
        expect(episode.enclosure).to.have.property('type');
        expect(episode.enclosure).to.have.property('url');
        expect(episode.published).to.be.a(Date);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should parse apple feed', done => {
    parse(fixtures['apple-example'], (err, data) => {
      if (err) {
        return done(err);
      }

      expect(data.title).to.equal('All About Everything');
      expect(data.link).to.equal('http://www.example.com/podcasts/everything/index.html');
      expect(data.language).to.equal('en-us');
      expect(data.copyright).to.equal('℗ & © 2014 John Doe & Family');
      expect(data.subtitle).to.equal('A show about everything');
      expect(data.description).to.equal('All About Everything is a show about everything. Each week we dive into any subject known to man and talk about it as much as we can. Look for our podcast in the Podcasts app or in the iTunes Store');
      expect(data.owner.name).to.equal('John Doe');
      expect(data.owner.email).to.equal('john.doe@example.com');
      expect(data.image).to.equal('http://example.com/podcasts/everything/AllAboutEverything.jpg');
      expect(data.categories).to.eql([{
        name: 'Technology',
        children: [{
          name: 'Gadgets'
        }]
      }, {
        name: 'TV & Film'
      }]);
      expect(data.explicit).to.equal(false);
      expect(data.episodes).to.have.length(3);

      const firstEpisode = data.episodes[0];
      expect(firstEpisode.title).to.equal('Shake Shake Shake Your Spices');
      expect(firstEpisode.author).to.equal('John Doe');
      expect(firstEpisode.image).to.equal('http://example.com/podcasts/everything/AllAboutEverything/Episode1.jpg');
      expect(firstEpisode.guid).to.equal('http://example.com/podcasts/archive/aae20140615.m4a');
      expect(firstEpisode.enclosure.filesize).to.equal(8727310);
      expect(firstEpisode.enclosure.type).to.equal('audio/x-m4a');
      expect(firstEpisode.enclosure.url).to.equal('http://example.com/podcasts/everything/AllAboutEverythingEpisode3.m4a');

      done();
    });
  });

  it('should parse javascript air feed', done => {
    parse(fixtures['javascript-air'], (err, data) => {
      if (err) {
        return done(err);
      }

      expect(data.title).to.equal('JavaScript Air');
      expect(data.link).to.equal('http://javascriptair.podbean.com');
      expect(data.language).to.equal('en');
      expect(data.copyright).to.equal('Copyright 2015 All rights reserved.');
      expect(data.subtitle).to.equal('The live broadcast podcast all about JavaScript');
      expect(data.description).to.equal('The live broadcast podcast all about JavaScript and the Web');
      expect(data.owner.name).to.equal('Kent C. Dodds');
      expect(data.owner.email).to.equal('javascriptair@gmail.com');
      expect(data.image).to.equal('http://imglogo.podbean.com/image-logo/862611/2048.png');
      expect(data.categories).to.eql([{
        name: 'Technology',
        children: [{
          name: 'Podcasting'
        }]
      }]);
      expect(data.explicit).to.equal(false);
      expect(data.episodes).to.have.length(8);

      const firstEpisode = data.episodes[0];
      expect(firstEpisode.title).to.equal('007 jsAir - Chakra, Microsoft’s Open Source JavaScript Engine with Ed Maurer, Gaurav Seth, and Steve Lucco');
      expect(firstEpisode.author).to.equal('Kent C. Dodds');
      expect(firstEpisode.image).to.equal(null);
      expect(firstEpisode.guid).to.equal('http://audio.javascriptair.com/e/007-jsair-chakra-microsofts-open-source-javascript-engine-with-ed-maurer-gaurav-seth-and-steve-lucco/');
      expect(firstEpisode.enclosure.filesize).to.equal(56787979);
      expect(firstEpisode.enclosure.type).to.equal('audio/mpeg');
      expect(firstEpisode.enclosure.url).to.equal('http://javascriptair.podbean.com/mf/feed/dk3eif/JavaScriptAirEpisode007-ChakraMicrosoftsOpenSourceJavaScriptEngine.mp3');

      done();
    });
  });

  it('should parse scale your code feed', done => {
    parse(fixtures['scale-your-code'], (err, data) => {
      if (err) {
        return done(err);
      }

      expect(data.title).to.equal('Scale Your Code Podcast');
      expect(data.link).to.equal('https://scaleyourcode.com/');
      expect(data.language).to.equal('en-us');
      expect(data.copyright).to.equal('℗ & © 2015 ScaleYourCode');
      expect(data.subtitle).to.equal('Interviews of proven developers');
      expect(data.description).to.equal('Learn from proven developers through interviews.');
      expect(data.owner.name).to.equal('Christophe Limpalair');
      expect(data.owner.email).to.equal('chris@scaleyourcode.com');
      expect(data.image).to.equal('http://d1ngwfo98ojxvt.cloudfront.net/public/itunes/cover_art.jpg');
      expect(data.categories).to.eql([{
        name: 'Technology'
      }]);
      expect(data.explicit).to.equal(true);
      expect(data.episodes).to.have.length(23);

      const firstEpisode = data.episodes[0];
      expect(firstEpisode.title).to.equal('Large scale image processing on the fly in 25ms with Google\'s first Network Engineer');
      expect(firstEpisode.author).to.equal('Christophe Limpalair');
      expect(firstEpisode.image).to.equal('https://d1ngwfo98ojxvt.cloudfront.net/images/interviews/jack_levin/jack-levin_opt_hi.jpg');
      expect(firstEpisode.guid).to.equal('https://d1ngwfo98ojxvt.cloudfront.net/public/mp3/interviews/jack_levin_23.mp3');
      expect(firstEpisode.enclosure.filesize).to.equal(undefined);
      expect(firstEpisode.enclosure.type).to.equal('audio/x-mp3');
      expect(firstEpisode.enclosure.url).to.equal('https://d1ngwfo98ojxvt.cloudfront.net/public/mp3/interviews/jack_levin_23.mp3');

      done();
    });
  });

  it('should parse complex genres', function(done) {
    parse(fixtures['complex-genre'], (err, data) => {
      if (err) {
        return done(err);
      }

      try {
        expect(data.categories).to.eql([{
          name: 'A1',
          children: [{
            name: 'B1',
            children: [{
              name: 'C1'
            }]
          }, {
            name: 'B2'
          }, {
            name: 'B3',
            children: [{
              name: 'C1'
            }, {
              name: 'C2'
            }, {
              name: 'C3',
              children: [{
                name: 'D1'
              }]
            }]
          }]
        }]);
      } catch (error) {
        return done(error);
      }

      done();
    });
  });

  it('should run 100 iterations per sec', function() {
    this.timeout(1000);
    this.slow(1000); // allow 20ms per iteration
    const n = 100;
    for (var i = 0 ; i < n; i++) {
      parse(fixtures['javascript-air'], err => {
        if (err) {
          throw new Error(err);
        }
      });
    }
  });

  describe('node callback', () =>{
    it('should call callback', done => {
      parse(fixtures['apple-example'], (err) => {
        if (!err) {
          return done(err);
        }

        done();
      });
    });

    it('should callback with error', done => {
      parse('invalid xml', (err, data) => {
        if (err) {
          return done();
        }

        done('Error was not set');
      });
    });
  });
});
