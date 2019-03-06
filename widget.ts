import { Plugin } from '@merryjs/cli/lib/plugin'
import path from 'path'
import { FlutterOptions } from './action'

/**
 * FlutterAnswers
 */
export interface FlutterWidgetAnswers {
  name: string
}
export default async (api: Plugin, options: FlutterOptions) => {
  const tpl = options.stateful ? './widget-stateful.hbs' : './widget.hbs'
  await api.tmpl(
    tpl,
    path.join(api.conf.dist, 'widgets', `{{snakecase name}}.dart`),
    options
  )
}
