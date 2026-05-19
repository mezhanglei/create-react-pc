import classNames from 'classnames';
import React, { useMemo, useRef, useState } from 'react';
import "./index.less";
import TableMergeUtils from './table-utils';

const newList = TableMergeUtils.init({ rows: 4, cols: 4 });
export default function Demo() {

  const btns = [
    { name: "向上添加行", handle: "addTopRow", disHandle: "insertRow" },
    { name: "向下添加行", handle: "addBottomRow", disHandle: "insertRow" },
    { name: "向左添加列", handle: "addLeftCol", disHandle: "insertCol" },
    { name: "向右添加列", handle: "addRightCol", disHandle: "insertCol" },
    { name: "删除行", handle: "delRow", disHandle: "delRow" },
    { name: "删除列", handle: "delCol", disHandle: "delCol" },
    { name: "水平拆分", handle: "splitH", disHandle: "splitH" },
    { name: "垂直拆分", handle: "splitV", disHandle: "splitV" },
    { name: "向左合并", handle: "leftMerge", disHandle: "leftMerge" },
    { name: "向右合并", handle: "rightMerge", disHandle: "rightMerge" },
    { name: "向上合并", handle: "topMerge", disHandle: "topMerge" },
    { name: "向下合并", handle: "bottomMerge", disHandle: "bottomMerge" },
  ];

  const tableRowsRef = useRef(newList);
  let table = useMemo(() => new TableMergeUtils(tableRowsRef.current, { minRetainRow: 1, minSplitHcolspan: 1, minSplitVrowspan: 1, fixRowType: 2 }), [newList]);
  const [disabledHandles, setDisabledHandles] = useState(table.getDisabledHandles());
  const [selectCell, setSelectCell] = useState<{ row: number; col: number }>({
    row: -1,
    col: -1,
  });
  const getCellClass = (row: number, col: number) => {
    if (row === selectCell.row && col === selectCell.col) {
      return "cell active";
    }
    return "cell";
  };

  const getCellStyle = (cell: any) => {
    return {
      width: `${cell.width}px`,
      height: `${cell.height}px`,
      lineHieght: `${cell.height}px`,
      border: "1px solid black",
    };
  };
  const handleSelectCell = (row: number, col: number) => {
    const newData = { row, col };
    setSelectCell(newData);
    const handles = table.getDisabledHandles(
      newData.row,
      newData.col
    );
    setDisabledHandles(handles);
  };

  const handleFn = (btn) => {
    if (selectCell.row > -1 && selectCell.col > -1) {
      switch (btn.handle) {
        case "addTopRow": {
          let res = table.insertRow(selectCell.row, selectCell.col, 0);
          res && handleSelectCell(res?.rowIndex, res?.colIndex);
          break;
        }
        case "addBottomRow": {
          let res = table.insertRow(selectCell.row, selectCell.col, 1);
          res && handleSelectCell(res?.rowIndex, res?.colIndex);
          break;
        }

        case "addLeftCol": {
          let res = table.insertCol(selectCell.row, selectCell.col, 0);
          res && handleSelectCell(res?.rowIndex, res?.colIndex);
          break;
        }
        case "addRightCol": {
          let res = table.insertCol(selectCell.row, selectCell.col, 1);
          res && handleSelectCell(res?.rowIndex, res?.colIndex);
          break;
        }
        default: {
          let handle = btn.handle;
          let fn = (table[handle] as Function).bind(table);
          if (fn) {
            let res = fn(selectCell.row, selectCell.col);
            res && handleSelectCell(res?.rowIndex, res?.colIndex);
          }
        }
      }
    }
  };

  return (
    <div className="wrap">
      <div className="btns">
        {
          btns?.map((btn) => {
            return <div key={btns.handle} className={classNames('btn', disabledHandles?.includes(btn.disHandle) && 'disabled')} onClick={() => handleFn(btn)}>{btn.name}</div>;
          })
        }
      </div>
      <table className="table">
        {
          tableRowsRef.current?.map((row, rowIndex) => {
            return (
              <tr key={rowIndex}>
                {
                  row?.map((td, colIndex) => {
                    return (
                      <td key={colIndex} style={getCellStyle(td)} className={getCellClass(rowIndex, colIndex)} onClick={() => handleSelectCell(rowIndex, colIndex)} rowSpan={td.rowspan} colSpan={td.colspan}>
                      </td>
                    );
                  })
                }
              </tr>
            );
          })
        }
      </table >
    </div >
  );
};
