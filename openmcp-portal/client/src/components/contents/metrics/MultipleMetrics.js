import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { NavigateNext} from '@material-ui/icons';
import * as utilLog from './../../util/UtLogs.js';
import { AsyncStorage } from 'AsyncStorage';
import { AiOutlineDashboard } from "react-icons/ai";

import MetricCluster from "./sector/MetricCluster.js";
import MetricApiServer from "./sector/MetricApiServer.js";
import MetricSelectBox from "./module/MetricSelectBox.js";

import MetricNamespace from "./sector/MetricNamespace.js";
import MetricNode from "./sector/MetricNode.js";
import { withTranslation } from 'react-i18next';


class MultipleMetrics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      cluster : "",
      selectBoxData : ""
    };
  }

  componentWillMount() {
    // this.props.menuData("none");
  }

  callApi = async () => {
    let g_clusters;
    AsyncStorage.getItem("g_clusters",(err, result) => { 
      g_clusters = result.split(',');
    });

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ g_clusters : g_clusters })
    };

    const response = await fetch(`/apis/metric/clusterlist`,requestOptions);
    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  //컴포넌트가 모두 마운트가 되었을때 실행된다.
  componentDidMount() {
    //데이터가 들어오기 전까지 프로그래스바를 보여준다.
    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((res) => {
        if(res === null){
          this.setState({ rows: [] });
        } else {
          let selectBoxData = []
          res.forEach((item)=>{
            selectBoxData.push({name : item, value: item});
          })
          this.setState({ 
            // cluster : res[0],
            cluster : "cluster08",
            selectBoxData: selectBoxData 
          });
        }
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName",(err, result) => { 
          userId= result;
        })
        utilLog.fn_insertPLogs(userId, 'log-MM-VW01');
      })
      .catch((err) => console.log(err));

  };

  onRefresh = () => {
    this.callApi()
      .then((res) => {
        if(res === null){
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };


  render() {
    const {t} = this.props;
    const onSelectBoxChange = (data) => {
      // this.setState({cluster : data});
      this.setState({cluster : "cluster08"})

      let userId = null;
      AsyncStorage.getItem("userName",(err, result) => {
        userId= result;
      })
      utilLog.fn_insertPLogs(userId, 'log-MM-CG01');
    }

    return (
      <div className="content-wrapper multiple-metrics">
        <section className="content-header" onClick={this.onRefresh}>
          <h1>
            <i><AiOutlineDashboard/></i>
            <span>
              {t("multipleMetrics.title")}
            </span>
            <small></small>
          </h1>
          <ol className="breadcrumb">
            <li>
              <NavLink to="/dashboard">{t("common.nav.home")}</NavLink>
            </li>
            <li className="active">
              <NavigateNext style={{fontSize:12, margin: "-2px 2px", color: "#444"}}/>
              {t("multipleMetrics.title")}
            </li>
          </ol>
        </section>
        {this.state.selectBoxData ? ([
          <div style={{padding:"10px 15px 0px 15px"}}>
              <MetricSelectBox rows={this.state.selectBoxData} onSelectBoxChange={onSelectBoxChange} defaultValue=""></MetricSelectBox>
          </div>,
          <section className="content" style={{ position: "relative" }}>
            <div className="m-metrics">
              <MetricApiServer cluster={this.state.cluster}/>
              <MetricCluster cluster={this.state.cluster}/>
              <MetricNamespace cluster={this.state.cluster}/>
              <MetricNode cluster={this.state.cluster}/>
            </div>
          </section>
        ]
        ) : (
          <CircularProgress
            variant="determinate"
            value={this.state.completed}
            style={{ position: "absolute", left: "50%", marginTop: "20px" }}
          ></CircularProgress>
        )}
      </div>
    );
  }
}

export default withTranslation()(MultipleMetrics); 
