package handler

import (
	"encoding/json"
	"net/http"
)

func ClusterList(w http.ResponseWriter, r *http.Request) {
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

	var clusternames []string

	if gCluster[0] == "allClusters" {
		clusternames = append(clusternames, "openmcp")
	}

	for _, element := range clusterData["items"].([]interface{}) {
		clustername := element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)

		if FindInInterfaceArr(gCluster, clustername) || gCluster[0] == "allClusters" {
			clusternames = append(clusternames, clustername)
		}
	}
	// resCluster.JoinedClusters = resJoinedClusters
	json.NewEncoder(w).Encode(clusternames)
}

func NodeList(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()
	clusterName := r.URL.Query().Get("cluster")
	var nodeNames []string

	nodeURL := "https://" + openmcpURL + "/api/v1/nodes?clustername=" + clusterName
	go CallAPI(token, nodeURL, ch)
	nodeResult := <-ch
	nodeData := nodeResult.data
	if nodeData["kind"].(string) == "NodeList" {
		nodeItems := nodeData["items"].([]interface{})

		// get nodename, cpu capacity Information
		for _, element := range nodeItems {
			nodeName := GetStringElement(element, []string{"metadata", "name"})
			nodeNames = append(nodeNames, nodeName)
		}

		json.NewEncoder(w).Encode(nodeNames)
	} else {
		json.NewEncoder(w).Encode(nodeNames)
	}
}

func NamespaceList(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()
	clusterName := r.URL.Query().Get("cluster")

	var namespaceNames []string

	namespaceURL := "https://" + openmcpURL + "/api/v1/namespaces?clustername=" + clusterName
	go CallAPI(token, namespaceURL, ch)
	namespaceResult := <-ch
	namespaceData := namespaceResult.data
	namespaceItems := namespaceData["items"].([]interface{})

	for _, element := range namespaceItems {
		namespaceName := GetStringElement(element, []string{"metadata", "name"})
		namespaceNames = append(namespaceNames, namespaceName)
	}
	json.NewEncoder(w).Encode(namespaceNames)
}
