import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import 'antd/dist/antd.css'
import { Input, Space, Table } from 'antd'
import { ColumnProps, TableProps } from 'antd/es/table'
import { ButtonProps } from 'antd/es/button'
import ActionMenu, { actionMenuPropsInterface } from './components/actionMenu'
import ColumnVisibleController from './components/columnVisibleController'
import { ColumnTitle } from 'antd/es/table/interface'
import ButtonPrint, {
  actionDataIndex,
  PrintProps
} from './components/buttonPrint'
import TableSkeleton from './components/tableSkeleton'

export interface ComponentExposeState {
  record?: any
  index?: number
  setDataSource: React.Dispatch<React.SetStateAction<any[] | undefined>>
}

interface renderOwnSearchInputArgs {
  setDataSource: React.Dispatch<React.SetStateAction<any[] | undefined>>
}

interface enhanceTableInterface<IRowData = any> {
  newColumns: Array<newColumnsInterface>
  newSources?: Array<any>
  printButton?: boolean
  withColumnsVisibleController?: boolean
  searchBy?: string
  name: string
  printProps?: PrintProps
  restProps?: TableProps<IRowData>
  actionColumnProps?: any
  actionDetails?: (
    ComponentExposeState: ComponentExposeState
  ) => actionMenuPropsInterface
  actionDelete?: (
    ComponentExposeState: ComponentExposeState
  ) => actionMenuPropsInterface
  renderOwnActionMenu?: (
    ComponentExposeState: ComponentExposeState
  ) => React.ReactNode
  renderCreateButton?: (
    ComponentExposeState: ComponentExposeState
  ) => React.ReactNode
  renderOwnSearchInput?: (
    renderOwnSearchInputArgs: renderOwnSearchInputArgs
  ) => React.ReactNode
}

export interface newColumnsInterface<T = any> extends ColumnProps<T> {
  dataIndex: string
}

export interface visibleColumnsInterface {
  visible: boolean
  title: ColumnTitle<any>
  dataIndex: string
}

export interface createButtonPropsInterface extends ButtonProps {}

const tableNamePrefix = '__eTable__'

const EnhanceAntdTable: React.FC<enhanceTableInterface> = (props) => {
  const [dataSource, setDataSource] = useState(props.newSources)
  const [searchValue, setSearchValue] = useState<string>('')
  const componentRef = useRef(null)

  const getDefaultColumns: () => Array<
    newColumnsInterface
  > = useCallback(() => {
    const getAdditionalColumns = () => {
      let additionalColumns: any[] = []

      if (
        props.actionDelete ||
        props.actionDetails ||
        props.renderOwnActionMenu
      ) {
        additionalColumns.push({
          title: 'Action',
          ...props.actionColumnProps,
          dataIndex: actionDataIndex,
          key: actionDataIndex,

          render: (_: any, record: any, index: number) => {
            const stateToExpose = {
              record,
              index,
              setDataSource
            }

            return props.renderOwnActionMenu ? (
              props.renderOwnActionMenu(stateToExpose)
            ) : (
              <ActionMenu
                delete={props.actionDelete && props.actionDelete(stateToExpose)}
                detail={
                  props.actionDetails && props.actionDetails(stateToExpose)
                }
              />
            )
          }
        })
      }

      return additionalColumns
    }

    return [...(props.newColumns || []), ...getAdditionalColumns()]
  }, [setDataSource])

  const [visibleColumns, setVisibleColumns] = useState<
    visibleColumnsInterface[]
  >([])

  const columnsVisibleConfigKey = useMemo(
    () => tableNamePrefix + props.name,
    []
  )
  useEffect(() => {
    let userColumnsVisibleConfig: any = localStorage.getItem(
      columnsVisibleConfigKey
    )
    let newColumnsVisible: visibleColumnsInterface[] = []
    if (userColumnsVisibleConfig) {
      userColumnsVisibleConfig = JSON.parse(userColumnsVisibleConfig)

      newColumnsVisible = getDefaultColumns().map((item) => {
        return {
          dataIndex: item.dataIndex,
          title: item.title,
          visible: userColumnsVisibleConfig.some(
            (userColDataIndex: string) => userColDataIndex === item.dataIndex
          )
        }
      })
    } else {
      newColumnsVisible = getDefaultColumns().map((item) => ({
        dataIndex: item.dataIndex,
        title: item.title,
        visible: true
      }))
    }

    setVisibleColumns(newColumnsVisible)
  }, [columnsVisibleConfigKey])

  useEffect(() => {
    setDataSource(props.newSources)
  }, [props.newSources])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 10
        }}
      >
        <Space>
          {props.renderCreateButton &&
            props.renderCreateButton({
              setDataSource
            })}

          {props.withColumnsVisibleController && (
            <ColumnVisibleController
              tableName={tableNamePrefix + props.name}
              setVisibleColumns={() => ""}
              visibleColumns={visibleColumns}
            />
          )}
          {props.printButton === true || props.printProps ? (
            <div>
              <ButtonPrint
                data={dataSource}
                visibleColumns={visibleColumns}
                {...props.printProps}
              />
            </div>
          ) : null}
        </Space>
        <div
          style={{
            marginLeft: 'auto'
          }}
        >
          {props.renderOwnSearchInput ? (
            props.renderOwnSearchInput({
              setDataSource
            })
          ) : (
            <Input
              placeholder='Search'
              value={searchValue}
              onChange={(e) => {
                const currentSearchValue = e.target.value
                setSearchValue(currentSearchValue)
                const filteredData =
                  props.newSources &&
                  props.newSources.filter((entry) => {
                    let lowerName = entry.name.toLocaleLowerCase()
                    let valueSearch = currentSearchValue.toLocaleLowerCase()
                    return lowerName.includes(valueSearch)
                  })
                setDataSource(filteredData)
              }}
            />
          )}
        </div>
      </div>
      <div ref={componentRef}>
        <Table
          {...props.restProps}
          dataSource={dataSource}
          columns={getDefaultColumns().filter((item) =>
            visibleColumns.some(
              (visibleCol) =>
                visibleCol.dataIndex === item.dataIndex && visibleCol.visible
            )
          )}
        />
      </div>
    </div>
  )
}

EnhanceAntdTable.defaultProps = {
  searchBy: 'name'
}

export { TableSkeleton }

export default EnhanceAntdTable