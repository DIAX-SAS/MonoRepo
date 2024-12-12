interface Row {
  value: string;
  label: string;
  children?: Row[];
}

interface MockTreeDataOptions {
  getRowData?: (layer: number, value: string) => Partial<Row>;
}

export function mockTreeData(options: MockTreeDataOptions): Row[] {
  const { getRowData } = options; // Extract the callback function for row data
  const depth = 3; // Depth of the nested data

  const data: Row[] = [];

  const mock = (list: Row[], parentValue = "", layer = 0) => {
    let index = 0;

    while (true) {
      const value = parentValue
        ? `${parentValue}-${index + 1}`
        : `${index + 1}`;
      const children: Row[] = [];

      let row: Row = { value, label: `Node ${value}` }; // Default label

      if (getRowData) {
        row = {
          ...row,
          ...getRowData(layer, value),
        };
      }

      // Stop generating further nodes if label is "unknown"
      if (row.label === "Unknown") break;

      list.push(row);

      // Recursively add children if within depth
      if (layer < depth - 1) {
        row.children = children;
        mock(children, value, layer + 1);
      }

      index++;
    }
  };

  mock(data);
  return data;
}
