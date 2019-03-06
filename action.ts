export enum FlutterAction {
  widget = 'widget',
  page = 'page',
  model = 'model',
}

export interface FlutterOptions {
  name: string
  stateful?: boolean
  src?: string
}
