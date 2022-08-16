import React, { useState, useEffect } from 'react'
import { Button, Input, InputNumber } from 'antd'
import BEditTable, { Control, useEditTable } from './index'

// 测试可编辑表格demo
export default (props) => {
  const [loading, setLoading] = useState(false)
  const {
    cellError,
    validator,
    validateCell,
    validate,
    dataSource,
    setDataSource,
    updateTable,
    deleteRow,
    addRow,
    // handleShowSizeChange,
    // handlePageChange,
  } = useEditTable([])

  const fetchTableData = () => {
    setLoading(true)
    setTimeout(() => {
      setDataSource([
        {
          key: '1',
          name: 'John Brown',
          age: 1,
          tags: '1',
        },
        {
          key: '2',
          name: 'John Brown',
          age: 1,
          tags: '1',
        },
        {
          key: '3',
          name: 'John Brown',
          age: 1,
          tags: '1',
        },
      ])
      setLoading(false)
    }, 1000)
  }

  useEffect(() => {
    fetchTableData()
  }, [])

  // 自定义校验
  const nameValidator = async (value: any, rowData: any, dataIndex: string) => {
    console.log(`当前行列：${rowData?.key},${dataIndex},值：${value}`)
    return
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      // 渲染可编辑项, 如果不想要编辑框，则return其他值
      render: (text: any, rowData: any) => {
        return (
          <Control
            rules={[
              { required: true, message: '不能为空' },
              { validator: (value: any) => nameValidator(value, rowData, 'name'), message: '自定义默认报错' },
            ]}
          >
            <Input
              style={{ width: '100%' }}
              value={text}
              onBlur={(e) => {
                validateCell(rowData?.key, 'name')
              }}
              onChange={(e) => {
                updateTable(e?.target?.value, rowData?.key, 'name')
              }}
            />
          </Control>
        )
      },
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: '20%',
      // 渲染可编辑项, 如果不想要编辑框，则return其他值
      render: (text: any, rowData: any) => {
        return (
          <Control rules={[{ required: true, message: '不能为空' }]}>
            <Input
              style={{ width: '100%' }}
              value={text}
              onBlur={(e) => {
                validateCell(rowData?.key, 'age')
              }}
              onChange={(e) => {
                updateTable(e?.target?.value, rowData?.key, 'age')
              }}
            />
          </Control>
        )
      },
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      width: '10%',
      render: (text: any, rowData: any) => {
        return (
          <InputNumber
            style={{ width: '100%' }}
            value={text}
            onChange={(value) => {
              updateTable(value, rowData?.key, 'tags')
            }}
          />
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      render: (text: unknown, rowData: any) => {
        return (
          <Button
            type="link"
            style={{ marginBottom: '10px' }}
            onClick={() => {
              deleteRow(rowData?.key)
            }}
          >
            删除
          </Button>
        )
      },
    },
  ]

  const footer = () => {
    return (
      <a
        onClick={(e) => {
          e.preventDefault()
          addRow()
        }}
      >
        添加
      </a>
    )
  }

  const handelSubmite = async () => {
    const { error, values } = await validate()
    console.log(error, values, '提交成功')
  }

  return (
    <>
      <BEditTable
        cellError={cellError}
        validator={validator}
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        footer={footer}
        scroll={{ y: 400 }}
      // pagination={{
      //   onChange: handlePageChange,
      //   onShowSizeChange: handleShowSizeChange,
      // }}
      />
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" onClick={() => handelSubmite()}>
          提交
        </Button>
      </div>
    </>
  )
}
