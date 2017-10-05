// Load modules

var Code = require('code');
var Lab = require('lab');
var Server = require('../lib');
var Path = require('path');

// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var expect = Code.expect;
var it = lab.test;


describe('/ops/healthcheck', function () {

  it('returns ok', function (done) {

    Server.init(internals.manifest, internals.composeOptions, function (err, server) {

      expect(err).to.not.exist();

      server.inject('/ops/healthcheck', function (res) {

        expect(res.statusCode).to.equal(200);
        expect(res.result).to.deep.equal({ message: 'ok' });

        server.stop(done);
      });
    });
  });
});

internals.manifest = {
  connections: [
    {
      port: 0
    }
  ],
  plugins: {
    './healthcheck': {}
  }
};

internals.composeOptions = {
  relativeTo: Path.resolve(__dirname, '../lib')
};
