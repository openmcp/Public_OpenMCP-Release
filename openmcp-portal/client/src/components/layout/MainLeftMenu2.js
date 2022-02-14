import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineDashboard, AiFillDashboard, AiOutlineDeploymentUnit, AiOutlineUser, AiFillAlert, AiOutlineSetting, AiOutlineAreaChart} from "react-icons/ai";
import { MdCached } from "react-icons/md";
import { RiDashboardFill } from "react-icons/ri";
import { GrBundle } from "react-icons/gr";
import { FaBuffer} from "react-icons/fa";
import { CgServer } from "react-icons/cg";
import { FiBox } from "react-icons/fi";
import { BiNetworkChart, BiDollarCircle } from "react-icons/bi";
import { HiOutlineDuplicate,HiOutlineCamera } from "react-icons/hi";
import { RiInboxUnarchiveLine } from "react-icons/ri";
import { IoKeyOutline } from "react-icons/io5";
import { SiGraphql } from "react-icons/si";
import { AsyncStorage } from "AsyncStorage";
import { withTranslation } from 'react-i18next';

class LeftMenu2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menus: []
    };
  }

  componentWillMount(){
    
    // AsyncStorage.setItem("dashboard-cycle", item.description);
  }

  render() {
    const {t} = this.props;
    const menuList = [
      {
        type: "multi",
        role: "all",
        title: t("leftMenu.monitor.name"),
        path: "/dashboard",
        icon : <AiFillDashboard className="leftMenu-main-icon"/>,
        sub: [
          {
            role: "all",
            title: t("leftMenu.monitor.sub.dashboard"),
            path: "/dashboard",
            icon : <RiDashboardFill className="leftMenu-sub-icon"/>,
          },
          {
            role: "all",
            title: t("leftMenu.monitor.sub.multipleMetric"),
            path: "/multiple-metrics",
            icon : <AiOutlineDashboard className="leftMenu-sub-icon"/>,
          },
        ],
      },
      {
        type: "multi",
        role: "all",
        title: t("leftMenu.multipleClusters.name"),
        path: "/clusters",
        icon : <GrBundle className="leftMenu-main-icon"/>,
        sub: [
          {
            role: "all",
            title: t("leftMenu.multipleClusters.sub.clusters"),
            path: "/clusters/joined",
            icon : <FaBuffer className="leftMenu-sub-icon"/>,
          },
          {
            role: "all",
            title: t("leftMenu.multipleClusters.sub.nodes"),
            path: "/nodes",
            icon : <CgServer className="leftMenu-sub-icon"/>,
          },
          
        ],
      },
      {
        type: "multi",
        role: "all",
        title: t("leftMenu.workloads.name"),
        path: "/projects",
        icon : <HiOutlineDuplicate className="leftMenu-main-icon"/>,
        sub: [
          {
            role: "all",
            title: t("leftMenu.workloads.sub.projects"),
            path: "/projects",
            icon : <HiOutlineDuplicate className="leftMenu-sub-icon"/>,
          },
          {
            role: "all",
            title: t("leftMenu.workloads.sub.deployments"),
            path: "/deployments",
            icon : <AiOutlineDeploymentUnit className="leftMenu-sub-icon"/>,
          },
          {
            role: "all",
            title: t("leftMenu.workloads.sub.pods"),
            path: "/pods",
            icon : <FiBox className="leftMenu-sub-icon"/>,
          },
          {
            role: "all",
            title: t("leftMenu.workloads.sub.network"),
            path: "/network",
            icon : <BiNetworkChart className="leftMenu-sub-icon"/>,
          },
        ],
      },
      {
        type: "multi",
        role: "all",
        title: t("leftMenu.motions.name"),
        path: "/motions/Migrations",
        icon : <AiFillDashboard className="leftMenu-main-icon"/>,
        sub: [
          {
            role: "all",
            title: t("leftMenu.motions.sub.migrations"),
            path: "/motions/migration",
            icon : <RiInboxUnarchiveLine className="leftMenu-sub-icon"/>,
          },
          {
            role: "all",
            title: t("leftMenu.motions.sub.snapshots"),
            path: "/motions/snapshot",
            icon : <HiOutlineCamera className="leftMenu-sub-icon"/>,
          },
          {
            role: "all",
            title: t("leftMenu.motions.sub.globalCache"),
            path: "/motions/globalcache",
            icon : <MdCached className="leftMenu-sub-icon"/>,
          },
        ],
      },
      {
        type: "multi",
        role: "all",
        title: t("leftMenu.settings.name"),
        path: "/settings",
        icon : <AiFillDashboard className="leftMenu-main-icon"/>,
        sub: [
          {
            role: "admin",
            title: t("leftMenu.settings.sub.accounts"),
            path: "/settings/accounts",
            icon : <AiOutlineUser className="leftMenu-sub-icon"/>,
          },
          {
            role: "admin",
            title: t("leftMenu.settings.sub.groupRole"),
            path: "/settings/group-role",
            icon : <SiGraphql className="leftMenu-sub-icon"/>,
          },
          {
            role: "admin",
            title: t("leftMenu.settings.sub.policy"),
            path: "/settings/policy",
            icon : <IoKeyOutline className="leftMenu-sub-icon"/>,
          },
          {
            role: "all",
            title: t("leftMenu.settings.sub.alert"),
            path: "/settings/alert",
            icon : <AiFillAlert className="leftMenu-sub-icon"/>,
          },
          {
            role: "admin",
            title: t("leftMenu.settings.sub.meterings"),
            path: "/settings/metering",
            icon : <AiOutlineAreaChart className="leftMenu-sub-icon"/>,
          },
          {
            role: "all",
            title: t("leftMenu.settings.sub.billings"),
            path: "/settings/billing",
            icon : <BiDollarCircle className="leftMenu-sub-icon"/>,
          },
          {
            role: "admin",
            title: t("leftMenu.settings.sub.config"),
            path: "/settings/config",
            icon : <AiOutlineSetting className="leftMenu-sub-icon"/>,
          },
        ],
      },
    ];
    const lists = [];

    let role;
    AsyncStorage.getItem("roles", (err, result) => {
      role = result;
    });
    
    menuList.forEach((item) => {
      if(role === 'admin'){
        lists.push(
          <li className="treeview left-main-menu">
            <div className="sidebar-main-title">
              
              <span>{item.title}</span>
            </div>
            <ul className="treeview-menu sidebar-sub-title">
              {item.sub.map((subItem) => {
                return (
                  <li>
                    <NavLink
                      to={{
                        pathname: `${subItem.path}`,
                      }}
                      activeClassName="active"
                    >
                      {subItem.icon}
                      <span>{subItem.title}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      } else {
        if(item.role !== 'admin'){
          lists.push(
            <li className="treeview left-main-menu">
              <div className="sidebar-main-title">
                
                <span>{item.title}</span>
              </div>
              <ul className="treeview-menu sidebar-sub-title">
                {item.sub.map((subItem) => {
                  return (
                    subItem.role !== 'admin' ? 
                    <li>
                      <NavLink
                        to={{
                          pathname: `${subItem.path}`,
                        }}
                        activeClassName="active"
                      >
                        {subItem.icon}
                        <span>{subItem.title}</span>
                      </NavLink>
                    </li>
                    : null
                  )
                })}
              </ul>
            </li>
          );
        }
      }
    });
    // console.log("this.props.title", this.props.title)
    return (
      <div>
        <aside className="main-sidebar">
          <section className="sidebar">
            <ul className="sidebar-menu tree" data-widget="tree">
              {lists}
            </ul>
          </section>
        </aside>
      </div>
    );
  }
}

export default withTranslation()(LeftMenu2); 
