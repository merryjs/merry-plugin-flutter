export enum FlutterAction {
  widget = 'widget',
  page = 'page',
  model = 'model',
  fastlane = 'fastlane',
  mobx = 'mobx'
}

export interface FlutterOptions {
  name: string
  stateful?: boolean
  src?: string
  dist?: string
  tpl?: string
}
