import React, { Component } from "react";
import { PieChart, Pie, Sector, Cell } from "recharts";

class PieReChartPowerRange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      range: this.props.range,
      rows: this.props.data,
      settings: this.props.settings,
      color: "#00C49F",
      // range : [
      //   { name: "usage", value: 10 },
      //   { name: "available", value: 90 },
      // ],
      // rows: [
      //   { name: "low", value: 20 },
      //   { name: "medium", value: 50 },
      //   { name: "high", value: 30 },
      // ],
      // settings : {
      //   width:170,
      //   height:140,
      //   cx:80,
      //   cy:80,
      //   outerRadius:69,
      //   innerRadius:40,
      //   startAngle:200,
      //   endAngle:-20,
      // }
    };
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.data !== prevProps.data) {
      this.setState({
        ...this.state,
        rows: this.props.data,
      });
    }
  }

  componentWillMount() {
    let low = 0;
    let medium = 0;
    let high = 0;

    this.props.range.forEach((item) => {
      if (item.name === "low") {
        low = item.value;
      } else if (item.name === "medium") {
        medium = item.value;
      } else if (item.name === "high") {
        high = item.value;
      }
    });

    let color = "#00C49F";
    this.props.data.forEach((item) => {
      if (item.name === "usage") {
        if (item.value <= low) {
          color = "#00C49F";
        } else if (low < item.value && item.value <= low + medium) {
          color = "#FFBB28";
        } else if (
          low + medium < item.value &&
          item.value <= low + medium + high
        ) {
          color = "#FF5042";
        }
      }
    });

    this.setState({ color: color });
  }

  render() {
    const renderActiveShape = (props) => {
      const { cx, cy, fill, startAngle, endAngle, payload } = props;

      return (
        <g>
          <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} style={{fontSize:"33px", fontWeight:"bold"}}>
            {payload.value}W
          </text>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={this.state.settings.innerRadius}
            outerRadius={this.state.settings.outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
        </g>
      );
    };

    const COLORS = ["#00C49F", "#FFBB28", "#FF5042"];
    // const COLORS2 = ["#00C49F", "#08080800"];

    return (
      <div style={{ minHeight: this.props.settings.minHeight, padding: "18px 0" }}>
        <PieChart
          width={this.state.settings.width}
          height={this.state.settings.height}
        >
          <Pie
            className="range"
            data={this.state.range}
            dataKey="value"
            cx={this.state.settings.cx}
            cy={this.state.settings.cy}
            outerRadius={this.state.settings.outerRadius*1.1}
            innerRadius={this.state.settings.innerRadius*1.2}
            fill="#82ca9d"
            startAngle={this.state.settings.startAngle}
            endAngle={this.state.settings.endAngle}
            isAnimationActive={false}
          >
            {this.state.range.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Pie
            className="range"
            data={this.state.rows}
            dataKey="value"
            cx={this.state.settings.cx}
            cy={this.state.settings.cy}
            outerRadius={this.state.settings.outerRadius}
            innerRadius={this.state.settings.innerRadius}
            fill="#ececec"
            startAngle={this.state.settings.startAngle}
            endAngle={this.state.settings.endAngle}
            isAnimationActive={false}
          />
          <Pie
            activeIndex={this.state.activeIndex}
            activeShape={renderActiveShape}
            className="range"
            data={this.state.rows}
            dataKey="value"
            cx={this.state.settings.cx}
            cy={this.state.settings.cy}
            outerRadius={this.state.settings.outerRadius}
            innerRadius={this.state.settings.innerRadius}
            fill="#8884d8"
            startAngle={this.state.settings.startAngle}
            endAngle={this.state.settings.endAngle}
            isAnimationActive={true}
          >
            <Cell key={`cell-0`} fill={this.state.color} />
            <Cell key={`cell-1`} fill={"#08080800"} />
          </Pie>
        </PieChart>
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              margin: "auto",
              position: "relative",
              left: "0",
              right: "0",
            }}
          >
            {this.state.range.map((entry, index) => (
              // {this.state.range.length === index+1 ? "0px" : "20px"}
              <div
                style={{
                  display: "flex",
                  marginRight:
                    this.state.range.length === index + 1 ? "0px" : "20px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    background: COLORS[index],
                    marginRight: "5px",
                  }}
                ></div>
                <div>{entry.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default PieReChartPowerRange;
