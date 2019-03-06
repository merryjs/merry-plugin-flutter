import { Plugin } from '@merryjs/cli/lib/plugin'
import path from 'path'
import widget from './widget'
import { FlutterAction, FlutterOptions } from './action'

/**
 * FlutterAnswers
 */

export default (api: Plugin) => {
  api
    .command('flutter [action]')
    .option('-n, --name [value]', 'name of your widget/model/page')
    .option('-s, --stateful', 'stateful widget')
    .action(
      async (
        action: FlutterAction,
        options: FlutterOptions = {
          name: '',
        }
      ) => {
        if (action === undefined) {
          api.log(
            `action required, supported actions: ${Object.keys(FlutterAction)
              .filter(f => !(parseInt(f, 10) >= 0))
              .map(f => f).join(' ')}`
          )
          return
        }
        if (!options.name || typeof options.name === 'function') {
          api.log('name option required')
          return
        }

        switch (action) {
          case FlutterAction.page:
            break
          case FlutterAction.widget:
          default:
            await widget(api, options)
            break
        }
      }
    )
}
