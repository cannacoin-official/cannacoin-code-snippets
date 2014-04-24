/* A "Hello World" example of using node-cannacoin to access
 * cannacoind via JSON-RPC. Retreives the current wallet balance.
 *
 * Either run cannacoind directly or run cannacoin-qt with the -server
 * command line option. Make sure you have a ~/.cannacoin/cannacoin.conf
 * with rpcuser and rpcpassword config values filled out. Note that
 * newer versions of cannacoin (1.5 and above) don't allow identical
 * your rpc username and password to be identical.
 *
 */

/* Copy config.json.template to config.json and fill in your
 * rpc username and password. */
var config = require('config');

var cannacoin = require('node-cannacoin')({
      host: config.rpchost,
      port: config.rpcport,
      user: config.rpcuser,
      pass: config.rpcpassword
    });

cannacoin.getBalance(function(err, balance) {
  if (err) {
    return console.error('Failed to fetch balance', err.message);
  }
  console.log('CCN balance is', balance);
});
