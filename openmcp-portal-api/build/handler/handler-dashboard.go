package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

func Dashboard(w http.ResponseWriter, r *http.Request) {
	// start := time.Now()
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	var allUrls []string

	clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/kubefedclusters?clustername=openmcp" //기존정보
	go CallAPI(token, clusterurl, ch)
	clusters := <-ch
	clusterData := clusters.data

	resCluster := DashboardRes{}

	var jcinfoList = make(map[string]JoinedClusters)
	var clusterlist = make(map[string]Region)
	var clusternames []string
	clusterHealthyCnt := 0
	clusterUnHealthyCnt := 0
	clusterUnknownCnt := 0
	for _, element := range clusterData["items"].([]interface{}) {

		clustername := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)

		url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + clustername + "?clustername=openmcp"
		go CallAPI(token, url, ch)
		clusters := <-ch
		clusterData := clusters.data

		joinStatus := GetStringElement(clusterData["spec"], []string{"joinStatus"})
		if joinStatus == "JOIN" || joinStatus == "JOINING" {
			region := ""
			zone := ""
			// statusReason := element.(map[string]interface{})["status"].(map[string]interface{})["conditions"].([]interface{})[0].(map[string]interface{})["reason"].(string)
			statusReason := GetStringElement(element, []string{"status", "conditions", "reason"})
			statusType := GetStringElement(element, []string{"status", "conditions", "type"})
			statusTF := GetStringElement(element, []string{"status", "conditions", "status"})
			clusterStatus := "Healthy"

			if statusReason == "ClusterNotReachable" && statusType == "Offline" && statusTF == "True" {
				clusterStatus = "Unhealthy"
				clusterUnHealthyCnt++
			} else if statusReason == "ClusterReady" && statusType == "Ready" && statusTF == "True" {
				clusterStatus = "Healthy"
				clusterHealthyCnt++
			} else {
				clusterStatus = "Unknown"
				clusterUnknownCnt++
			}

			region = GetStringElement(clusterData["spec"], []string{"nodeInfo", "region"})
			zone = GetStringElement(clusterData["spec"], []string{"nodeInfo", "zone"})

			clusterlist[region] =
				Region{
					region,
					Attributes{clusterStatus, region, zone},
					append(clusterlist[region].Children, ChildNode{clustername, Attributes{clusterStatus, region, zone}})}

			jcinfoList["OpenMCP"] =
				JoinedClusters{
					"OpenMCP",
					Attributes{clusterStatus, region, zone},
					append(jcinfoList["OpenMCP"].Children, ChildNode{clustername, Attributes{clusterStatus, zone, region}})}

			clusternames = append(clusternames, clustername)
		} else {
			jcinfoList["UnJoined"] =
				JoinedClusters{
					"UnJoined",
					Attributes{"Unknown", "Unknown", "Unknown"},
					append(jcinfoList["UnJoined"].Children, ChildNode{clustername, Attributes{"Unknown", "Unknown", "Unknown"}})}
		}
	}

	for _, outp := range jcinfoList {
		resCluster.JoinedClusters = append(resCluster.JoinedClusters, outp)
	}

	for _, outp := range clusterlist {
		resCluster.Regions = append(resCluster.Regions, outp)
	}

	for _, cluster := range clusternames {
		nodeurl := "https://" + openmcpURL + "/api/v1/nodes?clustername=" + cluster
		allUrls = append(allUrls, nodeurl)
		podurl := "https://" + openmcpURL + "/api/v1/pods?clustername=" + cluster
		allUrls = append(allUrls, podurl)
		projecturl := "https://" + openmcpURL + "/api/v1/namespaces?clustername=" + cluster
		allUrls = append(allUrls, projecturl)
	}

	for _, arg := range allUrls[0:] {
		go CallAPI(token, arg, ch)
	}

	var results = make(map[string]interface{})
	nsCnt := 0
	podCnt := 0
	nodeCnt := 0

	for range allUrls[0:] {
		result := <-ch
		results[result.url] = result.data
	}

	ruuningPodCnt := 0
	failedPodCnt := 0
	unknownPodCnt := 0
	pendingPodCnt := 0
	activeNSCnt := 0
	terminatingNSCnt := 0
	healthyNodeCnt := 0
	unhealthyNodeCnt := 0
	unknownNodeCnt := 0

	for _, result := range results {
		kind := result.(map[string]interface{})["kind"]

		if kind == "NamespaceList" {
			nsCnt = nsCnt + len(result.(map[string]interface{})["items"].([]interface{}))
			for _, element := range result.(map[string]interface{})["items"].([]interface{}) {
				phase := element.(map[string]interface{})["status"].(map[string]interface{})["phase"]
				if phase == "Active" {
					activeNSCnt++
				} else if phase == "Terminating" {
					terminatingNSCnt++
				}
			}
		} else if kind == "PodList" {
			podCnt = podCnt + len(result.(map[string]interface{})["items"].([]interface{}))
			for _, element := range result.(map[string]interface{})["items"].([]interface{}) {
				phase := element.(map[string]interface{})["status"].(map[string]interface{})["phase"]
				if phase == "Running" {
					ruuningPodCnt++
				} else if phase == "Pending" {
					pendingPodCnt++
				} else if phase == "Failed" {
					failedPodCnt++
				} else if phase == "Unknown" {
					unknownPodCnt++
				}
			}

		} else if kind == "NodeList" {
			nodeCnt = nodeCnt + len(result.(map[string]interface{})["items"].([]interface{}))
			for _, element := range result.(map[string]interface{})["items"].([]interface{}) {
				status := element.(map[string]interface{})["status"]
				var healthCheck = make(map[string]string)
				for _, elem := range status.(map[string]interface{})["conditions"].([]interface{}) {
					conType := elem.(map[string]interface{})["type"].(string)
					tf := elem.(map[string]interface{})["status"].(string)
					healthCheck[conType] = tf
				}

				if healthCheck["Ready"] == "True" && (healthCheck["NetworkUnavailable"] == "" || (healthCheck["NetworkUnavailable"] == "" || healthCheck["NetworkUnavailable"] == "False")) && healthCheck["MemoryPressure"] == "False" && healthCheck["DiskPressure"] == "False" && healthCheck["PIDPressure"] == "False" {
					healthyNodeCnt++
				} else {
					if healthCheck["Ready"] == "Unknown" || (healthCheck["NetworkUnavailable"] == "" || healthCheck["NetworkUnavailable"] == "Unknown") || healthCheck["MemoryPressure"] == "Unknown" || healthCheck["DiskPressure"] == "Unknown" || healthCheck["PIDPressure"] == "Unknown" {
						unknownNodeCnt++
					} else {
						unhealthyNodeCnt++
					}
				}
			}
		}
	}

	resCluster.Clusters.ClustersCnt = len(clusternames)
	resCluster.Nodes.NodesCnt = nodeCnt
	resCluster.Pods.PodsCnt = podCnt
	resCluster.Projects.ProjectsCnt = nsCnt
	resCluster.Projects.ProjectsStatus = append(resCluster.Projects.ProjectsStatus, NameIntVal{"Active", activeNSCnt})
	resCluster.Projects.ProjectsStatus = append(resCluster.Projects.ProjectsStatus, NameIntVal{"Terminating", terminatingNSCnt})
	resCluster.Pods.PodsStatus = append(resCluster.Pods.PodsStatus, NameIntVal{"Running", ruuningPodCnt})
	resCluster.Pods.PodsStatus = append(resCluster.Pods.PodsStatus, NameIntVal{"Pending", pendingPodCnt})
	resCluster.Pods.PodsStatus = append(resCluster.Pods.PodsStatus, NameIntVal{"Failed", failedPodCnt})
	resCluster.Pods.PodsStatus = append(resCluster.Pods.PodsStatus, NameIntVal{"Unknown", unknownPodCnt})
	resCluster.Nodes.NodesStatus = append(resCluster.Nodes.NodesStatus, NameIntVal{"Healthy", healthyNodeCnt})
	resCluster.Nodes.NodesStatus = append(resCluster.Nodes.NodesStatus, NameIntVal{"Unhealthy", unhealthyNodeCnt})
	resCluster.Nodes.NodesStatus = append(resCluster.Nodes.NodesStatus, NameIntVal{"Unknown", unknownNodeCnt})
	resCluster.Clusters.ClustersStatus = append(resCluster.Clusters.ClustersStatus, NameIntVal{"Healthy", clusterHealthyCnt})
	resCluster.Clusters.ClustersStatus = append(resCluster.Clusters.ClustersStatus, NameIntVal{"Unhealthy", clusterUnHealthyCnt})
	resCluster.Clusters.ClustersStatus = append(resCluster.Clusters.ClustersStatus, NameIntVal{"Unknown", clusterUnknownCnt})
	// resCluster.JoinedClusters = resJoinedClusters
	json.NewEncoder(w).Encode(resCluster)
}

func DbOmcp(w http.ResponseWriter, r *http.Request) {
	// start := time.Now()
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	gCluster := data["g_clusters"].([]interface{})
	// clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/kubefedclusters?clustername=openmcp"
	// https://115.94.141.62:8080/apis/openmcp.k8s.io/v1alpha1/openmcpclusters/?clustername=openmcp
	clusterurl := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/openmcpclusters/?clustername=openmcp"
	go CallAPI(token, clusterurl, ch)
	clusters := <-ch
	clusterData := clusters.data

	type ClusterAttribute struct {
		Status   string `json:"status"`
		Region   string `json:"region"`
		Zone     string `json:"zone"`
		Endpoint string `json:"endpoint"`
		// Attributes struct {
		// 	Status string `json:"status"`
		// } `json:"attributes"`
	}

	type ClusterChildNode struct {
		Name       string           `json:"name"`
		Attributes ClusterAttribute `json:"attributes"`
	}

	type DashJoinedClusters struct {
		Name       string             `json:"name"`
		Attributes Attributes         `json:"attributes"`
		Children   []ClusterChildNode `json:"children"`
	}

	type DashboardClusterRes struct {
		Clusters struct {
			ClustersCnt    int          `json:"counts"`
			ClustersStatus []NameIntVal `json:"status"`
		} `json:"clusters"`
		Nodes struct {
			NodesCnt    int          `json:"counts"`
			NodesStatus []NameIntVal `json:"status"`
		} `json:"nodes"`
		Pods struct {
			PodsCnt    int          `json:"counts"`
			PodsStatus []NameIntVal `json:"status"`
		} `json:"pods"`
		Projects struct {
			ProjectsCnt    int          `json:"counts"`
			ProjectsStatus []NameIntVal `json:"status"`
		} `json:"projects"`
		Regions        []Region             `json:"regions"`
		JoinedClusters []DashJoinedClusters `json:"joined_clusters"`
	}

	resCluster := DashboardClusterRes{}

	var jcinfoList = make(map[string]DashJoinedClusters)
	var clusterlist = make(map[string]Region)
	var clusternames []string
	// clusterHealthyCnt := 0
	// clusterUnHealthyCnt := 0
	// clusterUnknownCnt := 0

	for _, element := range clusterData["items"].([]interface{}) {

		clustername := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		if FindInInterfaceArr(gCluster, clustername) || gCluster[0] == "allClusters" {
			// https://115.94.141.62:8080     /apis/openmcp.k8s.io/v1alpha1/openmcpclusters/?clustername=openmcp
			url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + clustername + "?clustername=openmcp"
			go CallAPI(token, url, ch)
			clusters := <-ch
			clusterData := clusters.data

			// https://192.168.0.152:30000/apis/core.kubefed.io/v1beta1/namespaces/kube-federation-system/kubefedclusters/cluster1?clustername=openmcp

			clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/namespaces/kube-federation-system/kubefedclusters/" + clustername + "/?clustername=openmcp"
			go CallAPI(token, clusterurl, ch)
			clusters2 := <-ch
			clusterData2 := clusters2.data

			endpoint := ""

			endpoint = GetStringElement(clusterData2, []string{"spec", "apiEndpoint"})
			endpoint = strings.Replace(endpoint, "https://", "", -1)
			endpoint = strings.Replace(endpoint, "http://", "", -1)
			address := strings.Split(endpoint, ":")
			endpoint = address[0]

			joinStatus := GetStringElement(clusterData["spec"], []string{"joinStatus"})

			if joinStatus == "JOIN" || joinStatus == "JOINING" {

				region := ""
				zone := ""
				// statusReason := element.(map[string]interface{})["status"].(map[string]interface{})["conditions"].([]interface{})[0].(map[string]interface{})["reason"].(string)
				// statusReason := GetStringElement(element, []string{"status", "conditions", "reason"})
				// statusType := GetStringElement(element, []string{"status", "conditions", "type"})
				// statusTF := GetStringElement(element, []string{"status", "conditions", "status"})
				// clusterStatus := "Healthy"

				// if statusReason == "ClusterNotReachable" && statusType == "Offline" && statusTF == "True" {
				// 	clusterStatus = "Unhealthy"
				// 	clusterUnHealthyCnt++
				// } else if statusReason == "ClusterReady" && statusType == "Ready" && statusTF == "True" {
				// 	clusterStatus = "Healthy"
				// 	clusterHealthyCnt++
				// } else {
				// 	clusterStatus = "Unknown"
				// 	clusterUnknownCnt++
				// }
				clusterStatus := "Healthy"

				region = GetStringElement(clusterData["spec"], []string{"nodeInfo", "region"})
				zone = GetStringElement(clusterData["spec"], []string{"nodeInfo", "zone"})

				clusterlist[region] =
					Region{
						region,
						Attributes{clusterStatus, region, zone},
						append(clusterlist[region].Children, ChildNode{clustername, Attributes{clusterStatus, region, zone}})}

				jcinfoList["OpenMCP"] =
					DashJoinedClusters{
						"OpenMCP",
						Attributes{clusterStatus, region, zone},
						append(jcinfoList["OpenMCP"].Children, ClusterChildNode{clustername, ClusterAttribute{clusterStatus, zone, region, endpoint}})}

				clusternames = append(clusternames, clustername)
			} else {
				jcinfoList["UnJoined"] =
					DashJoinedClusters{
						"UnJoined",
						Attributes{"Unknown", "Unknown", "Unknown"},
						append(jcinfoList["UnJoined"].Children, ClusterChildNode{clustername, ClusterAttribute{"Unknown", "Unknown", "Unknown", endpoint}})}
			}
		}
	}

	for _, outp := range jcinfoList {
		resCluster.JoinedClusters = append(resCluster.JoinedClusters, outp)
	}

	json.NewEncoder(w).Encode(resCluster)
}

func DbRegionGroups(w http.ResponseWriter, r *http.Request) {
	// start := time.Now()
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	gCluster := data["g_clusters"].([]interface{})

	clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/kubefedclusters?clustername=openmcp" //기존정보
	go CallAPI(token, clusterurl, ch)
	clusters := <-ch
	clusterData := clusters.data

	resCluster := DashboardRes{}

	var clusterlist = make(map[string]Region)
	var clusternames []string
	clusterHealthyCnt := 0
	clusterUnHealthyCnt := 0
	clusterUnknownCnt := 0
	for _, element := range clusterData["items"].([]interface{}) {

		clustername := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		if FindInInterfaceArr(gCluster, clustername) || gCluster[0] == "allClusters" {

			url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + clustername + "?clustername=openmcp"
			go CallAPI(token, url, ch)
			clusters := <-ch
			clusterData := clusters.data

			joinStatus := GetStringElement(clusterData["spec"], []string{"joinStatus"})
			if joinStatus == "JOIN" || joinStatus == "JOINING" {
				region := ""
				zone := ""
				// statusReason := element.(map[string]interface{})["status"].(map[string]interface{})["conditions"].([]interface{})[0].(map[string]interface{})["reason"].(string)
				statusReason := GetStringElement(element, []string{"status", "conditions", "reason"})
				statusType := GetStringElement(element, []string{"status", "conditions", "type"})
				statusTF := GetStringElement(element, []string{"status", "conditions", "status"})
				clusterStatus := "Healthy"

				if statusReason == "ClusterNotReachable" && statusType == "Offline" && statusTF == "True" {
					clusterStatus = "Unhealthy"
					clusterUnHealthyCnt++
				} else if statusReason == "ClusterReady" && statusType == "Ready" && statusTF == "True" {
					clusterStatus = "Healthy"
					clusterHealthyCnt++
				} else {
					clusterStatus = "Unknown"
					clusterUnknownCnt++
				}

				region = GetStringElement(clusterData["spec"], []string{"nodeInfo", "region"})
				zone = GetStringElement(clusterData["spec"], []string{"nodeInfo", "zone"})

				clusterlist[region] =
					Region{
						region,
						Attributes{clusterStatus, region, zone},
						append(clusterlist[region].Children, ChildNode{clustername, Attributes{clusterStatus, region, zone}})}

				clusternames = append(clusternames, clustername)
			}

		}
	}

	for _, outp := range clusterlist {
		resCluster.Regions = append(resCluster.Regions, outp)
	}

	json.NewEncoder(w).Encode(resCluster)
}

func DbStatus(w http.ResponseWriter, r *http.Request) {
	// start := time.Now()
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	gCluster := data["g_clusters"].([]interface{})

	var allUrls []string

	clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/kubefedclusters?clustername=openmcp" //기존정보
	go CallGetAPI(token, clusterurl, ch)
	clusters := <-ch

	clusterData := clusters.data
	resCluster := DashboardRes{}

	var clusternames []string
	clusterHealthyCnt := 0
	clusterUnHealthyCnt := 0
	clusterUnknownCnt := 0
	for _, element := range clusterData["items"].([]interface{}) {

		clustername := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		if FindInInterfaceArr(gCluster, clustername) || gCluster[0] == "allClusters" {
			url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + clustername + "?clustername=openmcp"
			go CallGetAPI(token, url, ch)
			clusters := <-ch
			clusterData := clusters.data

			joinStatus := GetStringElement(clusterData["spec"], []string{"joinStatus"})
			if joinStatus == "JOIN" || joinStatus == "JOINING" {
				// statusReason := element.(map[string]interface{})["status"].(map[string]interface{})["conditions"].([]interface{})[0].(map[string]interface{})["reason"].(string)
				statusReason := GetStringElement(element, []string{"status", "conditions", "reason"})
				statusType := GetStringElement(element, []string{"status", "conditions", "type"})
				statusTF := GetStringElement(element, []string{"status", "conditions", "status"})

				if statusReason == "ClusterNotReachable" && statusType == "Offline" && statusTF == "True" {
					clusterUnHealthyCnt++
				} else if statusReason == "ClusterReady" && statusType == "Ready" && statusTF == "True" {
					clusterHealthyCnt++
				} else {
					clusterUnknownCnt++
				}
				clusternames = append(clusternames, clustername)
			}
		}
	}

	for _, cluster := range clusternames {
		nodeurl := "https://" + openmcpURL + "/api/v1/nodes?clustername=" + cluster
		allUrls = append(allUrls, nodeurl)
		podurl := "https://" + openmcpURL + "/api/v1/pods?clustername=" + cluster
		allUrls = append(allUrls, podurl)
		projecturl := "https://" + openmcpURL + "/api/v1/namespaces?clustername=" + cluster
		allUrls = append(allUrls, projecturl)
	}

	for _, arg := range allUrls[0:] {
		go CallGetAPI(token, arg, ch)
	}

	var results = make(map[string]interface{})
	nsCnt := 0
	podCnt := 0
	nodeCnt := 0

	for range allUrls[0:] {
		result := <-ch
		if result.data != nil {
			results[result.url] = result.data
		}
	}

	ruuningPodCnt := 0
	failedPodCnt := 0
	unknownPodCnt := 0
	pendingPodCnt := 0
	activeNSCnt := 0
	terminatingNSCnt := 0
	healthyNodeCnt := 0
	unhealthyNodeCnt := 0
	unknownNodeCnt := 0

	for _, result := range results {
		kind := result.(map[string]interface{})["kind"]

		if kind == "NamespaceList" {
			nsCnt = nsCnt + len(result.(map[string]interface{})["items"].([]interface{}))
			for _, element := range result.(map[string]interface{})["items"].([]interface{}) {
				phase := element.(map[string]interface{})["status"].(map[string]interface{})["phase"]
				if phase == "Active" {
					activeNSCnt++
				} else if phase == "Terminating" {
					terminatingNSCnt++
				}
			}
		} else if kind == "PodList" {
			podCnt = podCnt + len(result.(map[string]interface{})["items"].([]interface{}))
			for _, element := range result.(map[string]interface{})["items"].([]interface{}) {
				phase := element.(map[string]interface{})["status"].(map[string]interface{})["phase"]
				if phase == "Running" {
					ruuningPodCnt++
				} else if phase == "Pending" {
					pendingPodCnt++
				} else if phase == "Failed" {
					failedPodCnt++
				} else if phase == "Unknown" {
					unknownPodCnt++
				}
			}
		} else if kind == "NodeList" {
			nodeCnt = nodeCnt + len(result.(map[string]interface{})["items"].([]interface{}))
			for _, element := range result.(map[string]interface{})["items"].([]interface{}) {
				status := element.(map[string]interface{})["status"]
				var healthCheck = make(map[string]string)
				for _, elem := range status.(map[string]interface{})["conditions"].([]interface{}) {
					conType := elem.(map[string]interface{})["type"].(string)
					tf := elem.(map[string]interface{})["status"].(string)
					healthCheck[conType] = tf
				}

				if healthCheck["Ready"] == "True" && (healthCheck["NetworkUnavailable"] == "" || (healthCheck["NetworkUnavailable"] == "" || healthCheck["NetworkUnavailable"] == "False")) && healthCheck["MemoryPressure"] == "False" && healthCheck["DiskPressure"] == "False" && healthCheck["PIDPressure"] == "False" {
					healthyNodeCnt++
				} else {
					if healthCheck["Ready"] == "Unknown" || (healthCheck["NetworkUnavailable"] == "" || healthCheck["NetworkUnavailable"] == "Unknown") || healthCheck["MemoryPressure"] == "Unknown" || healthCheck["DiskPressure"] == "Unknown" || healthCheck["PIDPressure"] == "Unknown" {
						unknownNodeCnt++
					} else {
						unhealthyNodeCnt++
					}
				}
			}
		}
	}

	resCluster.Clusters.ClustersCnt = len(clusternames)
	resCluster.Nodes.NodesCnt = nodeCnt
	resCluster.Pods.PodsCnt = podCnt
	resCluster.Projects.ProjectsCnt = nsCnt
	resCluster.Projects.ProjectsStatus = append(resCluster.Projects.ProjectsStatus, NameIntVal{"Active", activeNSCnt})
	resCluster.Projects.ProjectsStatus = append(resCluster.Projects.ProjectsStatus, NameIntVal{"Terminating", terminatingNSCnt})
	resCluster.Pods.PodsStatus = append(resCluster.Pods.PodsStatus, NameIntVal{"Running", ruuningPodCnt})
	resCluster.Pods.PodsStatus = append(resCluster.Pods.PodsStatus, NameIntVal{"Pending", pendingPodCnt})
	resCluster.Pods.PodsStatus = append(resCluster.Pods.PodsStatus, NameIntVal{"Failed", failedPodCnt})
	resCluster.Pods.PodsStatus = append(resCluster.Pods.PodsStatus, NameIntVal{"Unknown", unknownPodCnt})
	resCluster.Nodes.NodesStatus = append(resCluster.Nodes.NodesStatus, NameIntVal{"Healthy", healthyNodeCnt})
	resCluster.Nodes.NodesStatus = append(resCluster.Nodes.NodesStatus, NameIntVal{"Unhealthy", unhealthyNodeCnt})
	resCluster.Nodes.NodesStatus = append(resCluster.Nodes.NodesStatus, NameIntVal{"Unknown", unknownNodeCnt})
	resCluster.Clusters.ClustersStatus = append(resCluster.Clusters.ClustersStatus, NameIntVal{"Healthy", clusterHealthyCnt})
	resCluster.Clusters.ClustersStatus = append(resCluster.Clusters.ClustersStatus, NameIntVal{"Unhealthy", clusterUnHealthyCnt})
	resCluster.Clusters.ClustersStatus = append(resCluster.Clusters.ClustersStatus, NameIntVal{"Unknown", clusterUnknownCnt})
	json.NewEncoder(w).Encode(resCluster)
}

func DbWorldClusterMap(w http.ResponseWriter, r *http.Request) {
	// start := time.Now()
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	gCluster := data["g_clusters"].([]interface{})

	var wmcRes []WorldMapClusterInfo
	var wmcCountMap = make(map[string]WorldMapClusterInfo)
	url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/openmcpclusters/?clustername=openmcp"
	go CallAPI(token, url, ch)
	clusters := <-ch
	clusterData := clusters.data

	// ciChan := make(chan ChanRes, len(clusterData["items"].([]interface{})))
	// defer close(ciChan)
	// clusterInfoList := make(map[string]map[string]interface{})

	// for _, element := range clusterData["items"].([]interface{}) {
	// 	cName := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
	// 	url := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/namespaces/kube-federation-system/kubefedclusters/" + cName + "?clustername=openmcp"
	// 	go func(cName string) {
	// 		CallAPIGO(ciChan, url, cName, token)
	// 	}(cName)
	// }

	// for range clusterData["items"].([]interface{}) {
	// 	comm := <-ciChan
	// 	clusterInfoList[comm.name] = comm.result
	// }

	for _, element := range clusterData["items"].([]interface{}) {

		clustername := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		if FindInInterfaceArr(gCluster, clustername) || gCluster[0] == "allClusters" {
			joinStatus := GetStringElement(element, []string{"spec", "joinStatus"})

			if joinStatus == "JOIN" || joinStatus == "JOINING" {
				region := ""
				region = GetStringElement(element, []string{"spec", "nodeInfo", "region"})
				// createdTime := GetStringElement(clusterData, []string{"metadata", "creationTimestamp"})
				createdTime := GetStringElement(element, []string{"spec", "joinStatusTime"})
				wmcCountMap[region] =
					WorldMapClusterInfo{region, wmcCountMap[region].Value + 1, createdTime}
			}
		}
	}

	for _, outp := range wmcCountMap {
		wmcRes = append(wmcRes, outp)
	}
	json.NewEncoder(w).Encode(wmcRes)
}

func DbClusterTopology(w http.ResponseWriter, r *http.Request) {
	// start := time.Now()

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	pathRegion := data["pathRegion"].(string)
	pathCluster := data["pathCluster"].(string)
	pathPod := data["pathPod"].(string)

	gCluster := data["g_clusters"].([]interface{})

	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	type PodSubInfo struct {
		Cluster   string `json:"cluster"`
		Namespace string `json:"namespace"`
	}

	type Pods struct {
		Id          string     `json:"id"`
		Name        string     `json:"name"`
		Path        string     `json:"path"`
		Value       string     `json:"value"`
		Status      string     `json:"status"`
		CreatedTime string     `json:"created_time"`
		Data        PodSubInfo `json:"data"`
	}

	type Clusters struct {
		Id     string `json:"id"`
		Name   string `json:"name"`
		Path   string `json:"path"`
		Value  string `json:"value"`
		Data   string `json:"data"`
		Status string `json:"status"`
		Pods   []Pods `json:"children"`
	}

	type ClusterTopology struct {
		Name     string     `json:"name"`
		Path     string     `json:"path"`
		Value    string     `json:"value"`
		Data     string     `json:"data"`
		Clusters []Clusters `json:"children"`
	}

	type ResClusterTopology struct {
		ClusterTopology []ClusterTopology `json:"topology"`
	}

	clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/kubefedclusters?clustername=openmcp" //기존정보
	go CallGetAPI(token, clusterurl, ch)
	clusters := <-ch
	clusterData := clusters.data

	var clusterTopologylist = make(map[string]ClusterTopology)

	ciChan := make(chan ChanRes, len(clusterData["items"].([]interface{})))
	defer close(ciChan)

	clusterInfoList := make(map[string]map[string]interface{})
	for _, element := range clusterData["items"].([]interface{}) {
		cName := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + cName + "?clustername=openmcp"
		go func(cName string) {
			CallGetAPIGO(ciChan, url, cName, token)
		}(cName)
	}
	for range clusterData["items"].([]interface{}) {
		comm := <-ciChan
		if comm.result != nil {
			clusterInfoList[comm.name] = comm.result
		}
	}

	podsInfoList := make(map[string]map[string]interface{})
	for _, element := range clusterData["items"].([]interface{}) {
		cName := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		url := "https://" + openmcpURL + "/api/v1/pods?clustername=" + cName
		go func(cName string) {
			CallGetAPIGO(ciChan, url, cName, token)
		}(cName)
	}
	for range clusterData["items"].([]interface{}) {
		comm := <-ciChan
		if comm.result != nil {
			podsInfoList[comm.name] = comm.result
		}
	}

	for _, element := range clusterData["items"].([]interface{}) {

		clustername := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		if FindInInterfaceArr(gCluster, clustername) || gCluster[0] == "allClusters" {
			// url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + clustername + "?clustername=openmcp"
			// go CallAPI(token, url, ch)
			// clusters := <-ch
			// clusterData := clusters.data
			clusterData := clusterInfoList[clustername]

			joinStatus := GetStringElement(clusterData["spec"], []string{"joinStatus"})
			if joinStatus == "JOIN" || joinStatus == "JOINING" {
				region := ""
				// statusReason := element.(map[string]interface{})["status"].(map[string]interface{})["conditions"].([]interface{})[0].(map[string]interface{})["reason"].(string)
				statusReason := GetStringElement(element, []string{"status", "conditions", "reason"})
				statusType := GetStringElement(element, []string{"status", "conditions", "type"})
				statusTF := GetStringElement(element, []string{"status", "conditions", "status"})
				clusterStatus := "Healthy"

				if statusReason == "ClusterNotReachable" && statusType == "Offline" && statusTF == "True" {
					clusterStatus = "Unhealthy"
				} else if statusReason == "ClusterReady" && statusType == "Ready" && statusTF == "True" {
					clusterStatus = "Healthy"
				} else {
					clusterStatus = "Unknown"
				}

				region = GetStringElement(clusterData["spec"], []string{"nodeInfo", "region"})

				cluster := Clusters{}
				cluster.Id = region + "-" + clustername
				cluster.Name = clustername
				cluster.Path = pathCluster
				cluster.Value = "30"
				cluster.Status = clusterStatus

				// GET PODS
				// podURL := "https://" + openmcpURL + "/api/v1/pods?clustername=" + clustername
				// go CallAPI(token, podURL, ch)
				// podResult := <-ch
				// podData := podResult.data
				// podItems := podData["items"].([]interface{})
				podData := podsInfoList[clustername]
				if podData != nil {
					podItems := podData["items"].([]interface{})

					// get podUsage counts by nodename groups
					for _, element := range podItems {
						pod := Pods{}
						podName := GetStringElement(element, []string{"metadata", "name"})
						createdTime := GetStringElement(element, []string{"metadata", "creationTimestamp"})
						status := GetStringElement(element, []string{"status", "phase"})
						namespace := GetStringElement(element, []string{"metadata", "namespace"})

						if !IsContains(GetSystemNamespace(), namespace) {
							// podIP := "-"
							// node := "-"
							// nodeIP := "-"
							// if status == "Running" {
							// 	podIP = GetStringElement(element, []string{"status", "podIP"})
							// 	// element.(map[string]interface{})["status"].(map[string]interface{})["podIP"].(string)
							// 	node = GetStringElement(element, []string{"spec", "nodeName"})
							// 	// element.(map[string]interface{})["spec"].(map[string]interface{})["nodeName"].(string)
							// 	nodeIP = GetStringElement(element, []string{"status", "hostIP"})
							// 	// element.(map[string]interface{})["status"].(map[string]interface{})["hostIP"].(string)
							// }

							pod.Id = region + "-" + clustername + "-" + podName
							pod.Name = podName
							pod.Value = "5"
							pod.Path = pathPod
							pod.Status = status
							pod.CreatedTime = createdTime
							podData := PodSubInfo{clustername, namespace}
							pod.Data = podData
							cluster.Pods = append(cluster.Pods, pod)
						}
					}
				}

				// type ClusterTopology struct {
				// 	Name     string     `json:"name"`
				// 	Path     string     `json:"path"`
				// 	Value    string     `json:"value"`
				// 	Clusters []Clusters `json:"children"`
				// }

				clusterTopologylist[region] =
					ClusterTopology{region, pathRegion, "50", "", append(clusterTopologylist[region].Clusters, cluster)}
			}
		}
	}

	resTopology := ResClusterTopology{}

	// for _, outp := range clusterlist {
	// 	resCluster.Regions = append(resCluster.Regions, outp)
	// }

	for _, outp := range clusterTopologylist {
		resTopology.ClusterTopology = append(resTopology.ClusterTopology, outp)
	}

	json.NewEncoder(w).Encode(resTopology)
}


func DbServiceTopology(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	pathService := data["pathService"].(string)
	pathCluster := data["pathCluster"].(string)
	pathPod := data["pathPod"].(string)

	gCluster := data["g_clusters"].([]interface{})

	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	type PodSubInfo struct {
		Cluster   string `json:"cluster"`
		Namespace string `json:"namespace"`
	}

	type Pods struct {
		Id          string     `json:"id"`
		Name        string     `json:"name"`
		Path        string     `json:"path"`
		Value       string     `json:"value"`
		Status      string     `json:"status"`
		CreatedTime string     `json:"created_time"`
		Data        PodSubInfo `json:"data"`
	}

	type Clusters struct {
		Id     string `json:"id"`
		Name   string `json:"name"`
		Path   string `json:"path"`
		Value  string `json:"value"`
		Status string `json:"status"`
		Data   string `json:"data"`
		Pods   []Pods `json:"children"`
		App    string `json:"app"`
	}

	type ServiceTopology struct {
		Name     string     `json:"name"`
		Path     string     `json:"path"`
		Value    string     `json:"value"`
		Data     string     `json:"data"`
		Clusters []Clusters `json:"children"`
	}

	type ResServiceTopology struct {
		ServiceTopology []ServiceTopology `json:"topology"`
	}

	clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/kubefedclusters?clustername=openmcp" //기존정보
	go CallGetAPI(token, clusterurl, ch)
	clusters := <-ch
	clusterData := clusters.data

	var serviceTopologylist = make(map[string]ServiceTopology)

	ciChan := make(chan ChanRes, len(clusterData["items"].([]interface{})))
	defer close(ciChan)

	clusterInfoList := make(map[string]map[string]interface{})
	for _, element := range clusterData["items"].([]interface{}) {
		cName := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + cName + "?clustername=openmcp"
		go func(cName string) {
			CallGetAPIGO(ciChan, url, cName, token)
		}(cName)
	}

	for range clusterData["items"].([]interface{}) {
		comm := <-ciChan
		if comm.result != nil {
			clusterInfoList[comm.name] = comm.result
		}
	}

	podsInfoList := make(map[string]map[string]interface{})

	for _, element := range clusterData["items"].([]interface{}) {
		cName := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		url := "https://" + openmcpURL + "/api/v1/pods?clustername=" + cName
		go func(cName string) {
			CallGetAPIGO(ciChan, url, cName, token)
		}(cName)
	}

	for range clusterData["items"].([]interface{}) {
		comm := <-ciChan
		if comm.result != nil {
			podsInfoList[comm.name] = comm.result
		}
	}

	clusterHealthyCnt := 0
	clusterUnHealthyCnt := 0
	clusterUnknownCnt := 0

	for _, element := range clusterData["items"].([]interface{}) {
		var serviceClusterlist = make(map[string]Clusters)

		clustername := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)

		if FindInInterfaceArr(gCluster, clustername) || gCluster[0] == "allClusters" {

			// url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + clustername + "?clustername=openmcp"
			// go CallAPI(token, url, ch)
			// clusters := <-ch
			// clusterData := clusters.data
			clusterData := clusterInfoList[clustername]

			joinStatus := GetStringElement(clusterData["spec"], []string{"joinStatus"})
			if joinStatus == "JOIN" || joinStatus == "JOINING" {
				// statusReason := element.(map[string]interface{})["status"].(map[string]interface{})["conditions"].([]interface{})[0].(map[string]interface{})["reason"].(string)
				statusReason := GetStringElement(element, []string{"status", "conditions", "reason"})
				statusType := GetStringElement(element, []string{"status", "conditions", "type"})
				statusTF := GetStringElement(element, []string{"status", "conditions", "status"})
				clusterStatus := "Healthy"

				if statusReason == "ClusterNotReachable" && statusType == "Offline" && statusTF == "True" {
					clusterStatus = "Unhealthy"
					clusterUnHealthyCnt++
				} else if statusReason == "ClusterReady" && statusType == "Ready" && statusTF == "True" {
					clusterStatus = "Healthy"
					clusterHealthyCnt++
				} else {
					clusterStatus = "Unknown"
					clusterUnknownCnt++
				}

				// GET PODS
				// podURL := "https://" + openmcpURL + "/api/v1/pods?clustername=" + clustername
				// go CallAPI(token, podURL, ch)
				// podResult := <-ch
				// podData := podResult.data
				// podItems := podData["items"].([]interface{})
				podData := podsInfoList[clustername]
				if podData != nil {
					podItems := podData["items"].([]interface{})

					// get podUsage counts by nodename groups
					for _, element := range podItems {
						pod := Pods{}
						app := GetStringElement(element, []string{"metadata", "labels", "app"})

						namespace := GetStringElement(element, []string{"metadata", "namespace"})
						if app != "-" && app != "" && !IsContains(GetSystemNamespace(), namespace) {
							app = namespace + "/" + app
							podName := GetStringElement(element, []string{"metadata", "name"})
							status := GetStringElement(element, []string{"status", "phase"})
							createdTime := GetStringElement(element, []string{"metadata", "creationTimestamp"})
							// project := GetStringElement(element, []string{"metadata", "namespace"})
							// podIP := "-"
							// node := "-"
							// nodeIP := "-"
							// if status == "Running" {
							// 	podIP = GetStringElement(element, []string{"status", "podIP"})
							// 	// element.(map[string]interface{})["status"].(map[string]interface{})["podIP"].(string)
							// 	node = GetStringElement(element, []string{"spec", "nodeName"})
							// 	// element.(map[string]interface{})["spec"].(map[string]interface{})["nodeName"].(string)
							// 	nodeIP = GetStringElement(element, []string{"status", "hostIP"})
							// 	// element.(map[string]interface{})["status"].(map[string]interface{})["hostIP"].(string)
							// }

							pod.Id = app + "-" + clustername + "-" + podName
							pod.Name = podName
							pod.Value = "5"
							pod.Path = pathPod
							pod.Status = status
							pod.CreatedTime = createdTime
							podData := PodSubInfo{clustername, namespace}
							pod.Data = podData

							serviceClusterlist[app] =
								Clusters{app + "-" + clustername, clustername, pathCluster, "30", clusterStatus, "data", append(serviceClusterlist[app].Pods, pod), app}

						}
					}

					for _, outp := range serviceClusterlist {
						serviceTopologylist[outp.App] =
							ServiceTopology{outp.App, pathService, "50", "", append(serviceTopologylist[outp.App].Clusters, outp)}
						// resTopology.ServiceTopology = append(resTopology.ServiceTopology, outp)
					}
				}

				// type ClusterTopology struct {
				// 	Name     string     `json:"name"`
				// 	Path     string     `json:"path"`
				// 	Value    string     `json:"value"`
				// 	Clusters []Clusters `json:"children"`
				// }
			}
		}
	}

	resTopology := ResServiceTopology{}

	// for _, outp := range clusterlist {
	// 	resCluster.Regions = append(resCluster.Regions, outp)
	// }

	for _, outp := range serviceTopologylist {
		resTopology.ServiceTopology = append(resTopology.ServiceTopology, outp)
	}

	json.NewEncoder(w).Encode(resTopology)
}

// func DbServiceTopology2(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
// 	w.WriteHeader(http.StatusOK)

// 	data := GetJsonBody(r.Body)
// 	defer r.Body.Close() // 리소스 누출 방지

// 	pathService := data["pathService"].(string)
// 	pathCluster := data["pathCluster"].(string)
// 	pathNamespace := data["pathNamespace"].(string)
// 	pathPod := data["pathPod"].(string)

// 	gCluster := data["g_clusters"].([]interface{})

// 	ch := make(chan Resultmap)
// 	token := GetOpenMCPToken()

// 	type PodSubInfo struct {
// 		Cluster   string `json:"cluster"`
// 		Namespace string `json:"namespace"`
// 	}

// 	type Pods struct {
// 		Id          string     `json:"id"`
// 		Name        string     `json:"name"`
// 		Path        string     `json:"path"`
// 		Value       string     `json:"value"`
// 		Status      string     `json:"status"`
// 		CreatedTime string     `json:"created_time"`
// 		Data        PodSubInfo `json:"data"`
// 	}

// 	type Namespaces struct {
// 		Id    string `json:"id"`
// 		Name  string `json:"name"`
// 		Path  string `json:"path"`
// 		Value string `json:"value"`
// 		Pods  []Pods `json:"children"`
// 		App   string `json:"app"`
// 	}

// 	type Clusters struct {
// 		Id         string       `json:"id"`
// 		Name       string       `json:"name"`
// 		Path       string       `json:"path"`
// 		Value      string       `json:"value"`
// 		Status     string       `json:"status"`
// 		Data       string       `json:"data"`
// 		Namespaces []Namespaces `json:"children"`
// 		App        string       `json:"app"`
// 	}

// 	type ServiceTopology struct {
// 		Name     string     `json:"name"`
// 		Path     string     `json:"path"`
// 		Value    string     `json:"value"`
// 		Data     string     `json:"data"`
// 		Clusters []Clusters `json:"children"`
// 	}

// 	type ResServiceTopology struct {
// 		ServiceTopology []ServiceTopology `json:"topology"`
// 	}

// 	clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/kubefedclusters?clustername=openmcp" //기존정보
// 	go CallGetAPI(token, clusterurl, ch)
// 	clusters := <-ch
// 	clusterData := clusters.data

// 	var serviceTopologylist = make(map[string]ServiceTopology)

// 	ciChan := make(chan ChanRes, len(clusterData["items"].([]interface{})))
// 	defer close(ciChan)

// 	clusterInfoList := make(map[string]map[string]interface{})
// 	for _, element := range clusterData["items"].([]interface{}) {
// 		cName := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
// 		url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + cName + "?clustername=openmcp"
// 		go func(cName string) {
// 			CallGetAPIGO(ciChan, url, cName, token)
// 		}(cName)
// 	}

// 	for range clusterData["items"].([]interface{}) {
// 		comm := <-ciChan
// 		if comm.result != nil {
// 			clusterInfoList[comm.name] = comm.result
// 		}
// 	}

// 	podsInfoList := make(map[string]map[string]interface{})

// 	for _, element := range clusterData["items"].([]interface{}) {
// 		cName := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
// 		url := "https://" + openmcpURL + "/api/v1/pods?clustername=" + cName
// 		go func(cName string) {
// 			CallGetAPIGO(ciChan, url, cName, token)
// 		}(cName)
// 	}

// 	for range clusterData["items"].([]interface{}) {
// 		comm := <-ciChan
// 		if comm.result != nil {
// 			podsInfoList[comm.name] = comm.result
// 		}
// 	}

// 	clusterHealthyCnt := 0
// 	clusterUnHealthyCnt := 0
// 	clusterUnknownCnt := 0

// 	for _, element := range clusterData["items"].([]interface{}) {
// 		var serviceClusterlist = make(map[string]Clusters)
// 		var serviceNamespacelist = make(map[string]Namespaces)

// 		clustername := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)

// 		if FindInInterfaceArr(gCluster, clustername) || gCluster[0] == "allClusters" {

// 			// url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + clustername + "?clustername=openmcp"
// 			// go CallAPI(token, url, ch)
// 			// clusters := <-ch
// 			// clusterData := clusters.data
// 			clusterData := clusterInfoList[clustername]

// 			joinStatus := GetStringElement(clusterData["spec"], []string{"joinStatus"})
// 			if joinStatus == "JOIN" || joinStatus == "JOINING" {
// 				// statusReason := element.(map[string]interface{})["status"].(map[string]interface{})["conditions"].([]interface{})[0].(map[string]interface{})["reason"].(string)
// 				statusReason := GetStringElement(element, []string{"status", "conditions", "reason"})
// 				statusType := GetStringElement(element, []string{"status", "conditions", "type"})
// 				statusTF := GetStringElement(element, []string{"status", "conditions", "status"})
// 				clusterStatus := "Healthy"

// 				if statusReason == "ClusterNotReachable" && statusType == "Offline" && statusTF == "True" {
// 					clusterStatus = "Unhealthy"
// 					clusterUnHealthyCnt++
// 				} else if statusReason == "ClusterReady" && statusType == "Ready" && statusTF == "True" {
// 					clusterStatus = "Healthy"
// 					clusterHealthyCnt++
// 				} else {
// 					clusterStatus = "Unknown"
// 					clusterUnknownCnt++
// 				}

// 				// GET PODS
// 				// podURL := "https://" + openmcpURL + "/api/v1/pods?clustername=" + clustername
// 				// go CallAPI(token, podURL, ch)
// 				// podResult := <-ch
// 				// podData := podResult.data
// 				// podItems := podData["items"].([]interface{})
// 				podData := podsInfoList[clustername]
// 				if podData != nil {
// 					podItems := podData["items"].([]interface{})

// 					// get podUsage counts by nodename groups
// 					for _, element := range podItems {
// 						pod := Pods{}
// 						app := GetStringElement(element, []string{"metadata", "labels", "app"})
// 						namespace := GetStringElement(element, []string{"metadata", "namespace"})
// 						if app != "-" && app != "" && !IsContains(GetSystemNamespace(), namespace) {
// 							podName := GetStringElement(element, []string{"metadata", "name"})
// 							status := GetStringElement(element, []string{"status", "phase"})
// 							createdTime := GetStringElement(element, []string{"metadata", "creationTimestamp"})
// 							// project := GetStringElement(element, []string{"metadata", "namespace"})
// 							// podIP := "-"
// 							// node := "-"
// 							// nodeIP := "-"
// 							// if status == "Running" {
// 							// 	podIP = GetStringElement(element, []string{"status", "podIP"})
// 							// 	// element.(map[string]interface{})["status"].(map[string]interface{})["podIP"].(string)
// 							// 	node = GetStringElement(element, []string{"spec", "nodeName"})
// 							// 	// element.(map[string]interface{})["spec"].(map[string]interface{})["nodeName"].(string)
// 							// 	nodeIP = GetStringElement(element, []string{"status", "hostIP"})
// 							// 	// element.(map[string]interface{})["status"].(map[string]interface{})["hostIP"].(string)
// 							// }

// 							pod.Id = app + "-" + clustername + "-" + podName
// 							pod.Name = podName
// 							pod.Value = "5"
// 							pod.Path = pathPod
// 							pod.Status = status
// 							pod.CreatedTime = createdTime
// 							podData := PodSubInfo{clustername, namespace}
// 							pod.Data = podData

// 							serviceNamespacelist[app] = Namespaces{app + "-" + clustername + "-" + namespace, namespace, pathNamespace, "30", append(serviceNamespacelist[app].Pods, pod), app}

// 						}
// 					}

// 					for _, item := range serviceNamespacelist {
// 						serviceClusterlist[item.Name] =
// 							Clusters{item.App + "-" + clustername, clustername, pathCluster, "30", clusterStatus, "data", append(serviceClusterlist[item.Name].Namespaces, item), item.App}
// 					}

// 					for _, outp := range serviceClusterlist {
// 						serviceTopologylist[outp.App] =
// 							ServiceTopology{outp.App, pathService, "50", "", append(serviceTopologylist[outp.App].Clusters, outp)}
// 						// resTopology.ServiceTopology = append(resTopology.ServiceTopology, outp)
// 					}
// 				}

// 				// type ClusterTopology struct {
// 				// 	Name     string     `json:"name"`
// 				// 	Path     string     `json:"path"`
// 				// 	Value    string     `json:"value"`
// 				// 	Clusters []Clusters `json:"children"`
// 				// }
// 			}
// 		}
// 	}

// 	resTopology := ResServiceTopology{}

// 	// for _, outp := range clusterlist {
// 	// 	resCluster.Regions = append(resCluster.Regions, outp)
// 	// }

// 	for _, outp := range serviceTopologylist {
// 		resTopology.ServiceTopology = append(resTopology.ServiceTopology, outp)
// 	}

// 	json.NewEncoder(w).Encode(resTopology)
// }


func DbServiceRegionTopology(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	pathRegion := data["pathRegion"].(string)
	pathCluster := data["pathCluster"].(string)
	pathService := data["pathService"].(string)
	gCluster := data["g_clusters"].([]interface{})

	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	type Services struct {
		Id    string `json:"id"`
		Name  string `json:"name"`
		Path  string `json:"path"`
		Value string `json:"value"`
		Data  string `json:"data"`
	}

	type Clusters struct {
		Id       string     `json:"id"`
		Name     string     `json:"name"`
		Path     string     `json:"path"`
		Value    string     `json:"value"`
		Data     string     `json:"data"`
		Link     []string   `json:"linkWith"`
		Services []Services `json:"children"`
	}

	type RegionTopology struct {
		Name     string     `json:"name"`
		Path     string     `json:"path"`
		Value    string     `json:"value"`
		Data     string     `json:"data"`
		Clusters []Clusters `json:"children"`
	}

	type ResRegionTopology struct {
		RegionTopology []RegionTopology `json:"topology"`
	}

	clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/kubefedclusters?clustername=openmcp" //기존정보
	go CallGetAPI(token, clusterurl, ch)
	clusters := <-ch
	clusterData := clusters.data

	var regionTopologylist = make(map[string]RegionTopology)
	appNames := []string{}

	ciChan := make(chan ChanRes, len(clusterData["items"].([]interface{})))
	defer close(ciChan)

	clusterInfoList := make(map[string]map[string]interface{})
	for _, element := range clusterData["items"].([]interface{}) {
		cName := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + cName + "?clustername=openmcp"
		go func(cName string) {
			CallGetAPIGO(ciChan, url, cName, token)
		}(cName)
	}
	for range clusterData["items"].([]interface{}) {
		comm := <-ciChan
		if comm.result != nil {
			clusterInfoList[comm.name] = comm.result
		}
	}

	podsInfoList := make(map[string]map[string]interface{})
	for _, element := range clusterData["items"].([]interface{}) {
		cName := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		url := "https://" + openmcpURL + "/api/v1/pods?clustername=" + cName
		go func(cName string) {
			CallGetAPIGO(ciChan, url, cName, token)
		}(cName)
	}
	for range clusterData["items"].([]interface{}) {
		comm := <-ciChan
		if comm.result != nil {
			podsInfoList[comm.name] = comm.result
		}
	}

	for _, element := range clusterData["items"].([]interface{}) {

		clustername := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		if FindInInterfaceArr(gCluster, clustername) || gCluster[0] == "allClusters" {
			// url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/" + clustername + "?clustername=openmcp"
			// go CallAPI(token, url, ch)
			// clusters := <-ch
			// clusterData := clusters.data
			clusterData := clusterInfoList[clustername]

			joinStatus := GetStringElement(clusterData["spec"], []string{"joinStatus"})
			if joinStatus == "JOIN" || joinStatus == "JOINING" {
				region := ""
				// statusReason := element.(map[string]interface{})["status"].(map[string]interface{})["conditions"].([]interface{})[0].(map[string]interface{})["reason"].(string)
				statusReason := GetStringElement(element, []string{"status", "conditions", "reason"})
				statusType := GetStringElement(element, []string{"status", "conditions", "type"})
				statusTF := GetStringElement(element, []string{"status", "conditions", "status"})
				clusterStatus := "Healthy"

				if statusReason == "ClusterNotReachable" && statusType == "Offline" && statusTF == "True" {
					clusterStatus = "Unhealthy"
				} else if statusReason == "ClusterReady" && statusType == "Ready" && statusTF == "True" {
					clusterStatus = "Healthy"
				} else {
					clusterStatus = "Unknown"
				}

				region = GetStringElement(clusterData["spec"], []string{"nodeInfo", "region"})

				cluster := Clusters{}
				cluster.Id = region + "-" + clustername
				cluster.Name = clustername
				cluster.Path = pathCluster
				cluster.Value = "30"
				cluster.Data = clusterStatus

				// GET PODS
				// podURL := "https://" + openmcpURL + "/api/v1/pods?clustername=" + clustername
				// go CallAPI(token, podURL, ch)
				// podResult := <-ch
				// podData := podResult.data
				// podItems := podData["items"].([]interface{})

				podData := podsInfoList[clustername]
				if podData != nil {
					podItems := podData["items"].([]interface{})

					// get podUsage counts by nodename groups
					for _, element := range podItems {
						service := Services{}

						app := GetStringElement(element, []string{"metadata", "labels", "app"})
						namespace := GetStringElement(element, []string{"metadata", "namespace"})

						//
						if app != "-" && app != "" && !IsContains(GetSystemNamespace(), namespace) {
							if !IsContains(appNames, app) {
								appNames = append(appNames, app)

								service.Id = app
								service.Name = app
								service.Value = "5"
								service.Path = pathService
								service.Data = ""

								cluster.Services = append(cluster.Services, service)
							} else {
								if !IsContains(cluster.Link, app) {
									cluster.Link = append(cluster.Link, app)
								}
							}
						}

					}
				}

				regionTopologylist[region] =
					RegionTopology{region, pathRegion, "50", "", append(regionTopologylist[region].Clusters, cluster)}
			}
		}
	}

	resTopology := ResRegionTopology{}

	// for _, outp := range clusterlist {
	// 	resCluster.Regions = append(resCluster.Regions, outp)
	// }

	for _, outp := range regionTopologylist {
		resTopology.RegionTopology = append(resTopology.RegionTopology, outp)
	}

	json.NewEncoder(w).Encode(resTopology)
}
