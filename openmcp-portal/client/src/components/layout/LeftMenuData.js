export function getMenu(pathParams, t) {
  const menuData = {
    clusters : [
      {
        type: "single",
        title : t("detailLeftMenu.cluster.overview"),
        path : "/clusters/" + pathParams.cluster + "/overview",
        state : pathParams.state
      },
      {
        type: "single",
        title :  t("detailLeftMenu.cluster.nodes"),
        path : "/clusters/" + pathParams.cluster + "/nodes",
        state : pathParams.state
      },
      {
        type: "single",
        title :  t("detailLeftMenu.cluster.pods"),
        path : "/clusters/" + pathParams.cluster + "/pods",
        state : pathParams.state
      },
      // {
      //   type: "single",
      //   title : "Storage Class",
      //   path : "/clusters/" + pathParams + "/storage_class",
      // },
      // {
      //   type: "multi",
      //   title : "Settings",
      //   path : "/clusters/" + pathParams + "/settings",
      //   sub : [
      //     { title: "Workloads", path: "/clusters/"+pathParams+"/settings/member" },
      //   ]
      // }
    ],
    nodes : [
      {
        type: "single",
        title : "Overview",
        path : "/nodes/" + pathParams.node + "/overview",
        state : pathParams.state
      },
      {
        type: "multi",
        title : "Resources",
        path : "/nodes/" + pathParams.node + "/resources",
        state : pathParams.state,
        sub : [
          { title: "Workloads", path: "/nodes/"+pathParams.node+"/resources/workloads" },
          { title: "Pods", path: "/nodes/"+pathParams.node+"/resources/pods" },
          { title: "Services", path: "/nodes/"+pathParams.node+"/resources/services" },
          { title: "Ingress", path: "/nodes/"+pathParams.node+"/resources/ingress" },
        ]
      }
    ],
    projects : [
      {
        type: "single",
        title : t("detailLeftMenu.project.overview"),
        path : "/projects/"+pathParams.project + "/overview",
        searchString: pathParams.searchString,
        state : pathParams.state,
      },
      {
        type: "multi",
        title : t("detailLeftMenu.project.resources.title"),
        path : "/projects/"+pathParams.project + "/resources",
        searchString: pathParams.searchString,
        state : pathParams.state,
        sub : [
          { title: t("detailLeftMenu.project.resources.workloads"), path: "/projects/"+pathParams.project+"/resources/workloads", searchString: pathParams.searchString },
          { title: t("detailLeftMenu.project.resources.pods"), path: "/projects/"+pathParams.project+"/resources/pods", searchString: pathParams.searchString },
          { title: t("detailLeftMenu.project.resources.services"), path: "/projects/"+pathParams.project+"/resources/services", searchString: pathParams.searchString },
          { title: t("detailLeftMenu.project.resources.ingress"), path: "/projects/"+pathParams.project+"/resources/ingress", searchString: pathParams.searchString },
        ]
      },
      {
        type: "single",
        title : t("detailLeftMenu.project.volumnes"),
        path : "/projects/"+pathParams.project + "/volumes", searchString: pathParams.searchString,
        state : pathParams.state,
      },
      {
        type: "multi",
        title : t("detailLeftMenu.project.config.title"),
        path : "/projects/"+pathParams.project + "/config", searchString: pathParams.searchString,
        state : pathParams.state,
        sub : [
          { title: t("detailLeftMenu.project.config.secrets"), path: "/projects/"+pathParams.project + "/config/secrets", searchString: pathParams.searchString},
          { title: t("detailLeftMenu.project.config.configmaps"), path: "/projects/"+pathParams.project+"/config/config_maps", searchString: pathParams.searchString},
        ]
      },
      // {
      //   type: "multi",
      //   title : "Settings",
      //   path : "/projects/" + pathParams + "/settings",
      //   sub : [
      //     { title: "Members", path: "/projects/" + pathParams + "/settings/members"},
      //   ]
      // }
    ],
    pods : [
      {
        type: "single",
        title : "Overview",
        path : "/pods/" + pathParams.pod + "/overview",
        state : pathParams.state,
      },
      {
        type: "multi",
        title : "Resources",
        path : "/nodes/" + pathParams.pod + "/resources",
        state : pathParams.state,
        sub : [
          { title: "Workloads", path: "/pods/"+pathParams.pod+"/resources/workloads" },
          { title: "Pods", path: "/pods/"+pathParams.pod+"/resources/pods" },
          { title: "Services", path: "/pods/"+pathParams.pod+"/resources/services" },
          { title: "Ingress", path: "/pods/"+pathParams.pod+"/resources/ingress" },
        ]
      }
    ]
  }
  return menuData;
}