export enum FlutterAction{
    widget,
    page,
    model,
}

export interface FlutterOptions {
    name: string
    stateful?: boolean
  }