import React, { Component } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { TextField } from "@material-ui/core";
import * as utilLog from "../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import {
  PagingState,
  SortingState,
  SelectionState,
  IntegratedFiltering,
  IntegratedPaging,
  IntegratedSorting,
  RowDetailState,
} from "@devexpress/dx-react-grid";
import {
  Grid,
  Table,
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
  TableSelection,
  TableRowDetail,
} from "@devexpress/dx-react-grid-material-ui";
import Paper from "@material-ui/core/Paper";
import axios from "axios";
import ProgressTemp from "./../../../modules/ProgressTemp";
import Confirm2 from "./../../../modules/Confirm2";
import { withTranslation } from "react-i18next";

class AddGKENode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeName: "",
      desiredNumber: 0,
      columns: [],
      defaultColumnWidths: [
        { columnName: "name", width: 130 },
        { columnName: "status", width: 130 },
        { columnName: "provider", width: 130 },
        // { columnName: "pools", width: 130 },
        { columnName: "cpu", width: 130 },
        { columnName: "memory", width: 120 },
      ],
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 3,
      pageSizes: [3, 6, 12, 0],
      open: false,
      clusters: "",
      selection: [],
      selectedRow: "",
      value: 0,
      expandedRowIds: [],

      confirmOpen: false,
      confirmInfo: {
        title: "Add Node Confirm",
        context: "Are you sure you want to add Node?",
        button: {
          open: "",
          yes: "CONFIRM",
          no: "CANCEL",
        },
      },
      confrimTarget: "",
      confirmTargetKeyname: "",
      completed: 0,
    };
  }

  componentDidMount() {
    let provider = "gke";
    this.timer = setInterval(this.progress, 20);
    this.initState();
    this.setState({
      open: true,
    });
    this.callApi(`/clusters/public-cloud?provider=${provider}`)
      .then((res) => {
        this.setState({ clusters: res });
        clearInterval(this.timer);

        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-ND-VW04");
      })
      .catch((err) => console.log(err));
  }

  initState = () => {
    this.setState({
      selection: [],
      selectedRow: "",
      // privateKey:"",
      nodeName: "",
      desiredNumber: 0,
      expandedRowIds: [],
    });
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  handleSaveClick = () => {
    const t = this.props.t;
    if (Object.keys(this.state.selectedRow).length === 0) {
      alert(t("common.msg.unselected-target"));
      return;
    } else if (this.state.desiredNumber === 0) {
      alert(t("nodes.pop-addNode.msg-checkDesiredZero"));
    } else {
      this.setState({
        confirmOpen: true,
      });
    }
    // alert("GKE SAVE");
  };

  //callback
  confirmed = (result) => {
    this.setState({ confirmOpen: false });

    //show progress loading...
    this.setState({ openProgress: true });

    if (result) {
      var selectedRowId = this.state.expandedRowIds;
      //Add Node excution
      const url = `/nodes/add/gke`;
      const data = {
        // cluster:this.state.selectedRow.cluster,
        cluster: this.state.clusters[selectedRowId].name,
        nodePool: this.state.selectedRow.nodePoolName,
        desiredCnt: this.state.desiredNumber,
      };

      axios
        .post(url, data)
        .then((res) => {
          if (res.data.error) {
            // alert(res.data.message);
          } else {
            this.props.handleClose();
            //write log
            let userId = null;
            AsyncStorage.getItem("userName", (err, result) => {
              userId = result;
            });
            utilLog.fn_insertPLogs(userId, "log-ND-EX05");
          }
          this.setState({ openProgress: false });
        })
        .catch((err) => {
          this.setState({ openProgress: false });
          this.props.handleClose();
        });
    } else {
      // confirm cancel
      this.setState({ confirmOpen: false });
      this.setState({ openProgress: false });
    }
  };

  callApi = async (uri) => {
    let g_clusters;
    AsyncStorage.getItem("g_clusters", (err, result) => {
      g_clusters = result.split(",");
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        g_clusters: g_clusters,
        provider: "GKE",
      }),
    };

    const response = await fetch(uri, requestOptions);
    const body = await response.json();
    return body;
  };

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  HeaderRow = ({ row, ...restProps }) => (
    <Table.Row
      {...restProps}
      style={{
        cursor: "pointer",
        backgroundColor: "whitesmoke",
        // ...styles[row.sector.toLowerCase()],
      }}
      // onClick={()=> alert(JSON.stringify(row))}
    />
  );

  onSelectionChange = (selection) => {
    this.setState({
      desiredNumber:
        selection.initialNodeCount === undefined
          ? "0"
          : selection.initialNodeCount.toString(),
      selectedRow: selection,
    });
  };

  onExpandedRowIdsChange = (selection) => {
    if (selection.length > 1) selection.splice(0, 1);
    return this.setState({ expandedRowIds: selection });
  };

  RowDetail = ({ row }) => (
    <div>
      <GKENodePools
        cluster={row.name}
        onSelectionChange={this.onSelectionChange}
        t={this.props.t}
      />
    </div>
  );

  render() {
    const t = this.props.t;
    const columns = [
      { name: "name", title: t("nodes.pop-addNode.grid.name") },
      { name: "status", title: t("nodes.pop-addNode.grid.status") },
      { name: "provider", title: t("nodes.pop-addNode.grid.type") },
      { name: "cpu", title: t("nodes.pop-addNode.grid.cpu") },
      { name: "memory", title: t("nodes.pop-addNode.grid.memory") },
    ];
    return (
      <div>
        {this.state.openProgress ? (
          <ProgressTemp
            openProgress={this.state.openProgress}
            closeProgress={this.closeProgress}
          />
        ) : (
          ""
        )}

        <Confirm2
          confirmInfo={this.state.confirmInfo}
          confrimTarget={this.state.confrimTarget}
          confirmTargetKeyname={this.state.confirmTargetKeyname}
          confirmed={this.confirmed}
          confirmOpen={this.state.confirmOpen}
        />
        {this.state.clusters ? (
          [
            <section className="md-content">
              <div className="outer-table">
                <p>{t("nodes.pop-addNode.grid.title")}</p>
                {/* cluster selector */}
                <Paper>
                  <Grid rows={this.state.clusters} columns={columns}>
                    {/* Sorting */}
                    <SortingState
                      defaultSorting={[
                        { columnName: "status", direction: "asc" },
                      ]}
                    />

                    {/* 페이징 */}
                    <PagingState
                      defaultCurrentPage={0}
                      defaultPageSize={this.state.pageSize}
                    />
                    <PagingPanel pageSizes={this.state.pageSizes} />
                    {/* <SelectionState
                selection={this.state.selection}
                onSelectionChange={this.onSelectionChange}
              /> */}

                    <IntegratedFiltering />
                    <IntegratedSorting />
                    {/* <IntegratedSelection /> */}
                    <IntegratedPaging />

                    {/* 테이블 */}
                    <RowDetailState
                      // defaultExpandedRowIds={[2, 5]}
                      expandedRowIds={this.state.expandedRowIds}
                      onExpandedRowIdsChange={this.onExpandedRowIdsChange}
                    />
                    <Table />
                    <TableColumnResizing
                      defaultColumnWidths={this.state.defaultColumnWidths}
                    />
                    <TableHeaderRow
                      showSortingControls
                      rowComponent={this.HeaderRow}
                    />
                    <TableRowDetail contentComponent={this.RowDetail} />
                    {/* <TableSelection
                selectByRowClick
                highlightRow
                // showSelectionColumn={false}
              /> */}
                  </Grid>
                </Paper>
              </div>
            </section>,
            <section className="md-content">
              <div style={{ display: "flex" }}>
                <div className="props" style={{ width: "30%" }}>
                  <p>{t("nodes.pop-addNode.desiredNum")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    type="number"
                    placeholder="workers count"
                    variant="outlined"
                    value={this.state.desiredNumber}
                    fullWidth={true}
                    name="desiredNumber"
                    onChange={this.onChange}
                  />
                </div>
              </div>
            </section>,
          ]
        ) : (
          <CircularProgress
            variant="determinate"
            value={this.state.completed}
            style={{ position: "relative", left: "48%", marginTop: "10px" }}
          ></CircularProgress>
        )}
      </div>
    );
  }
}

class GKENodePools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      columns: [
        { name: "nodePoolName", title: "NodePoolName" },
        { name: "machineType", title: "Machine Type" },
        { name: "initialNodeCount", title: "Desired" },
      ],
      defaultColumnWidths: [
        { columnName: "nodePoolName", width: 150 },
        { columnName: "machineType", width: 130 },
        { columnName: "initialNodeCount", width: 130 },
      ],

      selection: [],
      selectedRow: "",
      value: 0,
      completed: 0,
      loadErr: false,
    };
  }

  componentDidMount() {
    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((res) => {
        if (res.hasOwnProperty("error")) {
          this.setState({ loadErr: true });
        } else {
          this.setState({ loadErr: false });
          this.setState({ rows: res });
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  }

  initState = () => {
    this.setState({
      selection: [],
      selectedRow: "",
    });
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  callApi = async () => {
    const response = await fetch(
      `/gke/clusters/pools?clustername=${this.props.cluster}`
    );
    const body = await response.json();
    return body;
  };

  HeaderRow = ({ row, ...restProps }) => (
    <Table.Row
      {...restProps}
      style={{
        cursor: "pointer",
        backgroundColor: "#ffe7e7",
        // backgroundColor: "whitesmoke",
        // ...styles[row.sector.toLowerCase()],
      }}
      // onClick={()=> alert(JSON.stringify(row))}
    />
  );

  onSelectionChange = (selection) => {
    if (selection.length > 1) selection.splice(0, 1);

    this.setState({ selection: selection });
    if (selection.length > 0) {
      this.setState({ selectedRow: this.state.rows[selection[0]] });
      this.props.onSelectionChange(this.state.rows[selection[0]]);
    } else {
      this.setState({ selectedRow: {} });
      this.props.onSelectionChange(0);
    }
  };

  render() {
    const t = this.props.t;
    return (
      <div className="inner-table">
        {this.state.rows ? (
          <Grid rows={this.state.rows} columns={this.state.columns}>
            {/* Sorting */}
            <SortingState
              defaultSorting={[{ columnName: "status", direction: "asc" }]}
            />

            <SelectionState
              selection={this.state.selection}
              onSelectionChange={this.onSelectionChange}
            />

            <IntegratedFiltering />
            <IntegratedSorting />

            {/* 테이블 */}
            <Table />
            <TableColumnResizing
              defaultColumnWidths={this.state.defaultColumnWidths}
            />
            <TableHeaderRow showSortingControls rowComponent={this.HeaderRow} />
            <TableSelection
              selectByRowClick
              highlightRow
              // showSelectionColumn={false}
            />
          </Grid>
        ) : this.state.loadErr ? (
          <div style={{ textAlign: "center" }}>
            {t("nodes.pop-addNode.msg-dataNotExists1")}
            <br />
            {t("nodes.pop-addNode.msg-dataNotExists2")}
          </div>
        ) : (
          <CircularProgress
            variant="determinate"
            value={this.state.completed}
            style={{ position: "relative", left: "48%", marginTop: "10px" }}
          ></CircularProgress>
        )}
      </div>
    );
  }
}

export default withTranslation()(AddGKENode);
