import React, { Component } from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip  } from "recharts";

class MetricPieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      rows: this.props.data.status,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.data.status !== prevProps.data.status) {
      this.setState({
        ...this.state,
        rows: this.props.data.status,
      });
    }
  }

  onPieEnter = (data, index) => {
    this.setState({
      activeIndex: index,
    });
  };

  render() {
    const COLORS = this.props.colors;
    const renderActiveShape = (props) => {
      // const RADIAN = Math.PI / 180;
      const {
        cx,
        cy,
        // midAngle,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        payload,
        percent,
      } = props;


      return (
        <g style={{fontSize:"14px"}}>
          <text x={cx} y={cy} dy={0} textAnchor="middle" fill={fill}>
            {payload.name}
          </text>
          <text x={cx} y={cy} dy={15} textAnchor="middle" fill={fill}>
            {`${(percent * 100).toFixed(0)}%`}
          </text>

          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
        </g>
      );
    };
    // const style = {
    //   right:"8px",
    //   lineHeight: "25px",
    //   fontSize:"0.9vw",
    // };
    return (
      <div style={{ position: "relative", width: `170px`,height: "171.3px"}} className="pie-chart">
        <ResponsiveContainer  width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={this.state.activeIndex}
              activeShape={renderActiveShape}
              data={this.state.rows}
              cx={80}
              cy={80}
              startAngle={this.props.angle.startAngle}
              endAngle={this.props.angle.endAngle}
              innerRadius={35}
              outerRadius={60}
              fill="#367fa9"
              dataKey="value"
              paddingAngle={0}
              onMouseEnter={this.onPieEnter}
            >
              {this.state.rows.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            {/* <Legend
              iconSize={10}
              // width={180}
              // height={140}
              align= "right"
              layout="vertical"
              verticalAlign="middle"
              wrapperStyle={style}
              payload={this.state.rows.map((item, index) => ({
                id: item.name,
                type: "square",
                value: `${item.name} (${item.value}${this.props.unit})`,
                color: COLORS[index % COLORS.length],
              }))}
            /> */}
             <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default MetricPieChart;
