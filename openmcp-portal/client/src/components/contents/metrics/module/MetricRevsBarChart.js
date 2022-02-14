import React, { Component } from "react";
import {
  BarChart,
  // ComposedChart,
  // Line,
  // Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  // Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

class MetricRevsBarChart extends Component {
  render() {
    const data = this.props.rowData;

    const renderCustomizedLabel = (props) => {
      const { x, y, value } = props;
      // const radius = 10;

      return (
        <g>
          {/* <circle cx={x + width / 2} cy={y - radius} r={radius} fill="#8884d8" /> */}
          <text
            fontSize={11}
            x={x + 5}
            y={y + 15}
            fill="#000"
            dominantBaseline="middle"
          >
            {value}
          </text>
        </g>
      );
    };

    return (
      <div
        style={{ position: "relative", width: "330px", height: "263px" }}
        className="revers-bar-chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            width={330}
            height={263}
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 10,
              left: 20,
            }}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis type="number" tickLine={false} />
            <YAxis dataKey="name" type="category" hide={true} />
            <Tooltip />
            <Bar dataKey={this.props.dataKey} barSize={30} fill="#fe8600">
              <LabelList
                dataKey="name"
                content={renderCustomizedLabel}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default MetricRevsBarChart;
