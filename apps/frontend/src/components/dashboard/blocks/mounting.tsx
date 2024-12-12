"use client";

import { type Mounting } from "@/types/data";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import * as React from "react";
import { SelectPicker } from "rsuite";

export interface MountingProps {
  input: Mounting[];
}

export default function Mounting({ input }: MountingProps): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  const handleSelectChange = (
    value: number | null,
    event: React.SyntheticEvent<Element, Event>
  ) => {
    setSelectedIndex(value ?? 0);
  };

 
  const options = input.map((_, index) => ({
    label: `Machine ${_.numberMachine}`,
    value: index,
  }));

  return (
    <Card>
      <CardHeader title="Mounting" />
      <CardContent>
        <div style={{ marginBottom: "16px" }}>
          <SelectPicker
            data={options}
            value={selectedIndex}
            onChange={handleSelectChange}
            placeholder="Select Machine"
            style={{ width: 200 }}
          />
        </div>
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
          <div
            style={{
              marginBottom: "20px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {Object.entries(input[selectedIndex]).map(([key, value]) => (
                  <tr key={key} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "8px", fontWeight: "bold" }}>
                      {key}:
                    </td>
                    <td style={{ padding: "8px" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
