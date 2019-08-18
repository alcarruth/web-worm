// Generated by CoffeeScript 2.4.1
(function() {
  //!/usr/bin/env coffee
  // -*- coding: utf-8 -*-

  //  db_orm.coffee

  //-------------------------------------------------------------------------------

  //  Column definitions

  //  Each must have a '__method()' method (Yeah, I know. Sorry !-)
  //  which returns a method to be added to the @__Row_Class()
  //  definition in class Table, (q.v.)  It's convoluted but the
  //  end result is that each Table has a corresponding Row_Class
  //  method that is used to to create new Table_Rows from simple
  //  Javascript object such as that returned by a db query.

  var Back_Reference, Column, DB_ORM, Local_Method, Reference, SQL_Column, SQL_Date, SQL_Integer, SQL_String, Table, Table_Row,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  Column = class Column {
    constructor(spec) {
      this.__method = this.__method.bind(this);
      ({table_name: this.table_name, col_name: this.col_name, options: this.options} = spec);
    }

    __method() {
      var error;
      try {
        return this.__column_method();
      } catch (error1) {
        error = error1;
        return console.log(`Error in ${this.constructor.name} method.`);
      }
    }

  };

  Local_Method = class Local_Method extends Column {
    constructor(spec) {
      super(spec);
      this.__column_method = this.__column_method.bind(this);
      ({method: this.method} = this.options);
      this.sql_column = false;
    }

    __column_method() {
      boundMethodCheck(this, Local_Method);
      return this.method;
    }

  };

  Reference = class Reference extends Column {
    constructor(spec) {
      super(spec);
      this.__column_method = this.__column_method.bind(this);
      this.sql_column = false;
    }

    __column_method() {
      var col_name, table_name;
      boundMethodCheck(this, Reference);
      ({table_name, col_name} = this.options);
      return function() {
        var key, table;
        table = this.__db.tables[table_name];
        key = this.__obj[col_name];
        return table.find_by_primary_key(key);
      };
    }

  };

  Back_Reference = class Back_Reference extends Column {
    constructor(spec) {
      super(spec);
      this.__column_method = this.__column_method.bind(this);
      this.sql_column = false;
    }

    __column_method() {
      var col_name, table_name;
      boundMethodCheck(this, Back_Reference);
      ({table_name, col_name} = this.options);
      return function() {
        var table;
        table = this.__db.tables[table_name];
        return table.find_where(col_name, this.__id);
      };
    }

  };

  SQL_Column = class SQL_Column extends Column {
    constructor(options) {
      super(options);
      this.__column_method = this.__column_method.bind(this);
      this.sql_column = true;
    }

    __column_method() {
      var name;
      boundMethodCheck(this, SQL_Column);
      name = this.col_name;
      return function() {
        return this.__obj[name];
      };
    }

  };

  SQL_String = class SQL_String extends SQL_Column {};

  SQL_Integer = class SQL_Integer extends SQL_Column {};

  SQL_Date = class SQL_Date extends SQL_Column {};

  
  //-------------------------------------------------------------------------------
  // CLASS TABLE_ROW

  // Class Table_Row is the companion to class Table (below) A Table_Row
  // corresponds to a row in the in the PostgreSQL table.  Note that the
  // constructor requires a @__table argument.  Classes which extend
  // Table Row must call super(table) in order to link the row type to
  // the appropriate table instance.

  Table_Row = class Table_Row {
    constructor(__table, __obj) {
      this.simple_obj = this.simple_obj.bind(this);
      this.toJSON = this.toJSON.bind(this);
      this.toString = this.toString.bind(this);
      this.toHTML = this.toHTML.bind(this);
      this.__table = __table;
      this.__obj = __obj;
      this.__db = this.__table.__db;
      this.__id = this.__obj[this.__table.__primary_key];
      this.__unique_id = `${this.__table.__name}-${this.__id}`;
    }

    simple_obj() {
      var col, obj, ref, val;
      obj = {};
      ref = this.__obj;
      for (col in ref) {
        val = ref[col];
        obj[col] = val;
      }
      return obj;
    }

    toJSON() {
      return JSON.stringify(this.simple_obj());
    }

    toString() {
      return this.toJSON();
    }

    toHTML() {}

  };

  // some suitable default

  //-------------------------------------------------------------------------------
  // CLASS TABLE

  // A Table corresponds to a table in the PostgreSQL DB.

  Table = class Table {
    constructor(spec) {
      var column, name, ref;
      
      // TODO: insert into DB
      this.insert = this.insert.bind(this);
      this.__add_row = this.__add_row.bind(this);
      this.find_all = this.find_all.bind(this);
      this.find_by_id = this.find_by_id.bind(this);
      this.find_by_primary_key = this.find_by_primary_key.bind(this);
      this.find_one = this.find_one.bind(this);
      this.find_where = this.find_where.bind(this);
      this.__remove_row = this.__remove_row.bind(this);
      this.__db = spec.db;
      this.__name = spec.name;
      this.__method_names = ['find_by_id', 'find_by_primary_key', 'find_all', 'find_where'];
      this.__primary_key = spec.primary_key || 'id';
      this.__row_methods = {};
      ref = spec.columns;
      for (name in ref) {
        column = ref[name];
        this.__row_methods[name] = column.__method(name);
      }
      this.__Row_Class = this.__row_class(this);
      this.__rows = {};
      this.__unique_id = `table-${this.__name}`;
    }

    __row_class(table) {
      var __Row_Class;
      return __Row_Class = class __Row_Class extends Table_Row {
        constructor(obj) {
          var method, name, ref;
          super(table, obj);
          ref = table.__row_methods;
          for (name in ref) {
            method = ref[name];
            this[name] = method; //.bind(this)
          }
        }

      };
    }

    insert(obj) {
      var col, cols, error, k, text, v, values;
      cols = (function() {
        var ref, results;
        ref = this.__sql_columns;
        results = [];
        for (k in ref) {
          v = ref[k];
          results.push(k);
        }
        return results;
      }).call(this);
      text = `insert into ${this.__name}(${cols.join(',')})`;
      values = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = cols.length; i < len; i++) {
          col = cols[i];
          results.push(obj[col]);
        }
        return results;
      })();
      console.log(`Trying query:\n  text: "${text}"\n  values: [ ${values} ]\n`);
      try {

      } catch (error1) {
        // db.query(text, values)
        error = error1;
        return console.log(error.message);
      }
    }

    __add_row(obj) {
      var row;
      row = new this.__Row_Class(obj);
      return this.__rows[row.get_primary_key()] = row;
    }

    async find_all() {
      var error, row, rows, text, values;
      try {
        text = `select * from ${this.__name}`;
        values = [];
        rows = this.__db.query(text, values);
        return (await (async function() {
          var i, len, ref, results;
          ref = (await rows);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            row = ref[i];
            results.push(new this.__Row_Class(row));
          }
          return results;
        }).call(this));
      } catch (error1) {
        error = error1;
        return console.log(error.message);
      }
    }

    find_by_id(id) {
      return this.find_one('id', id);
    }

    find_by_primary_key(val) {
      return this.find_one(this.__primary_key, val);
    }

    async find_one(col, val) {
      return ((await this.find_where(col, val)))[0];
    }

    async find_where(col, val) {
      var error, row, rows, text, values;
      try {
        text = `select * from ${this.__name} where ${col} = $1 `;
        values = [val];
        rows = (await this.__db.query(text, values));
        return (await (async function() {
          var i, len, ref, results;
          ref = (await rows);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            row = ref[i];
            results.push(new this.__Row_Class(row));
          }
          return results;
        }).call(this));
      } catch (error1) {
        error = error1;
        return console.log(error.message);
      }
    }

    __remove_row(id) {
      return delete this.__rows[id];
    }

  };

  DB_ORM = (function() {
    //-------------------------------------------------------------------------------
    // CLASS DB_ORM

    class DB_ORM {
      constructor(db_obj) {
        this.query = this.query.bind(this);
        this.init_tables = this.init_tables.bind(this);
        this.add_table = this.add_table.bind(this);
        this.db_obj = db_obj;
        this.init_tables();
      }

      query(text, values) {
        return this.db_obj.query(text, values);
      }

      async init_tables() {
        var def, name, ref, results;
        this.db_schema = this.db_obj.get_db_schema();
        this.tables = {};
        ref = (await this.db_schema);
        results = [];
        for (name in ref) {
          def = ref[name];
          results.push(this.add_table(name, def));
        }
        return results;
      }

      add_table(table_name, table_def) {
        var Column_Class, col_def, col_name, columns, k, options, primary_key, type, v;
        columns = {};
        for (col_name in table_def) {
          col_def = table_def[col_name];
          // should be just one key and value
          [type, options] = ((function() {
            var results;
            results = [];
            for (k in col_def) {
              v = col_def[k];
              results.push([k, v]);
            }
            return results;
          })())[0];
          if (options.primary_key) {
            primary_key = col_name;
          }
          Column_Class = this.column_Class[type];
          columns[col_name] = new Column_Class({
            table_name: table_name,
            col_name: col_name,
            options: options
          });
        }
        return this.tables[table_name] = new Table({
          db: this,
          name: table_name,
          primary_key: primary_key || 'id',
          columns: columns
        });
      }

    };

    // map DB_WORM column definition to class
    DB_ORM.prototype.column_Class = {
      string: SQL_String,
      integer: SQL_Integer,
      date: SQL_Date,
      reference: Reference,
      back_reference: Back_Reference,
      local_method: Local_Method
    };

    return DB_ORM;

  }).call(this);

  exports.DB_ORM = DB_ORM;

}).call(this);