// ali-react-table
import React from "react";
import styled from "styled-components";

const prefix = "g-";

export const Classes = {
  Table: `${prefix}table`,
  TableBody: `${prefix}table-body`,
  TableGrid: `${prefix}table-grid`,
  TableHead: `${prefix}table-head`,
  TableCell: `${prefix}table-cell`,
};

export const StyledWrapTable = styled.div<{
  columns?: React.CSSProperties["gridTemplateColumns"];
  rows?: React.CSSProperties["gridTemplateRows"];
}>`
  .${Classes.Table} {
    table-layout: auto;
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    font-size: 13px;
  }
  .${Classes.TableBody} {
    background-color: #fff;
  }
  .${Classes.TableGrid} {
    display: grid;
    grid-template-columns: ${(props) => props.columns};
    grid-template-rows: ${(props) => props.rows};
  }
  .${Classes.TableHead} {
    background-color: lightgray;
  }
  .${Classes.TableCell} {
    padding: 8px 16px;
    border: 1px solid gray;
  }
`;
