import React, { Component } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";
// import { debug } from "request";

let styles = (props) => ({
  normalColor: {
    backgroundColor: "#3f51b5",
  },
  normalColor2: {
    backgroundColor: "#B53F70",
  },
  normalBaseColor: {
    backgroundColor: "#ffffff",
  },
  warnColor: {
    backgroundColor: "#FFA228",
  },
  warnBaseColor: {
    backgroundColor: "#FDEFCF",
  },
  dangerColor: {
    backgroundColor: "#FF3628",
  },
  dangerBaseColor: {
    backgroundColor: "#FFD5C4",
  },
  gray:{
    backgroundColor: "#afafaf",
  },
  bgGray:{
    backgroundColor: "#e9e9e9",
  }
});


class LinearProgressBar2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      total: this.props.total,
      color: this.props.classes[this.props.mColor],
      baseColor: this.props.classes[this.props.bColor],
    };
  }

  componentWillMount() {
    this.setState({
      color: this.props.classes[this.props.mColor],
      baseColor: this.props.classes[this.props.bColor],
    });
  }
  render() {
    // const { classes } = this.props;
    return (
      <div className="linear-progress">
        <LinearProgress
          {...this.props}
          variant="determinate"
          value={(this.state.value / this.state.total) * 100}
          classes={{
            colorPrimary: this.state.baseColor,
            barColorPrimary: this.state.color,
          }}
        />
        {/* .VolumeBar > * { background-color:green; }
.VolumeBar{background-color:gray ;} */}
      </div>
    );
  }
}

export default withStyles(styles)(LinearProgressBar2);
