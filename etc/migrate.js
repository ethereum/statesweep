var fs = require('fs')
var path = './eip161.db'
try {
  fs.unlinkSync(path)
} catch(err) {
  console.error(err)
}

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: path,
  },
  useNullAsDefault: true,
});


knex.schema.createTable('empties', function (table) {
  table.increments();
  table.binary('address', 20);
  table.binary('addressHash', 32);
  table.binary('creation_contract', 32);
  table.integer('creation_block_num');
  table.boolean('is_deleted');
  table.index('addressHash');

}).then(console.log("CREATED empties"))

knex.schema.createTable('globals', function (table) {
  table.increments();
  table.integer('totalAccounts');
  table.integer('emptyAccounts'); //sum other table for sanity check
}).then("CREATED globals")

knex.schema.hasTable('empties').then(console.log)
knex.schema.hasTable('globals').then(console.log)

knex('globals').insert({'id': 1, 'totalAccounts': 0, 'emptyAccounts': 0}).then()
