import { deepClone } from '@/utils/object'
import { nanoid } from 'nanoid'
import { useEffect, useRef, useState } from 'react'
import { useValidator } from './validator/validator'

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
  const [errorMap, setErrorMap] = useState<{ [key: string]: string }>({})
  const validator = useValidator()
  // 当前表格的一些状态
  const [tableConfig, setConfig] = useState<TableConfig>(initialConfig)
  const tableConfigRef = useRef<TableConfig>(initialConfig)

  const getRowIndex = (rowKey: string) => {
    const rowIndex = dataSource?.findIndex((item) => item?.key === rowKey)
    return rowIndex > -1 ? rowIndex : undefined
  }

  // 设置dataSource
  const setDataSource = (value: T[] = []) => {
    dataSourceRef.current = value
    setData(value)
    setTableConfig({ total: value?.length })
  }

  // 更新表格的一些信息
  const setTableConfig = (value: Partial<TableConfig>) => {
    const oldValue = { ...tableConfigRef.current }
    const newValue = { ...oldValue, ...value }
    setConfig(newValue)
    tableConfigRef.current = newValue
  }

  useEffect(() => {
    setDataSource(initialValue)
  }, [])

  // 更新table数据
  const updateTable = (data: any, rowKey: string, dataIndex: string) => {
    const newData = deepClone(dataSource)
    const rowIndex = getRowIndex(rowKey)
    if (typeof rowIndex == 'number') {
      newData[rowIndex][dataIndex] = data
    }
    setDataSource(newData)
    return newData
  }

  // 删除一行
  const deleteRow = (rowKey: string) => {
    const rowIndex = getRowIndex(rowKey)
    const newData = deepClone(dataSource)
    if (typeof rowIndex === 'number') {
      newData.splice(rowIndex, 1)
    }
    setDataSource(newData)
    return newData
  }

  // 增加一行
  const addRow = (rowData?: T) => {
    const newData = deepClone(dataSource)
    const item = { key: getNanoid(), ...rowData } as T
    newData.push(item)
    setDataSource(newData)
    return newData
  }

  // 校验目标单元格
  const validateCell = async (rowKey: string, dataIndex: string) => {
    const path = getCellPath(rowKey, dataIndex)
    if (!path) return
    const record = dataSourceRef.current?.find?.((item) => item?.key === rowKey)
    const isDisabled = !record
    const message = await validator?.start?.(path, record?.[dataIndex], isDisabled)
    setErrorMap((last) => {
      const oldErrorMap = { ...last }
      if (!message) {
        delete oldErrorMap[path]
      } else {
        oldErrorMap[path] = message
      }
      return oldErrorMap
    })
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

  // 单元格的错误
  const cellError = (rowKey?: string, dataIndex?: string) => {
    const path = getCellPath(rowKey, dataIndex)
    if (!path) return
    return errorMap?.[path]
  }

  // 页码或pageSize改变的回调，参数是改变后的页码及每页条数
  const handlePageChange = (page: number, pageSize: number) => {
    setTableConfig({ page, pageSize })
  }

  // 表格显示数量变更回调函数（注意同一时间会触发页码变更）
  const handleShowSizeChange = (pageSize: number) => {
    setTableConfig({ pageSize })
  }

  return {
    dataSource,
    validator,
    cellError,
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
