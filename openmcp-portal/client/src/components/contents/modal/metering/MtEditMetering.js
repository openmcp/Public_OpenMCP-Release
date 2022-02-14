import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import * as utilLog from "./../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import axios from "axios";
import { withTranslation } from 'react-i18next';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

class MtEditMetering extends React.Component {
  state = {
    open: false,
    workers: [
      {
        index: Math.random(),
        worker: null,
        id: "new",
        ynUpdated : false,
      },
    ],
    deleteRecord:[],
  };

  

  handleChange = (e) => {
    if (
      ["cpu", "memory", "disk", "cost"].includes(
        e.target.name
      )
    ) {
      let workers = [...this.state.workers];
      workers[e.target.dataset.id].worker[e.target.name] = e.target.value;
      workers[e.target.dataset.id].ynUpdated = true;

    } else {
      this.setState({ [e.target.name]: e.target.value });
    }
  };

  onChange = (e) => {
    this.setState({
      [e.target.name] : e.target.value
    })
  }

  addNewRow = (e) => {
    this.setState((prevState) => ({
      workers: [
        ...prevState.workers,
        {
          index: Math.random(),
          worker: {id : "new", cpu:0, memory:0, disk:0, cost:0,},
          ynUpdated : false,
        },
      ],
    }));
  };

  handleClickOpen = () => {
    if (Object.keys(this.props.selectedRow).length === 0) {
      alert("Please select a region cost data row");
      this.setState({ open: false });
      return;
    }

    let workers= [];
    for (var i = 0; i<this.props.selectedRow[0].workers.length; i++) {
      workers.push({
        index: Math.random(),
        worker: {
          id : this.props.selectedRow[0].workers[i].id,
          cpu : this.props.selectedRow[0].workers[i].cpu, 
          memory: this.props.selectedRow[0].workers[i].memory, 
          disk: this.props.selectedRow[0].workers[i].disk, 
          cost: this.props.selectedRow[0].workers[i].cost},
        ynUpdated : false,
      },);
    };

    this.setState({
      open: true,
      rows : this.props.selectedRow[0],
      cost:this.props.selectedRow[0].cost,
      workers :workers
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  clickOnDelete(record) {
    
    let deleteRow = this.state.workers.filter((r) =>  r !== record);

    if(record.worker.id !== "new"){
      this.setState((prevState)=> ({deleteRecord :[
        ...prevState.deleteRecord, record.worker],
      }));
    }

    this.setState({
      workers: deleteRow
    });
  }

  handleSave = (e) => {
    let updatedRecord = [];
    let newRecord =[];
    this.state.workers.forEach((item)=>{
      if(item.worker.id !== "new" && item.ynUpdated){
        updatedRecord.push(item.worker);
      }

      if(item.worker.id === "new"){
        newRecord.push(item.worker);
      }
    });

    const url = `/apis/metering/worker`;

    const data ={
      regionCost : this.state.cost,
      region : this.state.rows.region,
      newRecord : newRecord,
      deleteRecord : this.state.deleteRecord,
      updateRecord : updatedRecord
    }

    axios
      .post(url, data)
      .then((res) => {
        this.props.onUpdateData();
        // alert(res.data.message);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
    
        utilLog.fn_insertPLogs(userId, "log-MR-EX02");
      })
      .catch((err) => {
        console.log("Error : ", err);
      });

    this.setState({ open: false });
  };

  render() {
    const {t} = this.props;
    const DialogTitle = withStyles(styles)((props) => {
      const { children, classes, onClose, ...other } = props;
      return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
          <Typography variant="h6">{children}</Typography>
          {onClose ? (
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={onClose}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </MuiDialogTitle>
      );
    });

    let { workers } = this.state;
    return (
      <div>
        <Button
          variant="outlined"
          color="primary"
          onClick={this.handleClickOpen}
          style={{
            position: "absolute",
            right: "0px",
            top: "2px",
            zIndex: "10",
            width: "148px",
            height: "31px",
            textTransform: "capitalize",
          }}
        >
          {t("meterings.pop-edit.btn-add")}
        </Button>

        <Dialog
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth={false}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {t("meterings.pop-edit.title")}
          </DialogTitle>
          <DialogContent dividers>
          {this.state.rows ? (
          <div className="mt-set-metering">
                <div className="res transfer-price">
                  <Typography id="content-title" gutterBottom>
                    {t("meterings.pop-edit.region")}
                  </Typography>
                  <div className="txt">
                    Code : {this.state.rows.region}, Name :{" "}
                    {this.state.rows.region_name}
                  </div>
                </div>
                <div className="res transfer-price">
                  <Typography id="content-title" gutterBottom>
                    {t("meterings.pop-edit.clusterCost")}
                  </Typography>
                  <div className="txt ">
                    <span className="price">$</span>
                    <div className="input-txt">
                      <input
                        type="number"
                        placeholder="0"
                        name="cost"
                        value={this.state.cost}
                        onChange={this.onChange}
                      />
                    </div>
                    <span className="per">
                    {t("meterings.pop-edit.costDescription")}
                    </span>
                  </div>
                </div>
                <form className="res transfer-price" onChange={this.handleChange}> 
                  <div style={{ display: "flex" }}>
                    <Typography id="content-title" gutterBottom>
                    {t("meterings.pop-edit.workerNodeCost")}
                    </Typography>
                  </div>
          
                  <MtWorkerNodeCost
                    delete={this.clickOnDelete.bind(this)}
                    workers={workers}
                    t={t}
                  />

                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={this.addNewRow}
                    style={{
                      width: "100%",
                      height: "31px",
                      textTransform: "capitalize",
                      margin: "10px 0",
                      background: "#4496c7",
                      border: "1px solid #4496c7",
                      // fontSize:"25px"
                    }}
                  >
                    +
                  </Button>
                </form>
              </div>
              ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSave} color="primary">
              {t("common.btn.save")}
            </Button>
            <Button onClick={this.handleClose} color="primary">
              {t("common.btn.cancel")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const MtWorkerNodeCost = (props) => {
  const t = props.t;
  return props.workers.map((val, idx) => {
    let cpu = `name-${idx}`,
    memory = `memory-${idx}`,
    disk = `disk-${idx}`,
    cost = `cost-${idx}`;

    return (
      <div className="txt" key={val.index} id={val.index}>
        <div className="input-section">
          <span className="label">vCPU</span>
          <div className="input-txt">
            <input
              id={cpu}
              type="number"
              placeholder="0"
              name="cpu"
              style={{ textAlign: "center", padding: "0" }}
              // onChange={this.onChange}
              defaultValue={val.worker.cpu || ''}
              data-id={idx}
            />
          </div>
        </div>

        <div className="input-section">
          <span className="label">Memory</span>
          <div className="input-txt">
            <input
              id={memory}
              type="number"
              placeholder="0"
              name="memory"
              style={{ textAlign: "center", padding: "0" }}
              defaultValue={val.worker.memory || ''}
              data-id={idx}
              // onChange={this.onChange}
            />
          </div>
          <span className="label">GB</span>
        </div>

        <div className="input-section">
          <span className="label">Disk</span>
          <div className="input-txt">
            <input
              id={disk}
              type="number"
              placeholder="0"
              name="disk"
              style={{ textAlign: "center", padding: "0" }}
              defaultValue={val.worker.disk || ''}
              data-id={idx}
              // onChange={this.onChange}
            />
          </div>
          <span className="label">GB</span>
        </div>

        <div className="input-section">
          <span className="label">Hourly Cost $</span>
          <div className="input-txt">
            <input
              id={cost}
              type="number"
              placeholder="0"
              name="cost"
              style={{ textAlign: "center", padding: "0" }}
              defaultValue={val.worker.cost || ''}
              data-id={idx}
              // onChange={this.onChange}
            />
          </div>
        </div>

        <Button
          variant="outlined"
          color="primary"
          onClick={() => props.delete(val)}
          style={{
            width: "74px",
            height: "31px",
            textTransform: "capitalize",
            // fontSize:"25px"
          }}
        >
          {t("common.btn.delete")}
        </Button>
      </div>
    );
  });
};

export default withTranslation()(MtEditMetering); 