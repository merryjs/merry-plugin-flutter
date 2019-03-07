export enum FlutterAction {
  widget = 'widget',
  page = 'page',
  model = 'model',
  fastlane = 'fastlane',
}

export interface FlutterOptions {
  name: string
  stateful?: boolean
  src?: string
}
