import React, { Component } from 'react';
import CircularProgress from "@material-ui/core/CircularProgress";
import { withTranslation } from "react-i18next";

// let completed = 0;
class ProgressTemp extends Component {
  constructor(props){
    super(props);
    this.state ={
      completed:0
    }
  }

  componentDidMount(){
    this.timer = setInterval(this.progress, 20);
  }
  
  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
    // completed2 = completed2 >= 100 ? 0 : completed + 1;
  };

  closeProcess = () => {
    clearInterval(this.timer);
    this.props.closeProgress()
  }
  
  render(){
    const {t} = this.props;
    return(
      <div >
        {this.props.openProgress ? 
        <div className="loading-full">
          <div onClick={this.closeProcess}>
          {t("common.label.processing")}
          <CircularProgress
            variant="determinate"
            value={this.state.completed}
            style={{ position: "absolute", top:"30px", left:"10px"}}
          ></CircularProgress>
          </div>
          
        </div>:""
        }
      </div>
      
    )
  }
}

export default withTranslation()(ProgressTemp);