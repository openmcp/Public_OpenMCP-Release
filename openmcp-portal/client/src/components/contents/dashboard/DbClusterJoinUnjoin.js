import React, { Component } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaServer } from "react-icons/fa";
import { RiArrowLeftRightLine } from "react-icons/ri";
// import { BsArrowLeftRight } from "react-icons/bs";
import { CircularProgress } from "@material-ui/core";
import { AsyncStorage } from "AsyncStorage";
import * as utilLog from "../../util/UtLogs.js";
import Axios from "axios";
import { withTranslation } from 'react-i18next';
// import { t } from "i18next";

class DbClusterJoinUnjoin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      loadErr: "",
      completed: 0,
      reRender: "",
      masterCluster: "",
      componentList: [],
      refreshCycle: 5000,
    };
  }

  componentWillMount() {
    let cycle = 5000;
    AsyncStorage.getItem("dashboard-cycle", (err, result) => {
      cycle = result * 1000;
    });

    this.setState({
      refreshCycle: cycle,
    });
  }

  componentDidMount() {
    this.timer2 = setInterval(this.onRefresh, this.state.refreshCycle);
    this.timer = setInterval(this.progress, 20);
    this.onRefresh();

    let userId = null;
    AsyncStorage.getItem("userName", (err, result) => {
      userId = result;
    });
    utilLog.fn_insertPLogs(userId, "log-DS-VW03");
  }

  componentWillUnmount() {
    clearInterval(this.timer2);
  }

  callApi = async () => {
    let g_clusters;
    AsyncStorage.getItem("g_clusters", (err, result) => {
      g_clusters = result.split(",");
    });

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ g_clusters: g_clusters }),
    };

    const response = await fetch(`/apis/dashboard/omcp`, requestOptions);
    const body = await response.json();
    return body;
  };

  onRefresh = () => {
    const {t} = this.props;
    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: "" });
        } else {
          if (res.hasOwnProperty("errno")) {
            if (res.code === "ECONNREFUSED") {
              clearInterval(this.timer2);
              this.setState({ loadErr: t("dashboard.connectionFailed") });
            }

            this.setState({ rows: "" });
          } else {
            this.setState({ rows: res });

          }
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };
  angle = {
    full: {
      startAngle: 0,
      endAngle: 360,
    },
    half: {
      startAngle: 0,
      endAngle: 180,
    },
  };

  render() {
    const { t } = this.props;
    return (
      <div className="dash-comp">
        {/* 컨텐츠 내용 */}
        <div style={{ display: "flex" }}>
          <div className="content-box">
            <div className="cb-header" onClick={this.onRefresh}>
              <span style={{ cursor: "pointer" }}>{t("dashboard.joinUnjoin.title")}</span>
            </div>
            <div
              className="cb-body"
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
              }}
            >
              {this.state.rows ? (
                <ClusterDnd data={this.state.rows.joined_clusters} t={t}/>
              ) : (
                <div  style={{
                  // position:"relative",
                  // margin: "20px 10px 10px",
                  // textAlign:"center",
                  position: "relative",
                  margin: "10px auto",
                  left: "0px",
                  right: "0px"
                }}>
                {this.state.loadErr ? 
                  <div>{this.state.loadErr}</div>
                  :
                <CircularProgress
                  variant="determinate"
                  value={this.state.completed}
                 
                ></CircularProgress>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// fake data generator
// const getItems = (count, offset = 0) =>
//   Array.from({ length: count }, (v, k) => k).map((k) => ({
//     id: `cluster-${k + offset}`,
//     content: `cluster ${k + offset}`,
//   }));

// const grid = 8;
const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the joined look a bit nicer
  userSelect: "none",
  // padding: grid * 2,

  // change background colour if dragging
  // background: isDragging ? "#FFFFFF" : "#FFFFFF00",
  background: isDragging ? "#FFFFFF" : "#FFFFFF",

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightgrey" : "#ecf0f5",
});

class ClusterDnd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      // joined: getItems(10),
      // joinable: getItems(1, 10),
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  componentWillMount() {
    var joined = this.props.data[0].children.map((item, i) => ({
      id: `${item.attributes.zone}||${item.attributes.region}||${item.name}||${item.attributes.endpoint}`,
      content: `${item.name} (${item.attributes.endpoint})`,
    }));

    var joinable =
      this.props.data.length > 1
        ? this.props.data[1].children.map((item, i) => ({
            id: `${item.attributes.zone}||${item.attributes.region}||${item.name}||${item.attributes.endpoint}`,
            content: `${item.name}`,
          }))
        : [];

    this.setState({
      joined: joined,
      joinable: joinable,
    });
  }

  /**
   * A semi-generic way to handle multiple lists. Matches
   * the IDs of the joined container to the names of the
   * source arrays stored in the state.
   */
  id2List = {
    joined: "joined",
    joinable: "joinable",
  };

  getList = (id) => this.state[this.id2List[id]];

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  // Moves an item from one list to another list.
  move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  onDragEnd = (result) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      //리스트 순서 이동
      // const joined = this.reorder(
      //   this.getList(source.droppableId),
      //   source.index,
      //   destination.index
      // );
      // let state = { joined };
      // if (source.droppableId === "joinable") {
      //   state = { joinable: joined };
      // }
      // this.setState(state);
    } else {
      //리스트 간의 이동

      let url = "";
      let data = {};

      let droppableIdArr = result.draggableId.split("||");
      let cluster = droppableIdArr[droppableIdArr.length - 2];
      let endpoint = droppableIdArr[droppableIdArr.length - 1];

      let logType = 'log-DS-EX01'
      if (destination.droppableId === "joinable") {
        url = `/cluster/unjoin`;
        data = {
          clusterName: cluster,
        };
        logType = 'log-DS-EX02';
      } else if (destination.droppableId === "joined") {
        url = `/cluster/join`;
        data = {
          clusterName: cluster,
          clusterAddress: endpoint,
        };
      }

      Axios.post(url, data)
        .then((res) => {
          if (res.status === 200) {
            const result = this.move(
              this.getList(source.droppableId),
              this.getList(destination.droppableId),
              source,
              destination
            );

            this.setState({
              joined: result.joined,
              joinable: result.joinable,
            });

            let userId = null;
            AsyncStorage.getItem("userName", (err, result) => {
              userId = result;
            });

            utilLog.fn_insertPLogs(userId, logType);
          }
        })
        .catch((err) => {
          AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
        });
    }
  };

  render() {
    // a little function to help us with reordering the result
    return (
      <div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className="cluster-joined">
            <Droppable droppableId="joined" direction="vertical">
              {(provided, snapshot) => [
                <div className="join-unjoin-title">
                  {this.props.t("dashboard.joinUnjoin.omcpCluster")}
                </div>,
                <div
                  className="dnd-list"
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.state.joined.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className="dnd-item"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                          title={item.content}
                        >
                          <div className="dnd-cluster-icon">
                            <FaServer
                              style={{
                                fontSize: "30px",
                                color: "#0088fe",
                                stroke: "none",
                                background: "#FFFFFF00",
                              }}
                            />
                          </div>
                          <div className="dnd-cluster-text">{item.content}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {/* {provided.placeholder} */}
                </div>,
              ]}
            </Droppable>
          </div>
          <div className="dnd-navi">
            <div>Join</div>
            <RiArrowLeftRightLine />
            <div>Unjoin</div>
          </div>
          <div className="cluster-joinable">
            <Droppable droppableId="joinable" direction="vertical">
              {(provided, snapshot) => [
                <div className="join-unjoin-title">
                 {this.props.t("dashboard.joinUnjoin.joinableCluster")}
                </div>,
                <div
                  className="dnd-list"
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.state.joinable.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className="dnd-item"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                          title={item.content}
                        >
                          <div className="dnd-cluster-icon">
                            <FaServer
                              style={{
                                fontSize: "30px",
                                color: "#959595",
                                stroke: "none",
                                background: "#FFFFFF00",
                              }}
                            />
                          </div>
                          <div className="dnd-cluster-text">{item.content}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {/* {provided.placeholder} */}
                </div>,
              ]}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    );
  }
}

export default withTranslation()(DbClusterJoinUnjoin); 
