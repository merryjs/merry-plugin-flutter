import { Plugin } from '@merryjs/cli/lib/plugin'
import path from 'path'
import { FlutterAction, FlutterOptions } from './action'
import model from './model'
import mobx from './mobx'

/**
 * FlutterAnswers
 */

export default (api: Plugin) => {
  api
    .command('flutter [action]')
    .option('-n, --name [value]', 'name of your widget/model/page')
    .option('-s, --stateful', 'stateful widget')
    .option('-o, --src [value]', 'source path of quick type')
    .option('-d, --dist [value]', 'dist folder for widget')
    .option('-t, --tpl [value]', 'template for generate mobx store')
    .action(
      async (
        action: FlutterAction,
        options: FlutterOptions = {
          name: '',
        }
      ) => {
        const availableActions = Object.keys(FlutterAction).filter(
          f => !(parseInt(f, 10) >= 0)
        )
        if (action === undefined || !availableActions.includes(action)) {
          api.log(
            `action required, supported actions: ${availableActions
              .map(f => f)
              .join(' ')}`
          )
          return
        }
        if (
          FlutterAction.fastlane !== action &&
          FlutterAction.mobx !== action &&
          (!options.name || typeof options.name === 'function')
        ) {
          api.log('name option required')
          return
        }
        switch (action) {
          case FlutterAction.fastlane:
            await api.fs.copy(
              path.join(__dirname, './fastlane'),
              path.join(api.conf.dist, '../fastlane'),
              {
                overwrite: true,
              }
            )
            await api.fs.copy(
              path.join(__dirname, './Gemfile'),
              path.join(api.conf.dist, '../Gemfile'),
              {
                overwrite: true,
              }
            )
            api.log(
              'fastlane init succeeded. You may need edit:\n- fastlane/.env\n- fastlane/.env.dev\n- fastlane/.env.dev.secret\nand fastlane/.env.prod files for production'
            )
            break
          case FlutterAction.model:
            options.dist = options.dist || 'models'
            await model(api, options)
            break
          case FlutterAction.mobx:
            options.dist = options.dist || 'stores'
            await mobx(api, options)
            break
          case FlutterAction.page:
            const page = options.stateful ? './page-stateful.hbs' : './page.hbs'
            await api.tmpl(
              page,
              path.join(
                api.conf.dist,
                options.dist || 'pages',
                `{{snakecase name}}.dart`
              ),
              options
            )
            break
          case FlutterAction.widget:
            const tpl = options.stateful
              ? './widget-stateful.hbs'
              : './widget.hbs'
            await api.tmpl(
              tpl,
              path.join(
                api.conf.dist,
                options.dist || 'pages',
                `{{snakecase name}}.dart`
              ),
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
