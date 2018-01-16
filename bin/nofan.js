#!/usr/bin/env node

const Nofan = require('../lib/nofan')
const program = require('commander')
const ora = require('ora')
const updateNotifier = require('update-notifier')
const pkg = require('../package')
const pm2 = require('../lib/pm2')

updateNotifier({pkg}).notify()

program
  .option('-v, --version', 'Output the version info')
  .option('-t, --time', 'Show time ago tag')
  .option('--no-photo-tag', 'Hide photo tag')
  .version(Nofan.version())

program
  .command('config [consumer_key] [consumer_secret]')
  .option('-a, --all', 'Show all config')
  .description('Config consumer key and consumer secret')
  .action(function (key, secret, options) {
    const showAll = options.all
    Nofan.config(key, secret, showAll)
  })

program
  .command('colors')
  .alias('color')
  .description('Customize color style')
  .action(function () {
    Nofan.colors()
  })

program
  .command('login [username] [password]')
  .description('Login nofan')
  .action(function (username, password) {
    Nofan.login(username, password)
  })

program
  .command('logout')
  .description('Logout nofan')
  .action(function () {
    Nofan.logout()
  })

program
  .command('switch [id]')
  .alias('s')
  .description('Switch account')
  .action(function (id) {
    Nofan.switchUser(id)
  })

program
  .command('home [count]')
  .alias('h')
  .description('Show home timeline')
  .action(function (count, options) {
    process.spinner = ora('Fetching').start()
    Nofan.homeTimeline({
      count: count,
      time_ago: options.parent.time,
      no_photo_tag: !options.parent.photoTag
    })
  })

program
  .command('mentions [count]')
  .alias('m')
  .description('Show mentions')
  .action(function (count, options) {
    process.spinner = ora('Fetching').start()
    Nofan.mentions({
      count: count,
      time_ago: options.parent.time,
      no_photo_tag: !options.parent.photoTag
    })
  })

program
  .command('me [count]')
  .description('Show my statuses')
  .action(function (count, options) {
    process.spinner = ora('Fetching').start()
    Nofan.me({
      count: count,
      time_ago: options.parent.time,
      no_photo_tag: !options.parent.photoTag
    })
  })

program
  .command('public [count]')
  .alias('p')
  .description('Show public timeline')
  .action(function (count, options) {
    process.spinner = ora('Fetching').start()
    Nofan.publicTimeline({
      count: count,
      time_ago: options.parent.time,
      no_photo_tag: !options.parent.photoTag
    })
  })

program
  .command('undo')
  .description('Delete last status')
  .action(function () {
    process.spinner = ora('Deleting').start()
    Nofan.undo()
  })

program
  .command('notifier [operate]')
  .alias('n')
  .description('Nofan Notifier')
  .action(function (operate) {
    process.spinner = ora('Setting Notifier').start()
    switch (operate) {
      case undefined:
      case 'start':
        pm2.start()
        break
      case 'stop':
        pm2.stop()
        break
      case 'restart':
        pm2.restart()
        break
      case 'delete':
        pm2.deleting()
        break
      default:
        process.spinner.fail('Invalid Notifier command')
        break
    }
  })

program
  .arguments('<status> [more...]')
  .option('-p, --photo <path>', 'Attach a photo')
  .description('')
  .action(function (pre, more, options) {
    process.spinner = ora('Sending').start()
    more.unshift(pre)
    const text = more.join(' ')
    if (!options.photo) Nofan.update(text)
    else Nofan.upload(options.photo, text)
  })

program.parse(process.argv)

if (program.args.length === 0) {
  process.spinner = ora('Fetching').start()
  Nofan.homeTimeline({
    time_ago: program.time,
    no_photo_tag: !program.photoTag
  })
}
