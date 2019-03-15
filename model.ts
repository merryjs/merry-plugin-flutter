import { Plugin } from '@merryjs/cli/lib/plugin'
import path from 'path'
import { FlutterOptions } from './action'
import * as quickType from 'quicktype'
/**
 * FlutterAnswers
 */
export interface FlutterWidgetAnswers {
  name: string
}
export default async (api: Plugin, options: FlutterOptions) => {
  //   const tpl = options.stateful ? './widget-stateful.hbs' : './widget.hbs'
  //   quicktype -o lib/models/close_model.dart -t CloseModel --lang dart --src http://192.168.1.124:4200/api/Lottery/GetLastCloseTime\?lotteryId\=1\&X-Access-Token\=bee3cda5-dc6a-4e14-93b1-621e6819c9fb
  const t = api.compile('{{pascalcase name}}Model', options)
  const fileName = api.compile('{{snakecase name}}.dart', options)
  if (!options.src) {
    api.log('src required')
    return
  }
  api.fs.ensureDirSync(`${api.conf.dist}/${options.dist}`)
  try {
    const out = `${api.conf.dist}/${options.dist}/${fileName}`
    await quickType.main({
      out: out,
      lang: 'dart',
      topLevel: t,
      src: [options.src],
    })
    api.log('generate model %s success', out)
  } catch (error) {
    api.log('generate model failed')
  }
}
