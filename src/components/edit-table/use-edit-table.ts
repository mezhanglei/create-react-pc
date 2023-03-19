import { getArrMap } from '@/utils/array'
import { nanoid } from 'nanoid'
import { useEffect, useMemo, useRef, useState } from 'react'
import Validator from '../react-easy-formcore/validator'

export function useValidator() {
  return useMemo(() => new Validator(), [])
}

// 根据key, dataIndex拼接cell的唯一路径
export const getCellPath = (rowKey?: string, colKey?: string) => {
  if ((typeof rowKey === 'number' || typeof rowKey === 'string') && typeof colKey === 'string' && colKey) {
    return `${rowKey},${colKey}`
  }
}

export const getNanoid = () => {
  // 可换成自己所用的随机id生成
  return nanoid(6)
}

export interface TableConfig {
  page: number
  pageSize: number
  total?: number
}

// 可编辑表格的数据处理hook，可处理表格报错，表格数据等相关项
export function useEditTable<T extends { key?: string }>(initialValue: T[], initialConfig = { page: 1, pageSize: 20 }) {
  const [dataSource, setData] = useState<T[]>([])
  const dataSourceRef = useRef<T[]>([])
  const dataSourceMapRef = useRef<{ [key: string]: any }>({})
  const validator = useValidator()
  // 当前表格的一些状态
  const [tableConfig, setConfig] = useState<TableConfig>(initialConfig)
  const tableConfigRef = useRef<TableConfig>(initialConfig);
  const debounceRef = useRef<any>();

  // 设置dataSource
  const setDataSource = (value: any) => {
    const oldValue = dataSourceRef.current
    const newValue = typeof value === 'function' ? value?.(oldValue) : value;
    dataSourceRef.current = newValue
    setData(newValue)
    dataSourceMapRef.current = getArrMap<T>(newValue, 'key')
    setTableConfig((last: any) => ({ ...last, total: newValue?.length }))
  }

  // 更新表格的一些信息
  const setTableConfig = (value: any) => {
    const oldValue = tableConfigRef.current
    const newValue = typeof value === 'function' ? value?.(oldValue) : value;
    tableConfigRef.current = newValue
    setConfig(newValue)
  }

  useEffect(() => {
    setDataSource(initialValue)
  }, [])

  // 更新table数据
  const updateTable = (data: any, rowKey: string, dataIndex?: string) => {
    const newData = dataSourceRef.current
    for (let i = 0; i < newData?.length; i++) {
      const item = newData[i]
      if (item?.key == rowKey) {
        if (dataIndex) {
          newData[i][dataIndex] = data
          break;
        } else {
          newData[i] = data
          break;
        }
      }
    }
    setDataSource(newData)
    return newData
  }

  // 删除一行
  const deleteRow = (rowKey: string) => {
    const newData = [...dataSourceRef.current]
    for (let i = 0; i < newData?.length; i++) {
      const item = newData[i]
      if (item?.key === rowKey) {
        newData?.splice(i, 1)
        break
      }
    }
    setDataSource(newData)
    return newData
  }

  // 增加一行
  const addRow = (rowData?: T) => {
    const newData = [...dataSourceRef.current]
    const item = { key: getNanoid(), ...rowData } as T
    newData.push(item)
    setDataSource(newData)
    return newData
  }

  // 校验目标单元格
  const validateCell = async (rowKey: string, dataIndex: string) => {
    const path = getCellPath(rowKey, dataIndex)
    if (!path) return
    // 防抖操作
    const handleDebounce = () => {
      debounceRef.current = setTimeout(() => {
        setDataSource([...dataSourceRef.current])
      }, 500);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      handleDebounce()
    } else {
      handleDebounce()
    }

    const record = dataSourceMapRef.current[rowKey]
    const message = await validator?.start?.(path, record?.[dataIndex])
    return message
  }

  // 校验整个table
  const validate = async () => {
    const rulesMap = validator?.getRulesMap()
    const result = await Promise.all(
      Object.keys(rulesMap)?.map((n) => {
        const rules = rulesMap?.[n]
        if (rules) {
          const arr = n?.split(',')
          const rowKey = arr?.[0]
          const dataIndex = arr?.[1]
          return validateCell(rowKey, dataIndex)
        }
      })
    )
    const currentError = result?.filter((message) => message !== undefined)?.[0]
    return {
      error: currentError,
      values: dataSourceRef.current,
    }
  }

  // 页码或pageSize改变的回调，参数是改变后的页码及每页条数
  const handlePageChange = (page: number, pageSize: number) => {
    setTableConfig((last: any) => ({ ...last, page, pageSize }))
  }

  // 表格显示数量变更回调函数（注意同一时间会触发页码变更）
  const handleShowSizeChange = (pageSize: number) => {
    setTableConfig((last: any) => ({ ...last, pageSize }))
  }

  // 获取当前实时数据
  const getCurrent = () => {
    return dataSourceRef.current
  }

  return {
    tableConfig,
    dataSource,
    validator,
    getCurrent,
    setDataSource,
    validateCell,
    validate,
    updateTable,
    deleteRow,
    addRow,
    handlePageChange,
    handleShowSizeChange,
  }
}
