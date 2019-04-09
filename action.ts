export enum FlutterAction {
  widget = 'widget',
  page = 'page',
  model = 'model',
  fastlane = 'fastlane',
  mobx = 'mobx',
  i18n = 'i18n',
}

export interface FlutterOptions {
  name: string
  stateful?: boolean
  src?: string
  dist?: string
  tpl?: string
  /** auto translate */
  auto?: boolean
}
