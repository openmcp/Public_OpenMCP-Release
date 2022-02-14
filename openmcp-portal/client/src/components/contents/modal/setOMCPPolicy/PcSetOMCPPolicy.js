import React, { Component } from "react";
import PcSetLoadbalancingControllerPolicy from "./PcSetLoadbalancingControllerPolicy.js";
import PcSetNumericPolicy from "./PcSetNumericPolicy.js";
import PcSetSelectBoxPolicy from "./PcSetSelectBoxPolicy.js";
import PcSetTextValuePolicy from "./PcSetTextValuePolicy.js";

// function valuetext(value) {
//   return `${value}°C`;
// }

class PcSetOMCPPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      policyName : this.props.policyName
    }
  }

  componentWillMount() {
  }
  
  componentDidUpdate(prevProps, prevState) {
    
    if (this.props.policyName !== prevProps.policyName) {
      this.setState({
        ...this.state,
        policyName: this.props.policyName,
      });
    }
  }

  render() {
    const PolicyDialog = () => {
      let selectBoxData = [{name:"select", value:"select"}]
      switch(this.state.policyName){
        case "metric-collector-period":
        case  "cpa-period" :
          return <PcSetTextValuePolicy isFloat= {false} policyName={this.state.policyName} policy={this.props.policy} onUpdateData={this.props.onUpdateData}/>
        case "log-level":
          return <PcSetNumericPolicy max={5} step={1} policyName={this.state.policyName} policy={this.props.policy} onUpdateData={this.props.onUpdateData}/>
        case "lb-scoring-weight":
        case "loadbalancing-controller-policy":
          return <PcSetLoadbalancingControllerPolicy policyName={this.state.policyName} policy={this.props.policy} onUpdateData={this.props.onUpdateData}/>
        case "analytic-metrics-weight":
          return <PcSetNumericPolicy max={1} step={0.1} policyName={this.state.policyName} policy={this.props.policy} onUpdateData={this.props.onUpdateData}/>
        case "post-scheduling-type":
          selectBoxData = [{name:"FIFO", value:"FIFO"},{name:"OPENMCP", value:"OPENMCP"}]
          
          return <PcSetSelectBoxPolicy isFloat= {false} policyName={this.state.policyName} policy={this.props.policy} onUpdateData={this.props.onUpdateData} selectBoxData={selectBoxData}/>
        case "scheduling-policy":
          selectBoxData = [{name:"RR", value:"RR"},{name:"OpenMCP", value:"OpenMCP"}]
          
          return <PcSetSelectBoxPolicy isFloat= {false} policyName={this.state.policyName} policy={this.props.policy} onUpdateData={this.props.onUpdateData} selectBoxData={selectBoxData}/>
        case "hpa-minmax-distribution-mode":
          selectBoxData = [{name:"Equal", value:"Equal"},{name:"Unequal", value:"Unequal"}]
          
          return <PcSetSelectBoxPolicy isFloat= {false} policyName={this.state.policyName} policy={this.props.policy} onUpdateData={this.props.onUpdateData} selectBoxData={selectBoxData}/>
        case "predictive-scaling":
          selectBoxData = [{name:"Enable", value:"Enable"},{name:"Disable", value:"Disable"}]
          
          return <PcSetSelectBoxPolicy isFloat= {false} policyName={this.state.policyName} policy={this.props.policy} onUpdateData={this.props.onUpdateData} selectBoxData={selectBoxData}/>
        default : //hpa-minmax-distribution-mode
         return <PcSetTextValuePolicy isFloat= {false} policyName={this.state.policyName} policy={this.props.policy} onUpdateData={this.props.onUpdateData}/>

      }
    }
    return (
      <div>
        <PolicyDialog/>
      </div>
    );
  }
}

export default PcSetOMCPPolicy;
