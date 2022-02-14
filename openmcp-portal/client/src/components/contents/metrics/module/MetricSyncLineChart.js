import React, { Component } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

class MetricSyncLineChart extends Component {
  state = {
    rows: this.props.rowData,
    fillColor : this.props
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.rowData !== prevProps.rowData) {
      this.setState({
        ...this.state,
        rows: this.props.rowData,
      });
    }
  }

  componentWillMount(){
    
  }

  render() {
    // const color = ["#367fa9", "#3cb0bc"];
    let fillColor ="url(#"+ this.props.dataKey +")";

    return (
      // color, name, unit
      <div>
        <h4>{this.props.title}</h4>
        <AreaChart
          width={600}
          height={110}
          data={this.state.rows}
          syncId={this.props.syncId}
          margin={{
            top: 20,
            right: 0,
            left: 0,
            bottom: 0,
          }}
          style={{ fontSize: "12px" }}
          stackOffset="expand"
        >
          <CartesianGrid strokeDasharray="1 2" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip
            // labelStyle={{color:"#ffffff"}}
            // itemStyle = {{color:"#ffffff"}}
            contentStyle={{
              fontSize: "14px",
              color: "#ffffff",
              background: "#222d32",
              borderRadius: "4px",
            }}
            // wrapperStyle={{fontSize: "14px"}}
          />
          <defs>
            <linearGradient id={this.props.dataKey} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={this.props.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={this.props.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="natural" //basis, linear, natural, monotone, step
            dataKey={this.props.dataKey}
            stroke={this.props.color}
            fill={fillColor}
            unit={this.props.unit}
            name={this.props.name}
          />
        </AreaChart>
      </div>
    );
  }
}

export default MetricSyncLineChart;
