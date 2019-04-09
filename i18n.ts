import { Plugin } from '@merryjs/cli/lib/plugin'
import child_process from 'child_process'
import { FlutterOptions } from './action'
import fs from 'fs-extra'
import fg from 'fast-glob'
var OpenCC = require('opencc')
export default async (api: Plugin, options: FlutterOptions) => {
  run({
    api,
    msg: 'extract message from dart file to arb',
    command:
      'flutter pub pub run intl_translation:extract_to_arb --output-dir=lib/l10n lib/*.dart lib/**/*.dart',
  })

  const items = await fg('lib/**/*.arb')
  const messagesFile = items.filter(item =>
    (item as string).includes('messages.arb')
  )[0] as string

  if (!messagesFile) {
    api.log('message file not found')
    return
  }
  const messages = fs.readJSONSync(messagesFile)
  items
    .filter(item => !(item as string).includes('messages.arb'))
    .forEach(file => {
      const f = file as string
      const json = fs.readJSONSync(f)
      // merge
      const merge = { ...messages, ...json }
      // s2tw
      if (f.includes('TW') || f.includes('HK')) {
        const cc = new OpenCC(f.includes('TW') ? 's2tw.json' : 's2hk.json')
        // ignore key start with @ symbol
        for (const key in merge) {
          if (merge.hasOwnProperty(key)) {
            const element = merge[key]
            if (key.startsWith('@')) {
              continue
            }
            merge[key] = cc.convertSync(element)
          }
        }
      }
      fs.writeFileSync(f, JSON.stringify(merge, null, 2))
    })

  run({
    api,
    msg: 'generate dart message from arb',
    command:
      'flutter pub pub run intl_translation:generate_from_arb --output-dir=lib/l10n --no-use-deferred-loading lib/*.dart lib/**/*.dart lib/l10n/intl_*.arb',
  })
}
/**
 * run command sync
 * @param param0
 */
function run({
  api,
  command,
  msg,
  options,
}: {
  api: Plugin
  command: string
  msg: string
  options?: FlutterOptions
}) {
  api.log(msg)
  child_process.execSync(command)
  api.log(msg + ' done.')
}
