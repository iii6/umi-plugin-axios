import { IApi, utils } from 'umi';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface OptionInterface {
  baseURL?: string;
  menuURL?: string;
  exclude?: string;
}

const namespace = 'plugin-axios';

export default (api: IApi) => {
  api.addDepInfo(() => {
    const pkg = require('../package.json');
    return [
      {
        name: 'axios',
        range: pkg.dependencies['axios'],
      },
      {
        name: 'storejs',
        range: pkg.dependencies['storejs'],
      },
      {
        name: 'antd',
        range: pkg.dependencies['antd'],
      },
    ];
  });

  api.describe({
    key: 'axios',
    config: {
      schema(joi) {
        return joi.object({
          baseURL: joi.string(),
          menuURL: joi.string(),
          exclude: joi.string(),
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  api.addRuntimePluginKey(() => ['axios']);

  const AxiosTpl = readFileSync(join(__dirname, 'axios.tpl'), 'utf-8');

  api.onGenerateFiles(() => {
    const { baseURL, menuURL, exclude } = api.config.axios as OptionInterface
    api.writeTmpFile({
      path: `${namespace}/axios.ts`,
      content: utils.Mustache.render(AxiosTpl, {
        baseURL,
        menuURL,
        exclude,
      })
    })
  })

  api.addUmiExports(() => {
    return [
      {
        exportAll: true,
        source: `../${namespace}/axios`,
      },
    ];
  });
}
