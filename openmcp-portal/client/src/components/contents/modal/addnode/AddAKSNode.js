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

class AddAKSNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: "",
      clientSec: "",
      tenantId: "",
      subId: "",

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
    let provider = "aks";
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
        utilLog.fn_insertPLogs(userId, "log-ND-VW05");
      })
      .catch((err) => console.log(err));
  }

  initState = () => {
    this.setState({
      selection: [],
      selectedRow: "",
      clientId: "",
      clientSec: "",
      tenantId: "",
      subId: "",
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
    // console.log(this.state.selectedRow)
    // if (this.state.clientId === "") {
    //   alert("Please enter Client Id");
    //   return;
    // } else if (this.state.clientSec === ""){
    //   alert("Please enter Client SEC");
    //   return;
    // } else if (this.state.tenantId === ""){
    //   alert("Please enter Tenant ID");
    //   return;
    // } else if (this.state.subId === ""){
    //   alert("Please enter Sub ID");
    //   return;
    // } else if (Object.keys(this.state.selectedRow).length  === 0){
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
  };

  //confirme allback
  confirmed = (result) => {
    this.setState({ confirmOpen: false });

    //show progress loading...
    this.setState({ openProgress: true });

    if (result) {
      var selectedRowId = this.state.expandedRowIds;

      //Add Node excution
      const url = `/nodes/add/aks`;
      const data = {
        desiredCnt: this.state.desiredNumber,
        cluster: this.state.clusters[selectedRowId].name,
        nodePool: this.state.selectedRow.name,
        region: this.state.selectedRow.region,
      };

      // clientID = "1edadbd7-d466-43b1-ad73-15a2ee9080ff"
      // clientSec = "07.Tx2r7GobBf.Suq7quNRhO_642z-p~6a"
      // tenantID = "bc231a1b-ab45-4865-bdba-7724c2893f1c"
      // subID := "dc80d3cf-4e1a-4b9a-8785-65c4b739e8d2"

      axios
        .post(url, data)
        .then((res) => {
          if (res.data.error) {
            // alert(res.data.message);
          } else {
            this.props.handleClose();
            
            
            let userId = null;
            AsyncStorage.getItem("userName", (err, result) => {
              userId = result;
            });
            utilLog.fn_insertPLogs(userId, "log-ND-EX06");
          }
          this.setState({ openProgress: false });
        })
        .catch((err) => {
          this.setState({ openProgress: false });
          this.props.handleClose();
        });
    } else {
      this.setState({ openProgress: false });
      console.log("cancel");
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
        provider: "AKS",
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
        selection.nodecount === undefined
          ? "0"
          : selection.nodecount.toString(),
      selectedRow: selection,
    });
  };

  onExpandedRowIdsChange = (selection) => {
    if (selection.length > 1) selection.splice(0, 1);
    return this.setState({ expandedRowIds: selection });
  };

  RowDetail = ({ row }) => (
    <div>
      <AKSNodePools
        cluster={row.name}
        onSelectionChange={this.onSelectionChange}
        t={this.props.t}
      />
    </div>
  );

  // clientID = "1edadbd7-d466-43b1-ad73-15a2ee9080ff"
  // clientSec = "07.Tx2r7GobBf.Suq7quNRhO_642z-p~6a"
  // tenantID = "bc231a1b-ab45-4865-bdba-7724c2893f1c"
  // subID := "dc80d3cf-4e1a-4b9a-8785-65c4b739e8d2"

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

class AKSNodePools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      columns: [
        { name: "name", title: "AgentPool" },
        { name: "vmssname", title: "VmssName" },
        // { name: "min", title: "Min" },
        // { name: "max", title: "Max" },
        { name: "nodecount", title: "Desired" },
        { name: "region", title: "Region" },
      ],
      defaultColumnWidths: [
        { columnName: "name", width: 130 },
        { columnName: "vmssname", width: 250 },
        // { columnName: "min", width: 100 },
        // { columnName: "max", width: 100 },
        { columnName: "nodecount", width: 130 },
        { columnName: "region", width: 130 },
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
        // var result = [];
        // res.map(item=>
        //   item.cluster == this.props.rowData ? result.push(item) : ""
        // )
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
      `/aks/clusters/pools?clustername=${this.props.cluster}`
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

export default withTranslation()(AddAKSNode);
