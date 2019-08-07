#!/usr/bin/env node

db_orm = require('./js/db_orm')
db_rmi = require('./js/db_rmi')

exports.DB_ORM = db_orm.DB_ORM
exports.DB_RMI_Server = db_rmi.DB_App_Server 
exports.DB_RMI_Client = db_rmi.DB_App_Client



