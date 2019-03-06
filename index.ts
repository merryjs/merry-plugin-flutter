import { Plugin } from '@merryjs/cli/lib/plugin'
import path from 'path'
import { FlutterAction, FlutterOptions } from './action'
import model from './model'

/**
 * FlutterAnswers
 */

export default (api: Plugin) => {
  api
    .command('flutter [action]')
    .option('-n, --name [value]', 'name of your widget/model/page')
    .option('-s, --stateful', 'stateful widget')
    .option('-o, --src [value]', 'source path of quick type')
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
              .map(f => f)
              .join(' ')}`
          )
          return
        }
        if (!options.name || typeof options.name === 'function') {
          api.log('name option required')
          return
        }
        switch (action) {
          case FlutterAction.model:
            await model(api, options)
            break
          case FlutterAction.page:
            const page = options.stateful
              ? './page-stateful.hbs'
              : './page.hbs'
            await api.tmpl(
              page,
              path.join(api.conf.dist, 'pages', `{{snakecase name}}.dart`),
              options
            )
            break
          case FlutterAction.widget:
            const tpl = options.stateful
              ? './widget-stateful.hbs'
              : './widget.hbs'
            await api.tmpl(
              tpl,
              path.join(api.conf.dist, 'widgets', `{{snakecase name}}.dart`),
              options
            )
            break
          default:
            api.log('action not found.')
            break
        }
      }
    )
}
