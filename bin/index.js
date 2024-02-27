#!/usr/bin/env node
const { I18nCommand } = require('../dist/commands/index');
const command = process.argv[2];
const i18n = new I18nCommand(command)
i18n.run()