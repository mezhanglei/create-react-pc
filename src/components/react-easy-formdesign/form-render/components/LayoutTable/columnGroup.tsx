import React, { useMemo } from 'react';
import { ColumnType } from './Table';

// 列的设置
export const ColumnGroup: React.FC<{ columns: ColumnType[] }> = ({ columns }) => {
  const columnWidths = columns.map((ele) => ele.width).join("-");
  const cols = useMemo(() => {
    let cols: React.ReactElement[] = [];
    let mustInsert = false;
    for (let i = columns.length; i >= 0; i--) {
      const width = columns[i] && columns[i].width;
      if (width || mustInsert) {
        cols.unshift(
          <col
            key={i}
            style={{ width, minWidth: width, textAlign: columns[i].align }}
          />
        );
        mustInsert = true;
      }
    }
    return cols;
    // eslint-disable-next-line
  }, [columnWidths]);
  return <colgroup>{cols}</colgroup>;
};
