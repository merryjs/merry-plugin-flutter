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
    schema: true,
  })

  for (const key in result) {
    if (result.hasOwnProperty(key)) {
      if (options.skip && new RegExp(options.skip, 'gi').test(key)) {
        continue
      }
      const element = result[key]
      const fileName = getFullPath(key)
      const out = `${api.conf.dist}/${options.dist}/${fileName}.dart`
      const parametersFile = `${cache}/${
        options.dist
      }/${fileName}-parameters.json`
      const responsesFile = `${cache}/${
        options.dist
      }/${fileName}-responses.json`
      const dartParametersFile = `${cache}/${
        options.dist
      }/${fileName}-parameters.dart`
      const dartResponsesFile = `${cache}/${
        options.dist
      }/${fileName}-responses.dart`

      for (const k in element) {
        if (element.hasOwnProperty(k)) {
          let el = element[k]
          if (el.parameters) {
            await api.fs.ensureFile(parametersFile)
            try {
              const json = JSON.parse(el.parameters)
              let jsp = { ...json.properties }
              if (json && jsp) {
                // handle named parameters but in body
                if (Object.keys(jsp).length === 1) {
                  Object.keys(jsp).forEach(op => {
                    if (jsp[op]['in'] === 'body') {
                      jsp = jsp[op].schema.properties
                    }
                  })
                }

                for (const j in jsp) {
                  if (jsp.hasOwnProperty(j)) {
                    const jn = jsp[j]
                    if (jn.type === 'number' && jn.format) {
                      let type = 'number'
                      switch (jn.format) {
                        case 'int32':
                        case 'int64':
                          type = 'integer'
                          break
                        // TODO: add more type if needed
                        default:
                          break
                      }
                      jsp[j].type = type
                    }
                  }
                }
              }
              json.properties = jsp
              element[k].parameters = JSON.stringify(json, null, 2)
            } catch (error) {}
            el = element[k]
            await api.fs.writeFile(parametersFile, el.parameters, 'utf-8')
            await quickType.main({
              srcLang: 'schema',
              src: [parametersFile],
              lang: 'dart',
              out: dartParametersFile,
              topLevel: el.definitionParamsName,
            })
          }
          if (el.responses) {
            await api.fs.ensureFile(responsesFile)
            await api.fs.writeFile(responsesFile, el.responses, 'utf-8')
            await quickType.main({
              srcLang: 'schema',
              src: [responsesFile],
              lang: 'dart',
              out: dartResponsesFile,
              topLevel: el.definitionEntityName,
            })
          }
        }
      }

      // read ts to dart file.
      const dartParameters = api.fs.existsSync(dartParametersFile)
        ? api.fs
            .readFileSync(dartParametersFile, 'utf-8')
            // replace import so we can import it in anywhere
            .replace("import 'dart:convert';", '')
            // Don not know why quick type add an Class after our parameters name
            .replace(/ParamsClass\b/g, 'Params')
        : ''
      const dartResponses = api.fs.existsSync(dartResponsesFile)
        ? api.fs
            .readFileSync(dartResponsesFile, 'utf-8')
            // replace import so we can import it in anywhere
            .replace("import 'dart:convert';", '')
        : ''

      await api.tmpl(options.tpl, out, {
        definitions: element,
        model: `${dartParameters}\n${dartResponses}`,
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
