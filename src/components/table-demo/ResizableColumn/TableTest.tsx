import Table from "./Table";

const columns = [
  { dataIndex: "name", key: "name", title: "name", width: 100 },
  { dataIndex: "age", key: "age", title: "age", width: 200 },
  { dataIndex: "year", key: "year", title: "year", width: 300 },
  { dataIndex: "address", key: "address", title: "address" },
];
const generateData = (num: number) => {
  return new Array(num).fill(0).map((ele, i) => ({
    key: i,

    name: `name-${i}`,
    age: 20 + i,
    year: 2020 + i,
    address: Math.random(),
  }));
};

const TableTest = () => (
  <Table
    tableLayout="fixed"
    columns={columns}
    dataSource={generateData(10)}
  ></Table>
);

export default TableTest;
