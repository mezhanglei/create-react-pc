// ali-react-table
import styled from "styled-components";

const prefix = "r-";

export const Classes = {
  Table: `${prefix}table`,
  TableBody: `${prefix}table-body`,
  TableRow: `${prefix}table-row`,
  TableHead: `${prefix}table-head`,
  TableCell: `${prefix}table-cell`,
};

export const StyledWrapTable = styled.div`
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
  .${Classes.TableRow} {
  }
  .${Classes.TableHead} {
    background-color: lightgray;
  }
  .${Classes.TableCell} {
    padding: 8px 16px;
    border: 1px solid gray;
  }
`;
