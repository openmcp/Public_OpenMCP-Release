import React, { Component } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,Legend
} from "recharts";

class MetricLineChart extends Component {
  constructor(props){
    super(props);
    this.state = {
      rows: "",
    }
  }

  componentWillMount(){
    this.setState({rows : this.props.rowData});
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.rowData !== prevProps.rowData) {
      this.setState({
        ...this.state,
        rows: this.props.rowData,
      });
    }
  }
  render() {
    const color = [
      "#ff8042",
      "#00C49F",
      "#0088FE",
      "#FFBB28",
      "#cccccc",
      "#00C49F",
      "#FFBB28",
      "#00C49F",
      "#FFBB28",
    ];

    return (
      // color, name, unit
        <div style={{ position: "relative", width: `${this.props.width}`, height: `${this.props.height}`}} className="line-chart">
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={this.props.rowData}
          margin={{
            top: 30,
            right: 0,
            left: 0,
            bottom: 10,
          }}
          style={{ fontSize: "12px" }}
          stackOffset="silhouette"
        >
          <CartesianGrid strokeDasharray="6 6" />
          <XAxis dataKey="time" />
          <YAxis />
          <Legend />
          <Tooltip
            contentStyle={{
              fontSize: "14px",
              color: "#ffffff",
              background: "#222d32",
              borderRadius: "4px",
            }}
          />
          {this.props.cardinal
            ? this.props.name.map((i, index) => {
            
                return [
                  <defs>
                    <linearGradient
                      id={"color" + this.props.name + index}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color[index % this.props.name.length]} stopOpacity={0}/>
                      <stop offset="95%" stopColor={color[index % this.props.name.length]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>,
                  <Area
                    type="monotone" //basis, linear, natural, monotone, step
                    dataKey={this.props.name[index]}
                    stroke={color[index % this.props.name.length]}
                    fill={"url(#color" +this.props.name+ index + ")"}
                    unit={this.props.unit}
                    name={this.props.name[index]}
                  />,
                ];
              })
            : [
                <defs>
                  <linearGradient
                    id="colorCpuMemory"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#367fa9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#367fa9" stopOpacity={0} />
                  </linearGradient>
                </defs>,
                <Area
                  type="natural" //basis, linear, natural, monotone, step
                  dataKey={this.props.name}
                  stroke="#367fa9"
                  // fill="url(#colorCpuMemory)"
                  unit={this.props.unit}
                  name={this.props.name}
                />,
              ]}
        </AreaChart>
        </ResponsiveContainer>
        </div>
    );
  }
}

export default MetricLineChart;
