'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    CREATE TABLE ck_canvas (
      color smallint
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE ck_canvas CASCADE;
  `);
};

exports._meta = {
  version: 1
};
