import Table from "./Table";

const columns = [
  { key: "name", title: "name", width: 100 },
  { key: "age", title: "age" },
  { key: "year", title: "year" },
  { key: "address", title: "address", flexGrow: 2 },
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
  <Table columns={columns} dataSource={generateData(10)}></Table>
);

export default TableTest;
