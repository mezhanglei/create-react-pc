import { ElementsType } from "."

const elements = {
  object: {
    label: '对象容器',
    inside: { type: 'row' },
    properties: {
    },
    settings: {
    }
  },
  list: {
    label: '数组容器',
    inside: { type: 'row' },
    properties: [
    ],
    settings: {
    }
  },
  table: {
    label: '表格',
    // inside: { type: 'row' },
    properties: [
      {
        properties: {
          col1: {
            
          },
          col2: {
            properties: {

            }
          }
        }
      }
    ],
    settings: {
    }
  }
}

export default ['layoutElements', elements] as [string, ElementsType]
