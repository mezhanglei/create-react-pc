import { Table, TableProps } from "antd";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Resizable } from "react-resizable";
import { Classes, StyledWrapTable } from "./style";

const ResizableTitle = (props: any) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const components = {
  header: {
    cell: ResizableTitle,
  },
};

const ResizableColumn: React.FC<TableProps<any>> = ({
  dataSource,
  columns: propsColumns,
}) => {
  const [columns, setColumns] = useState<
    NonNullable<TableProps<any>["columns"]>
  >([]);

  useLayoutEffect(() => {
    setColumns(propsColumns ?? []);
  }, [propsColumns]);

  const handleResize = useCallback(
    (index) => (_: any, { size }: any) => {
      setColumns((columns) => {
        const nextColumns = [...columns];
        nextColumns[index] = {
          ...nextColumns[index],
          width: size.width,
        };
        return nextColumns;
      });
    },
    []
  );

  const renderColums = useMemo(() => {
    return columns.map((col, index) => ({
      ...col,
      onHeaderCell: (column: any) => ({
        width: column.width,
        onResize: handleResize(index),
      }),
    })) as NonNullable<TableProps<any>["columns"]>;
  }, [columns, handleResize]);

  return (
    <StyledWrapTable>
      <Table
        size="small"
        bordered
        components={components}
        columns={renderColums}
        dataSource={dataSource}
        className={Classes.Table}
        pagination={false}
      />
    </StyledWrapTable>
  );
};

export default ResizableColumn;
