// ali-react-table
import styled from "styled-components";

const prefix = "ant-";

export const Classes = {
  Table: `${prefix}table`,
};

export const StyledWrapTable = styled.div`
  .react-resizable {
    position: relative;
    background-clip: padding-box;
  }

  .react-resizable-handle {
    position: absolute;
    right: -5px;
    bottom: 0;
    z-index: 1;
    width: 10px;
    height: 100%;
    cursor: col-resize;
  }
`;
