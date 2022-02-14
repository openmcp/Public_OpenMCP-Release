package main

import (
	"net/http"
	"portal-api-server/handler"
)

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

type Routes []Route

var routes = Routes{
	Route{
		"getkialiurl",
		"GET",
		"/apis/getkialiurl",
		handler.GetKialiURL,
	},
	Route{
		"getpubliccloudclusters",
		"POST",
		"/apis/clusters/public-cloud",
		handler.GetPublicCloudClusters,
	},
	Route{
		"changeekstype",
		"POST",
		"/apis/changeekstype",
		handler.ChangeEKSInstanceType,
	},
	Route{
		"starteksnode",
		"POST",
		"/apis/starteksnode",
		handler.StartEKSNode,
	},
	Route{
		"stopeksnode",
		"POST",
		"/apis/stopeksnode",
		handler.StopEKSNode,
	},
	Route{
		"geteksclusterinfo",
		"POST",
		"/apis/geteksclusterinfo",
		GetEKSClusterInfo,
	},
	Route{
		"deletekvmnode",
		"POST",
		"/apis/deletekvmnode",
		handler.DeleteKVMNode,
	},
	Route{
		"createkvmnode",
		"POST",
		"/apis/createkvmnode",
		handler.CreateKVMNode,
	},
	Route{
		"changekvmnode",
		"POST",
		"/apis/changekvmnode",
		handler.ChangeKVMNode,
	},
	Route{
		"stopkvmnode",
		"POST",
		"/apis/stopkvmnode",
		handler.StopKVMNode,
	},
	Route{
		"startkvmnode",
		"POST",
		"/apis/startkvmnode",
		handler.StartKVMNode,
	},
	Route{
		"getkvmnodes",
		"GET",
		"/apis/getkvmnodes",
		handler.GetKVMNodes,
	},
	Route{
		"getgkeclusters",
		"POST",
		"/apis/getgkeclusters",
		handler.GetGKEClusters,
	},
	Route{
		"gkechangenodecount",
		"POST",
		"/apis/gkechangenodecount",
		handler.GKEChangeNodeCount,
	},
	Route{
		"akschangevmss",
		"POST",
		"/apis/akschangevmss",
		handler.AKSChangeVMSS,
	},
	Route{
		"aksgetallres",
		"POST",
		"/apis/aksgetallres",
		handler.AKSGetAllResources,
	},
	Route{
		"stopaksnode",
		"POST",
		"/apis/stopaksnode",
		handler.StopAKSNode,
	},
	Route{
		"startaksnode",
		"POST",
		"/apis/startaksnode",
		handler.StartAKSNode,
	},
	Route{
		"addaksnode",
		"POST",
		"/apis/addaksnode",
		handler.AddAKSnode,
	},
	Route{
		"yamlapply",
		"POST",
		"/apis/yamlapply",
		YamlApply,
	},

	Route{
		"changeeksnode",
		"POST",
		"/apis/changeeksnode",
		ChangeEKSnode,
	},

	Route{
		"migration",
		"POST",
		"/apis/migration",
		handler.Migration,
	},

	Route{
		"migrationLog",
		"GET",
		"/apis/migration/log",
		handler.MigrationLog,
	},

	Route{
		"takesnapshot",
		"POST",
		"/apis/snapshot",
		handler.TakeSnapshot,
	},

	Route{
		"snapshotlist",
		"POST",
		"/apis/snapshot/list",
		handler.SnapshotList,
	},

	Route{
		"snapshotlog",
		"GET",
		"/apis/snapshot/log",
		handler.SnapshotLog,
	},

	Route{
		"snapshotrestore",
		"POST",
		"/apis/snapshot/restore",
		handler.SnapshotRestore,
	},

	Route{
		"snapshotrestore",
		"GET",
		"/apis/globalcache",
		handler.GlobalCache,
	},

	Route{
		"addec2node",
		"POST",
		"/apis/addec2node",
		Addec2node,
	},

	Route{
		"dashboard",
		"GET",
		"/apis/dashboard",
		handler.Dashboard,
	},

	Route{
		"dashboardstatus",
		"POST",
		"/apis/dashboard/status",
		handler.DbStatus,
	},

	Route{
		"dashboardregiongroups",
		"POST",
		"/apis/dashboard/region_groups",
		handler.DbRegionGroups,
	},

	Route{
		"dashboardomcp",
		"POST",
		"/apis/dashboard/omcp",
		handler.DbOmcp,
	},

	Route{
		"dashboardworldclustermap",
		"POST",
		"/apis/dashboard/world_cluster_map",
		handler.DbWorldClusterMap,
	},

	Route{
		"dashboardClusterTopology",
		"POST",
		"/apis/dashboard/cluster_topology",
		handler.DbClusterTopology,
	},

	Route{
		"dashboardServiceTopology",
		"POST",
		"/apis/dashboard/service_topology",
		handler.DbServiceTopology,
	},

	Route{
		"dashboardServiceRegionTopology",
		"POST",
		"/apis/dashboard/service_region_topology",
		handler.DbServiceRegionTopology,
	},

	Route{
		"clusters",
		"POST",
		"/apis/clusters",
		handler.GetJoinedClusters,
	},
	Route{
		"joinableclusters",
		"POST",
		"/apis/joinableclusters",
		handler.GetJoinableClusters,
	},
	Route{
		"cluster-overview",
		"GET",
		"/apis/clusters/overview",
		handler.ClusterOverview,
	},

	Route{
		"clusterJoin",
		"POST",
		"/apis/clusters/join",
		handler.OpenMCPJoin,
	},

	Route{
		"clusterUnjoin",
		"POST",
		"/apis/clusters/unjoin",
		handler.OpenMCPUnjoin,
	},

	Route{
		"nodes",
		"GET",
		"/apis/clusters/{clusterName}/nodes",
		handler.NodesInCluster,
	},

	Route{
		"nodes",
		"POST",
		"/apis/nodes",
		handler.Nodes,
	},

	Route{
		"node-overview",
		"GET",
		"/apis/nodes/{nodeName}",
		handler.NodeOverview,
	},

	Route{
		"node-metric",
		"GET",
		"/apis/nodes_metric",
		handler.NodesMetric,
	},

	Route{
		"node-taint-add",
		"PATCH",
		"/apis/nodes/taint/add",
		handler.UpdateNodeTaint,
	},

	Route{
		"node-taint-delete",
		"PATCH",
		"/apis/nodes/taint/delete",
		handler.DeleteNodeTaint,
	},

	Route{
		"projects",
		"POST",
		"/apis/projects",
		handler.Projects,
	},

	Route{
		"projectOverview",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}",
		handler.GetProjectOverview,
	},

	Route{
		"AddProject",
		"POST",
		"/apis/clusters/projects/create",
		handler.AddProject,
	},

	Route{
		"deployments",
		"POST",
		"/apis/deployments",
		handler.GetDeployments,
	},

	Route{
		"deployments",
		"POST",
		"/apis/deployments/resources",
		handler.UpdateDeploymentResources,
	},

	Route{
		"replicaSetPodNum",
		"POST",
		"/apis/deployments/replica_status/set_pod_num",
		handler.UpdateReplicaSetPodNum,
	},

	Route{
		"replicaSetDelPod",
		"GET",
		"/apis/clsuters/{clusterName}/projects/{projectName}/deployments",
		handler.GetDeploymentsInProject,
	},
	Route{
		"deploymentOverview",
		"GET",
		"/apis/clsuters/{clusterName}/projects/{projectName}/deployments/{deploymentName}",
		handler.GetDeploymentOverview,
	},

	Route{
		"replicaStatus",
		"GET",
		"/apis/clsuters/{clusterName}/projects/{projectName}/deployments/{deploymentName}/replica_status",
		handler.GetDeploymentReplicaStatus,
	},

	Route{
		"deploymentCreate",
		"POST",
		"/apis/deployments/create",
		handler.CreateDeployments,
	},

	Route{
		"deploymentDelete",
		"POST",
		"/apis/deployments/delete",
		handler.DeleteDeployments,
	},

	Route{
		"omcpDeploymentOverview",
		"POST",
		"/apis/clsuters/{clusterName}/projects/{projectName}/deployments/omcp-deployment/{deploymentName}",
		handler.GetOmcpDeploymentOverview,
	},

	Route{
		"omcpDeploymentReplicaStatus",
		"GET",
		"/apis/clsuters/{clusterName}/projects/{projectName}/deployments/omcp-deployment/{deploymentName}/replica_status",
		handler.GetOmcpDeploymentReplicaStatus,
	},

	Route{
		"statefulsets",
		"GET",
		"/apis/statefulsets",
		handler.GetStatefulsets,
	},
	Route{
		"statefulsetsInProject",
		"GET",
		"/apis/clsuters/{clusterName}/projects/{projectName}/statefulsets",
		handler.GetStatefulsetsInProject,
	},
	Route{
		"statefulsetOverview",
		"GET",
		"/apis/clsuters/{clusterName}/projects/{projectName}/statefulsets/{statefulsetName}",
		handler.GetStatefulsetOverview,
	},

	Route{
		"dns",
		"GET",
		"/apis/dns",
		handler.Dns,
	},

	Route{
		"services",
		"POST",
		"/apis/services",
		handler.Services,
	},

	Route{
		"servicesInProject",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/services",
		handler.GetServicesInProject,
	},

	Route{
		"serviceOverview",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/services/{serviceName}",
		handler.GetServiceOverview,
	},

	Route{
		"deleteServices",
		"POST",
		"/apis/services/delete",
		handler.DeleteServices,
	},

	Route{
		"ingress",
		"POST",
		"/apis/ingress",
		handler.Ingress,
	},

	Route{
		"ingressInProject",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/ingress",
		handler.GetIngressInProject,
	},

	Route{
		"ingressOverview",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/ingress/{ingressName}",
		handler.GetIngressOverview,
	},

	Route{
		"pods",
		"POST",
		"/apis/pods",
		handler.GetPods,
	},
	Route{
		"podOverview",
		"GET",
		"/apis/pods/{podName}",
		handler.GetPodOverview,
	},

	Route{
		"podPhysicalRes",
		"GET",
		"/apis/pods/{podName}/physicalResPerMin",
		handler.GetPodPhysicalRes,
	},

	Route{
		"vpa",
		"POST",
		"/apis/vpa",
		handler.GetVPAs,
	},

	Route{
		"hpa",
		"POST",
		"/apis/hpa",
		handler.GetHPAs,
	},

	Route{
		"podsInCluster",
		"GET",
		"/apis/clusters/{clusterName}/pods",
		handler.GetPodsInCluster,
	},

	Route{
		"podsInProject",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/pods",
		handler.GetPodsInProject,
	},

	Route{
		"pvcInProject",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/volumes",
		handler.GetVolumes,
	},

	Route{
		"pvcOverview",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/volumes/{volumeName}",
		handler.GetVolumeOverview,
	},

	Route{
		"secretInProject",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/secrets",
		handler.GetSecrets,
	},

	Route{
		"secretOverview",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/secrets/{secretName}",
		handler.GetSecretOverView,
	},

	Route{
		"configmapInProject",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/configmaps",
		handler.GetConfigmaps,
	},

	Route{
		"configmapOverview",
		"GET",
		"/apis/clusters/{clusterName}/projects/{projectName}/configmaps/{configmapName}",
		handler.GetConfigmapOverView,
	},

	Route{
		"settings",
		"GET",
		"/apis/policy/openmcp",
		handler.GetOpenmcpPolicy,
	},

	Route{
		"settings",
		"POST",
		"/apis/policy/openmcp/edit",
		handler.UpdateOpenmcpPolicy,
	},

	Route{
		"settings",
		"POST",
		"/apis/metric/clusterlist",
		handler.ClusterList,
	},

	Route{
		"settings",
		"GET",
		"/apis/metric/namespacelist",
		handler.NamespaceList,
	},

	Route{
		"settings",
		"GET",
		"/apis/metric/nodelist",
		handler.NodeList,
	},
}
