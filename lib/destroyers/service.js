"use strict";

var fs        = require('fs-extra');
var format    = require('./../formatters');
var templates = require('../templates');

module.exports = function (name) {
  name = format.checkName('service', name);
  if (!name) return;

  var subdirectories = name.split('/');
  name = subdirectories.pop();

  var serviceName         = format.toServiceName(name);
  var serviceFileName     = format.toJSFileName(serviceName);
  var serviceSpecFileName = format.toJSFileName(serviceName + '_spec');

  subdirectories = format.parentPath(subdirectories);

  templates.destroyFile('app/services/' + subdirectories + serviceFileName);
  templates.destroyFile('test/unit/services/' + serviceSpecFileName);
  templates.destroyDirectoryIfEmpty('app/services/' + subdirectories);
  templates.destroyDirectoryIfEmpty('test/unit/services/' + subdirectories);
  console.log('');
};
