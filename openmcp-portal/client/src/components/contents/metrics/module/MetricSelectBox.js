import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import NativeSelect from "@material-ui/core/NativeSelect";

const styles = (theme) => ({
  formControl: {
    minWidth: 120,
    // float: "right",
    // position: "absolute",
    // top: "-10px",
    // right: 0
  },
  selectEmpty: {
    marginTop: 0,
  },
});

class MetricSelectBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "hai",
      selectBoxData : this.props.rows
    };
  }

  componentWillUnmount(){
    this.setState({selectBoxData:[]});
  }

  render() {
    const handleChange = (event) => {
      const name = event.target.name;
      this.setState({
        ...this.state,
        [name]: event.target.value,
      });

      //액션내용구현
      this.props.onSelectBoxChange(event.target.value);
    };
    const { classes } = this.props;
    return (
      <div className="select-box">
        <FormControl className={classes.formControl}>
          <NativeSelect
            defaultValue={this.props.defaultValue}
            onChange={handleChange}
            className={classes.selectEmpty}
          >
            {this.state.selectBoxData.map((i) => {
              return <option value={i.value}>{i.name}</option>;
            })}
            ;
          </NativeSelect>
        </FormControl>
      </div>
    );
  }
}

export default withStyles(styles)(MetricSelectBox);
