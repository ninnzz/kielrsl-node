var env = "development";
module.exports = process.env.DREAM_COV
  ? require('./lib-cov/kiel_auth')
  : require('./lib/kiel_auth');