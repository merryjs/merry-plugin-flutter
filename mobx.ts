import { Plugin } from '@merryjs/cli/lib/plugin'
import path from 'path'
import { FlutterOptions } from './action'
import * as quickType from 'quicktype'
import { generatePaths } from '@merryjs/swagger'
import changeCase from 'change-case'
export default async (api: Plugin, options: FlutterOptions) => {
  const cacheName = `.merry-cache-${Date.now()}`
  const cache = path.join(__dirname, cacheName)
  api.fs.emptyDirSync(cache)
  api.fs.ensureDirSync(cache)

  if (!options.src) {
    api.log('--src required')
    return
  }

  // fix tpl path
  if (options.tpl) {
    options.tpl = path.join(process.cwd(), options.tpl)
  } else {
    options.tpl = './store.tpl'
  }

  if (options.clean_stores) {
    api.fs.emptyDirSync(`${api.conf.dist}/${options.dist}`)
  }

  const result = await generatePaths(options.src, {
    definitionName: '{path}',
  })

  for (const key in result) {
    if (result.hasOwnProperty(key)) {
      if (options.skip && new RegExp(options.skip, 'gi').test(key)) {
        continue
      }
      const element = result[key]
      const fileName = getFullPath(key)
      const out = `${api.conf.dist}/${options.dist}/${fileName}.dart`
      const tsFile = `${cache}/${options.dist}/${fileName}.ts`

      // generate ts file
      await api.tmpl('./model.tpl', tsFile, {
        definitions: result[key],
      })

      // generate dart files from typescript files
      const dartFile = `${cache}/${options.dist}/${fileName}.dart`
      await quickType.main({
        srcLang: 'typescript',
        src: [tsFile],
        lang: 'dart',
        out: dartFile,
      })

      // read ts to dart file.
      const dartModel = api.fs
        .readFileSync(dartFile, 'utf-8')
        // replace import so we can import it in anywhere
        .replace("import 'dart:convert';", '')

      await api.tmpl(options.tpl, out, {
        definitions: element,
        model: dartModel,
        fileName: getFullPath(key, true),
      })
    }
  }
  api.fs.remove(cache)
}

/**
 * get full path by key
 * @param key
 */
function getFullPath(key: string, filename: boolean = false) {
  const paths = key.startsWith('/') ? key.substr(1).split('/') : key.split('/')
  let folder = ''
  let p = ''
  if (paths.length > 1) {
    folder = paths[0]
    p = paths.filter((_, index) => index !== 0).join('/')
  } else {
    p = key
  }
  if (filename) {
    return changeCase.snakeCase(p)
  }
  const fullPath =
    (folder ? changeCase.snakeCase(folder) + '/' : '') + changeCase.snakeCase(p)
  return fullPath
}
