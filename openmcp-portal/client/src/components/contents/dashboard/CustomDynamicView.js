import React, { Component } from "react";
import DbClusterJoinUnjoin from "./DbClusterJoinUnjoin";
// import DbClusterTopology from "./DbClusterTopology";
// import DbOmcp from "./DbOmcp";
import DbPowerUsage from "./DbPowerUsage";
import DbRegionGroup from "./DbRegionGroup";
// import DbServiceRegionTopology from "./DbServiceRegionTopology";
// import DbServiceTopology from "./DbServiceTopology";
import DbStatus from "./DbStatus";
import DbTopology from "./DbTopology";
import DbWorldMapClusterStatus from "./DbWorldMapClusterStatus";
import { withTranslation } from 'react-i18next';

class CustomDynamicView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myComponentList: this.props.myComponentList,
      components : []
    };
  }

  componentWillUpdate(prevProps, prevState) {
    
    if (this.props.myComponentList !== prevProps.myComponentList) {
      var componentsTag = [];
      prevProps.myComponentList.forEach((item) => {
        switch (item) {
          case "System Status":
            componentsTag.push(<DbStatus />);
            break;
          case "Cluster Regions":
            componentsTag.push(<DbRegionGroup />);
            break;
          case "World Cluster Status":
            componentsTag.push(<DbWorldMapClusterStatus />);
            break;
          // case "Management Clusters":
          //   componentsTag.push(<DbOmcp />);
          //   break;
          case "Topology":
            componentsTag.push(<DbTopology propsData = {this.props.propsData}/>);
            break;
          case "Cluster Join/Unjoin":
            componentsTag.push(<DbClusterJoinUnjoin propsData = {this.props.propsData} />);
            break;
          case "Cluster Power Usage":
            componentsTag.push(<DbPowerUsage propsData = {this.props.propsData} />);
            break;
          default:
            break;
          // case "Cluster Topology":
          //   componentsTag.push(<DbClusterTopology />);
          //   break;
          // case "Service Topology":
          //   componentsTag.push(<DbServiceTopology />);
          //   break;
          // case "Service-Region Topology":
          //   componentsTag.push(<DbServiceRegionTopology />);
          //   break;
        }
      });
  
      this.setState({components : componentsTag});
    }
  }

  componentWillMount() {
    // const {t} = this.props;
    var componentsTag = [];
    this.state.myComponentList.forEach((item) => {
      switch (item) {
        case "System Status":
          componentsTag.push(<DbStatus />);
          break;
        case "Cluster Regions":
          componentsTag.push(<DbRegionGroup />);
          break;
        case "World Cluster Status":
          componentsTag.push(<DbWorldMapClusterStatus />);
          break;
        // case "Management Clusters":
        //   componentsTag.push(<DbOmcp />);
        //   break;
        case "Topology":
          componentsTag.push(<DbTopology propsData = {this.props.propsData} />);
          break;
        case "Cluster Join/Unjoin":
          componentsTag.push(<DbClusterJoinUnjoin propsData = {this.props.propsData} />);
          break;
        case "Cluster Power Usage":
          componentsTag.push(<DbPowerUsage propsData = {this.props.propsData} />);
          break;
        default:
          break;
      // case "Cluster Topology":
      //   componentsTag.push(<DbClusterTopology />);
      //   break;
      // case "Service Topology":
      //   componentsTag.push(<DbServiceTopology />);
      //   break;
      // case "Service-Region Topology":
      //   componentsTag.push(<DbServiceRegionTopology />);
      //   break;
      }
    });

    this.setState({components : componentsTag});
  }

  render() {
    return (
      <div>
       {this.state.components}
      </div>
    );
  }
}

export default withTranslation()(CustomDynamicView); 