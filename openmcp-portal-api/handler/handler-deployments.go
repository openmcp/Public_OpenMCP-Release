package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	yamlutil "k8s.io/apimachinery/pkg/util/yaml"
)

func GetDeployments(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()
	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	gCluster := data["g_clusters"].([]interface{})
	ynOmcpDp := data["ynOmcpDp"].(bool)
	// vars := mux.Vars(r)
	// clusterName := vars["clusterName"]
	// projectName := vars["projectName"]

	// fmt.Println(clustrName, projectName)
	clusterNames := []string{}
	if gCluster[0] == "allClusters" {
		clusterNames = append(clusterNames, "openmcp")
	}

	resDeployment := DeploymentRes{}
	deploymentInfoList := make(map[string]map[string]interface{})

	if ynOmcpDp {
		url := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/openmcpdeployments?clustername=openmcp"
		go CallAPI(token, url, ch)

		omcpDeployments := <-ch
		omcpDeploymentsData := omcpDeployments.data

		for _, element := range omcpDeploymentsData["items"].([]interface{}) {
			deployment := DeploymentInfo{}

			if GetStringElement(element, []string{"kind"}) == "OpenMCPDeployment" {
				// get deployement Information
				name := GetStringElement(element, []string{"metadata", "name"})
				// element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
				namespace := GetStringElement(element, []string{"metadata", "namespace"})
				// element.(map[string]interface{})["metadata"].(map[string]interface{})["namespace"].(string)

				status := "-"
				// availableReplicas := GetInterfaceElement(element, []string{"status", "availableReplicas"})
				// element.(map[string]interface{})["status"].(map[string]interface{})["availableReplicas"]
				// readyReplicas := GetInterfaceElement(element, []string{"status", "readyReplicas"})
				// element.(map[string]interface{})["status"].(map[string]interface{})["readyReplicas"]
				replicas := GetFloat64Element(element, []string{"status", "replicas"})
				// element.(map[string]interface{})["status"].(map[string]interface{})["replicas"].(float64)

				replS := fmt.Sprintf("%.0f", replicas)

				clusterMaps := element.(map[string]interface{})["status"].(map[string]interface{})["clusterMaps"]
				// fmt.Println(clusterMaps)

				clusterMapString := fmt.Sprintf("%v", clusterMaps)
				clusterMap := strings.Trim(strings.Split(clusterMapString, "map")[1], "[]")

				// if readyReplicas != nil {
				// 	readyReplS := fmt.Sprintf("%.0f", readyReplicas)
				// 	status = readyReplS + "/" + replS
				// } else if availableReplicas == nil {
				// 	status = "0/" + replS
				// } else {
				// 	status = "0/0"
				// }
				status = replS

				image := GetStringElement(element, []string{"spec", "template", "spec", "template", "spec", "containers", "image"})
				// element.(map[string]interface{})["spec"].(map[string]interface{})["template"].(map[string]interface{})["spec"].(map[string]interface{})["containers"].([]interface{})[0].(map[string]interface{})["image"].(string)
				created_time := GetStringElement(element, []string{"metadata", "creationTimestamp"})
				// element.(map[string]interface{})["metadata"].(map[string]interface{})["creationTimestamp"].(string)

				deployment.Name = name
				deployment.Status = status
				deployment.Cluster = clusterMap
				deployment.Project = namespace
				deployment.Image = image
				deployment.CreatedTime = created_time
				deployment.Uid = ""
				deployment.Labels = make(map[string]interface{})

				resDeployment.Deployments = append(resDeployment.Deployments, deployment)

			}
		}
	} else {
		clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/kubefedclusters?clustername=openmcp"
		go CallAPI(token, clusterurl, ch)
		clusters := <-ch
		clusterData := clusters.data

		//get clusters Information
		for _, element := range clusterData["items"].([]interface{}) {
			clusterName := GetStringElement(element, []string{"metadata", "name"})

			if FindInInterfaceArr(gCluster, clusterName) || gCluster[0] == "allClusters" {
				clusterType := GetStringElement(element, []string{"status", "conditions", "type"})
				if clusterType == "Ready" {
					clusterNames = append(clusterNames, clusterName)
				}
			}
		}

		ciChan := make(chan ChanRes, len(clusterNames))
		defer close(ciChan)

		for _, cName := range clusterNames {
			url := "https://" + openmcpURL + "/apis/apps/v1/deployments?clustername=" + cName
			// url := "https://" + openmcpURL + "/apis/apps/v1/deployments?clustername=" + cName
			go func(cName string) {
				CallAPIGO(ciChan, url, cName, token)
			}(cName)
		}

		for range clusterNames {
			comm := <-ciChan
			deploymentInfoList[comm.name] = comm.result
		}
		for _, clusterName := range clusterNames {
			// // get node names, cpu(capacity)
			// deploymentURL := "https://" + openmcpURL + "/apis/apps/v1/deployments?clustername=" + clusterName
			// go CallAPI(token, deploymentURL, ch)
			// deploymentResult := <-ch
			// // fmt.Println(deploymentResult)
			// deploymentData := deploymentResult.data

			deployment := DeploymentInfo{}
			deploymentData := deploymentInfoList[clusterName]

			if deploymentData["kind"].(string) == "DeploymentList" || deploymentData["kind"].(string) == "OpenMCPDeployment" {
				deploymentItems := deploymentData["items"].([]interface{})

				// get deployement Information
				for _, element := range deploymentItems {
					name := GetStringElement(element, []string{"metadata", "name"})
					// element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
					namespace := GetStringElement(element, []string{"metadata", "namespace"})
					// element.(map[string]interface{})["metadata"].(map[string]interface{})["namespace"].(string)

					status := "-"
					availableReplicas := GetInterfaceElement(element, []string{"status", "availableReplicas"})
					// element.(map[string]interface{})["status"].(map[string]interface{})["availableReplicas"]
					readyReplicas := GetInterfaceElement(element, []string{"status", "readyReplicas"})
					// element.(map[string]interface{})["status"].(map[string]interface{})["readyReplicas"]
					replicas := GetFloat64Element(element, []string{"status", "replicas"})
					// element.(map[string]interface{})["status"].(map[string]interface{})["replicas"].(float64)

					replS := fmt.Sprintf("%.0f", replicas)

					if readyReplicas != nil {
						readyReplS := fmt.Sprintf("%.0f", readyReplicas)
						status = readyReplS + "/" + replS
					} else if availableReplicas == nil {
						status = "0/" + replS
					} else {
						status = "0/0"
					}

					image := GetStringElement(element, []string{"spec", "template", "spec", "containers", "image"})
					// element.(map[string]interface{})["spec"].(map[string]interface{})["template"].(map[string]interface{})["spec"].(map[string]interface{})["containers"].([]interface{})[0].(map[string]interface{})["image"].(string)
					created_time := GetStringElement(element, []string{"metadata", "creationTimestamp"})
					// element.(map[string]interface{})["metadata"].(map[string]interface{})["creationTimestamp"].(string)

					deployment.Name = name
					deployment.Status = status
					deployment.Cluster = clusterName
					deployment.Project = namespace
					deployment.Image = image
					deployment.CreatedTime = created_time
					deployment.Uid = ""
					deployment.Labels = make(map[string]interface{})

					resDeployment.Deployments = append(resDeployment.Deployments, deployment)
				}
			}
		}
	}

	json.NewEncoder(w).Encode(resDeployment.Deployments)
}

//get deployment-project list handler
func GetDeploymentsInProject(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	// fmt.Println("GetDeploymentsInProject")

	vars := mux.Vars(r)
	clusterName := vars["clusterName"]
	projectName := vars["projectName"]

	resDeployment := DeploymentRes{}
	deployment := DeploymentInfo{}
	// get node names, cpu(capacity)
	// http: //192.168.0.152:31635/apis/apps/v1/namespaces/kube-system/deployments?clustername=cluster1
	deploymentURL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + projectName + "/deployments?clustername=" + clusterName
	go CallAPI(token, deploymentURL, ch)
	deploymentResult := <-ch
	// fmt.Println(deploymentResult)
	deploymentData := deploymentResult.data
	deploymentItems := deploymentData["items"].([]interface{})

	// get deployement Information
	for _, element := range deploymentItems {
		name := GetStringElement(element, []string{"metadata", "name"})
		// element.(map[string]interface{})["metadata"].(map[string]interface{})["name"].(string)
		namespace := GetStringElement(element, []string{"metadata", "namespace"})
		// element.(map[string]interface{})["metadata"].(map[string]interface{})["namespace"].(string)

		status := "-"
		availableReplicas := GetInterfaceElement(element, []string{"status", "availableReplicas"})
		// element.(map[string]interface{})["status"].(map[string]interface{})["availableReplicas"]
		readyReplicas := GetInterfaceElement(element, []string{"status", "readyReplicas"})

		// element.(map[string]interface{})["status"].(map[string]interface{})["readyReplicas"]

		replicas := GetFloat64Element(element, []string{"status", "replicas"})
		// element.(map[string]interface{})["status"].(map[string]interface{})["replicas"].(float64)

		replS := fmt.Sprintf("%.0f", replicas)

		if readyReplicas != nil {
			readyReplS := fmt.Sprintf("%.0f", readyReplicas.(float64))
			status = readyReplS + "/" + replS
		} else if availableReplicas == nil {
			status = "0/" + replS
		} else {
			status = "0/0"
		}

		image := GetStringElement(element, []string{"spec", "template", "spec", "containers", "image"})
		// element.(map[string]interface{})["spec"].(map[string]interface{})["template"].(map[string]interface{})["spec"].(map[string]interface{})["containers"].([]interface{})[0].(map[string]interface{})["image"].(string)
		created_time := GetStringElement(element, []string{"metadata", "creationTimestamp"})
		// element.(map[string]interface{})["metadata"].(map[string]interface{})["creationTimestamp"].(string)

		deployment.Name = name
		deployment.Status = status
		deployment.Cluster = clusterName
		deployment.Project = namespace
		deployment.Image = image
		deployment.CreatedTime = created_time
		deployment.Uid = ""
		deployment.Labels = make(map[string]interface{})

		resDeployment.Deployments = append(resDeployment.Deployments, deployment)
	}
	json.NewEncoder(w).Encode(resDeployment.Deployments)
}

//get deployment-overview
func GetDeploymentOverview(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	// fmt.Println("GetDeploymentsInProject")

	vars := mux.Vars(r)
	clusterName := vars["clusterName"]
	projectName := vars["projectName"]
	deploymentName := vars["deploymentName"]

	resDeploymentOverview := DeploymentOverview{}
	deployment := DeploymentInfo{}
	// get node names, cpu(capacity)
	// http: //192.168.0.152:31635/apis/apps/v1/namespaces/kube-system/deployments?clustername=cluster1
	deploymentURL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + projectName + "/deployments/" + deploymentName + "?clustername=" + clusterName
	go CallAPI(token, deploymentURL, ch)
	deploymentResult := <-ch
	// fmt.Println(deploymentResult)
	deploymentData := deploymentResult.data

	// get deployement Information
	name := GetStringElement(deploymentData, []string{"metadata", "name"})
	namespace := GetStringElement(deploymentData, []string{"metadata", "namespace"})
	uid := GetStringElement(deploymentData, []string{"metadata", "uid"})

	status := "-"
	availableReplicas := GetInterfaceElement(deploymentData, []string{"status", "availableReplicas"})
	readyReplicas := GetInterfaceElement(deploymentData, []string{"status", "readyReplicas"})
	replicas := GetFloat64Element(deploymentData, []string{"status", "replicas"})

	replS := fmt.Sprintf("%.0f", replicas)

	if readyReplicas != nil {
		readyReplS := fmt.Sprintf("%.0f", readyReplicas)
		status = readyReplS + "/" + replS
	} else if availableReplicas == nil {
		status = "0/" + replS
	} else {
		status = "0/0"
	}

	// image := GetStringElement(deploymentData, []string{"spec", "template", "spec", "containers", "image"})
	image := ""
	var resources []interface{}
	containers := GetArrayElement(deploymentData, []string{"spec", "template", "spec", "containers"})
	for _, element := range containers {
		image = image + GetStringElement(element, []string{"image"})

		type Requests struct {
			Cpu    string `json:"cpu"`
			Memory string `json:"memory"`
		}

		type Limits struct {
			Cpu    string `json:"cpu"`
			Memory string `json:"memory"`
		}

		type Resources struct {
			Name     string   `json:"name"`
			Requests Requests `json:"requests"`
			Limits   Limits   `json:"limits"`
		}

		resourceRes := Resources{}
		resourceRes.Name = GetStringElement(element, []string{"image"})
		resourceRes.Limits.Cpu = GetStringElement(element, []string{"resources", "limits", "cpu"})
		resourceRes.Limits.Memory = GetStringElement(element, []string{"resources", "limits", "memory"})
		resourceRes.Requests.Cpu = GetStringElement(element, []string{"resources", "requests", "cpu"})
		resourceRes.Requests.Memory = GetStringElement(element, []string{"resources", "requests", "memory"})

		resources = append(resources, resourceRes)
	}

	created_time := GetStringElement(deploymentData, []string{"metadata", "creationTimestamp"})

	labels := make(map[string]interface{})
	labelCheck := GetInterfaceElement(deploymentData, []string{"metadata", "labels"})
	if labelCheck == nil {
		labels = map[string]interface{}{}
	} else {
		for key, val := range labelCheck.(map[string]interface{}) {
			labels[key] = val
		}
	}

	deployment.Name = name
	deployment.Status = status
	deployment.Cluster = clusterName
	deployment.Project = namespace
	deployment.Image = image
	deployment.CreatedTime = created_time
	deployment.Uid = uid
	deployment.Labels = labels
	deployment.Resources = resources

	resDeploymentOverview.Info = deployment

	//pods
	// pod > ownerReferences[] > kind:"RepllicaSet", name,
	// Replicaset에서
	// > Deployement 검색 (이름/Uid)
	// Pod에서
	// > ownerreferences[{kind:"Deployment",name}] >

	// replicasets
	// http://192.168.0.152:31635/apis/apps/v1/namespaces/kube-system/replicasets?clustername=cluster2
	replURL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + projectName + "/replicasets?clustername=" + clusterName
	go CallAPI(token, replURL, ch)
	replResult := <-ch
	// fmt.Println(deploymentResult)
	replData := replResult.data
	replItems := replData["items"].([]interface{})

	// find deployements within replicasets
	replUIDs := []string{}
	for _, element := range replItems {
		kind := GetStringElement(element, []string{"metadata", "ownerReferences", "kind"})
		name := GetStringElement(element, []string{"metadata", "ownerReferences", "name"})
		if kind == "Deployment" && name == deploymentName {
			uid := GetStringElement(element, []string{"metadata", "uid"})
			replUIDs = append(replUIDs, uid)
		}
	}

	//openmcp-apiserver-b84bf5cc7
	//ab2a2995-8dca-41ce-aead-8e112d75e3fe

	// find pods within deployments
	// replicasets
	// http://192.168.0.152:31635/apis/apps/v1/namespaces/kube-system/replicasets?clustername=cluster2
	podURL := "https://" + openmcpURL + "/api/v1/namespaces/" + projectName + "/pods?clustername=" + clusterName
	go CallAPI(token, podURL, ch)
	podResult := <-ch
	podData := podResult.data
	podItems := podData["items"].([]interface{})

	// fmt.Println("replUIDs : ", replUIDs)
	for _, element := range podItems {
		kind := GetStringElement(element, []string{"metadata", "ownerReferences", "kind"})
		if kind == "ReplicaSet" {
			uid := GetStringElement(element, []string{"metadata", "ownerReferences", "uid"})
			for _, item := range replUIDs {
				if item == uid {
					//Get pod info
					pod := PodInfo{}
					podName := GetStringElement(element, []string{"metadata", "name"})
					project := GetStringElement(element, []string{"metadata", "namespace"})
					status := GetStringElement(element, []string{"status", "phase"})
					podIP := "-"
					node := "-"
					nodeIP := "-"
					if status == "Running" {
						podIP = GetStringElement(element, []string{"status", "podIP"})
						node = GetStringElement(element, []string{"spec", "nodeName"})
						nodeIP = GetStringElement(element, []string{"status", "hostIP"})
					}

					cpu := "-"
					ram := "-"
					createdTime := GetStringElement(element, []string{"metadata", "creationTimestamp"})

					pod.Name = podName
					pod.Status = status
					pod.Cluster = clusterName
					pod.Project = project
					pod.PodIP = podIP
					pod.Node = node
					pod.NodeIP = nodeIP
					pod.Cpu = cpu
					pod.Ram = ram
					pod.CreatedTime = createdTime

					resDeploymentOverview.Pods = append(resDeploymentOverview.Pods, pod)
				}
			}
		}
	}

	//ports
	port := PortInfo{}

	// containers := GetArrayElement(deploymentData, []string{"spec", "template", "spec", "containers"})
	for _, element := range containers {
		ports := GetArrayElement(element, []string{"ports"})

		cNames := ""
		cPorts := ""
		cProtocols := ""

		for i, items := range ports {
			if len(ports)-1 == i {
				cNames = cNames + GetStringElement(items, []string{"name"})
				cPorts = cPorts + strconv.FormatFloat(GetFloat64Element(items, []string{"containerPort"}), 'f', -1, 64)

				cProtocols = cProtocols + GetStringElement(items, []string{"protocol"})
			} else {
				cNames = cNames + GetStringElement(items, []string{"name"}) + "|"
				cPorts = cPorts + strconv.FormatFloat(GetFloat64Element(items, []string{"containerPort"}), 'f', -1, 64) + "|"
				cProtocols = cProtocols + GetStringElement(items, []string{"protocol"}) + "|"
			}
		}
		port.Name = cNames
		port.Port = cPorts
		port.Protocol = cProtocols
		if port.Name != "" && port.Port != "" && port.Protocol != "" {
			resDeploymentOverview.Ports = append(resDeploymentOverview.Ports, port)
		}
	}
	if len(resDeploymentOverview.Ports) == 0 {
		resDeploymentOverview.Ports = []PortInfo{}
	}

	//events
	eventURL := "https://" + openmcpURL + "/api/v1/namespaces/" + projectName + "/events?clustername=" + clusterName
	go CallAPI(token, eventURL, ch)
	eventResult := <-ch
	eventData := eventResult.data
	eventItems := eventData["items"].([]interface{})
	resDeploymentOverview.Events = []Event{}

	if len(eventItems) > 0 {
		event := Event{}
		for _, element := range eventItems {
			kind := GetStringElement(element, []string{"involvedObject", "kind"})
			objectName := GetStringElement(element, []string{"involvedObject", "name"})
			if kind == "Deployment" && objectName == deploymentName {
				event.Typenm = GetStringElement(element, []string{"type"})
				event.Reason = GetStringElement(element, []string{"reason"})
				event.Message = GetStringElement(element, []string{"message"})
				// event.Time = GetStringElement(element, []string{"metadata", "creationTimestamp"})
				event.Time = GetStringElement(element, []string{"lastTimestamp"})
				event.Object = kind
				event.Project = projectName

				resDeploymentOverview.Events = append(resDeploymentOverview.Events, event)
			}
		}
	}

	json.NewEncoder(w).Encode(resDeploymentOverview)
}

func GetDeploymentReplicaStatus(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	vars := mux.Vars(r)
	cluster := vars["clusterName"]
	projectName := vars["projectName"]
	deploymentName := vars["deploymentName"]

	resReplicaStatus := ReplicaStatus{}

	// http://192.168.0.152:31635/apis/apps/v1/namespaces/openmcp/deployments/openmcp-deployment3?clustername=cluster1
	deploymentURL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + projectName + "/deployments/" + deploymentName + "?clustername=" + cluster

	go CallAPI(token, deploymentURL, ch)
	deploymentResult := <-ch
	deploymentData := deploymentResult.data

	// get deployement Information
	namespace := GetStringElement(deploymentData, []string{"metadata", "namespace"})

	// unavailableReplicas := GetFloat64Element(deploymentData, []string{"status", "unavailableReplicas"})
	readyReplicas := GetFloat64Element(deploymentData, []string{"status", "readyReplicas"})
	replicas := GetFloat64Element(deploymentData, []string{"status", "replicas"})

	resReplicaStatus.Cluster = cluster
	resReplicaStatus.Project = namespace
	resReplicaStatus.Deployment = deploymentName
	resReplicaStatus.Replicas = int(replicas)
	resReplicaStatus.ReadyReplicas = int(readyReplicas)

	json.NewEncoder(w).Encode(resReplicaStatus)
}

func GetOmcpDeploymentOverview(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	deployedClusters := data["deployClusters"].([]interface{}) //매핑되어 있는 클러스터 Array리스트

	vars := mux.Vars(r)
	clusterName := vars["clusterName"]
	projectName := vars["projectName"]
	deploymentName := vars["deploymentName"]

	resDeploymentOverview := DeploymentOverview{}
	deployment := DeploymentInfo{}
	// get node names, cpu(capacity)
	// https://192.168.0.152:30000/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpdeployments/openmcp-deployment5?clustername=openmcp

	deploymentURL := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/" + projectName + "/openmcpdeployments/" + deploymentName + "?clustername=" + clusterName
	// deploymentURL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + projectName + "/deployments/" + deploymentName + "?clustername=" + clusterName

	go CallAPI(token, deploymentURL, ch)

	deploymentResult := <-ch
	deploymentData := deploymentResult.data

	// get deployement Information
	kind := GetStringElement(deploymentData, []string{"kind"})
	name := GetStringElement(deploymentData, []string{"metadata", "name"})
	namespace := GetStringElement(deploymentData, []string{"metadata", "namespace"})
	uid := GetStringElement(deploymentData, []string{"metadata", "uid"})

	status := "-"
	// availableReplicas := GetInterfaceElement(deploymentData, []string{"status", "availableReplicas"})
	// readyReplicas := GetInterfaceElement(deploymentData, []string{"status", "readyReplicas"})
	replicas := GetFloat64Element(deploymentData, []string{"status", "replicas"})

	replS := fmt.Sprintf("%.0f", replicas)

	// if readyReplicas != nil {
	// 	readyReplS := fmt.Sprintf("%.0f", readyReplicas)
	// 	status = readyReplS + "/" + replS
	// } else if availableReplicas == nil {
	// 	status = "0/" + replS
	// } else {
	// 	status = "0/0"
	// }

	status = replS

	// image := GetStringElement(deploymentData, []string{"spec", "template", "spec", "containers", "image"})
	image := ""
	port := PortInfo{}

	var resources []interface{}

	containers := GetArrayElement(deploymentData, []string{"spec", "template", "spec", "template", "spec", "containers"})

	for i, element := range containers {
		//images
		if len(containers)-1 == i {
			image = image + GetStringElement(element, []string{"image"})
		} else {
			image = image + GetStringElement(element, []string{"image"}) + "|"
		}

		//ports
		ports := GetArrayElement(element, []string{"ports"})
		cNames := ""
		cPorts := ""
		cProtocols := ""

		for i, items := range ports {
			if len(ports)-1 == i {
				cNames = cNames + GetStringElement(items, []string{"name"})
				cPorts = cPorts + strconv.FormatFloat(GetFloat64Element(items, []string{"containerPort"}), 'f', -1, 64)

				cProtocols = cProtocols + GetStringElement(items, []string{"protocol"})
			} else {
				cNames = cNames + GetStringElement(items, []string{"name"}) + "|"
				cPorts = cPorts + strconv.FormatFloat(GetFloat64Element(items, []string{"containerPort"}), 'f', -1, 64) + "|"
				cProtocols = cProtocols + GetStringElement(items, []string{"protocol"}) + "|"
			}
		}
		port.Name = cNames
		port.Port = cPorts
		port.Protocol = cProtocols
		if port.Name != "" && port.Port != "" && port.Protocol != "" {
			//set ports
			resDeploymentOverview.Ports = append(resDeploymentOverview.Ports, port)
		}
	}

	created_time := GetStringElement(deploymentData, []string{"metadata", "creationTimestamp"})
	labels := make(map[string]interface{})
	labelCheck := GetInterfaceElement(deploymentData, []string{"metadata", "labels"})
	if labelCheck == nil {
		labels = map[string]interface{}{}
	} else {
		for key, val := range labelCheck.(map[string]interface{}) {
			labels[key] = val
		}
	}

	//set basic_info
	deployment.Name = name
	deployment.Status = status
	deployment.Cluster = clusterName
	deployment.Project = namespace
	deployment.Image = image
	deployment.CreatedTime = created_time
	deployment.Uid = uid
	deployment.Labels = labels
	deployment.Resources = resources
	deployment.Kind = kind

	resDeploymentOverview.Info = deployment

	// if portInfo is null
	if len(resDeploymentOverview.Ports) == 0 {
		resDeploymentOverview.Ports = []PortInfo{}
	}

	//pods
	// pod > ownerReferences[] > kind:"RepllicaSet", name,
	// Replicaset에서
	// > Deployement 검색 (이름/Uid)
	// Pod에서
	// > ownerreferences[{kind:"Deployment",name}] >

	ciChanRepl := make(chan ChanRes, len(deployedClusters))
	defer close(ciChanRepl)
	ciChanPod := make(chan ChanRes, len(deployedClusters))
	defer close(ciChanPod)
	ciChanEvent := make(chan ChanRes, len(deployedClusters))
	defer close(ciChanEvent)

	replInfoList := make(map[string]map[string]interface{})
	podInfoList := make(map[string]map[string]interface{})
	eventInfoList := make(map[string]map[string]interface{})

	for _, item := range deployedClusters {
		clusterNm := item.(string)
		replURL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + projectName + "/replicasets?clustername=" + clusterNm
		podURL := "https://" + openmcpURL + "/api/v1/namespaces/" + projectName + "/pods?clustername=" + clusterNm
		eventURL := "https://" + openmcpURL + "/api/v1/namespaces/" + projectName + "/events?clustername=" + clusterNm

		go func(clusterNm string) {
			CallAPIGO(ciChanRepl, replURL, clusterNm, token)
		}(clusterNm)
		go func(clusterNm string) {
			CallAPIGO(ciChanPod, podURL, clusterNm, token)
		}(clusterNm)
		go func(clusterNm string) {
			CallAPIGO(ciChanEvent, eventURL, clusterNm, token)
		}(clusterNm)
	}

	for range deployedClusters {
		commRepl := <-ciChanRepl
		commPod := <-ciChanPod
		commEvent := <-ciChanEvent
		// fmt.Println("1111", comm.name)
		replInfoList[commRepl.name] = commRepl.result
		podInfoList[commPod.name] = commPod.result
		eventInfoList[commEvent.name] = commEvent.result
	}

	// replicasets
	for _, item := range deployedClusters {
		clusterNm := item.(string)
		// http://192.168.0.152:31635/apis/apps/v1/namespaces/kube-system/replicasets?clustername=cluster2
		// replURL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + projectName + "/replicasets?clustername=" + clusterNm

		// go CallAPI(token, replURL, ch)
		// replResult := <-ch
		// replData := replResult.data
		replData := replInfoList[clusterNm]
		replItems := replData["items"].([]interface{})

		// find deployements within replicasets
		replUIDs := []string{}
		for _, element := range replItems {
			kind := GetStringElement(element, []string{"metadata", "ownerReferences", "kind"})
			name := GetStringElement(element, []string{"metadata", "ownerReferences", "name"})
			if kind == "Deployment" && name == deploymentName {
				uid := GetStringElement(element, []string{"metadata", "uid"})
				replUIDs = append(replUIDs, uid)
			}
		}

		//openmcp-apiserver-b84bf5cc7
		//ab2a2995-8dca-41ce-aead-8e112d75e3fe

		// find pods within deployments
		// replicasets
		// http://192.168.0.152:31635/apis/apps/v1/namespaces/kube-system/replicasets?clustername=cluster2
		// podURL := "https://" + openmcpURL + "/api/v1/namespaces/" + projectName + "/pods?clustername=" + clusterNm
		// go CallAPI(token, podURL, ch)
		// podResult := <-ch
		// podData := podResult.data
		podData := podInfoList[clusterNm]
		podItems := podData["items"].([]interface{})

		for _, element := range podItems {
			kind := GetStringElement(element, []string{"metadata", "ownerReferences", "kind"})
			if kind == "ReplicaSet" {
				uid := GetStringElement(element, []string{"metadata", "ownerReferences", "uid"})
				for _, item := range replUIDs {
					if item == uid {
						//Get pod info
						pod := PodInfo{}
						podName := GetStringElement(element, []string{"metadata", "name"})
						project := GetStringElement(element, []string{"metadata", "namespace"})
						status := GetStringElement(element, []string{"status", "phase"})
						podIP := "-"
						node := "-"
						nodeIP := "-"
						if status == "Running" {
							podIP = GetStringElement(element, []string{"status", "podIP"})
							node = GetStringElement(element, []string{"spec", "nodeName"})
							nodeIP = GetStringElement(element, []string{"status", "hostIP"})
						}

						cpu := "-"
						ram := "-"
						createdTime := GetStringElement(element, []string{"metadata", "creationTimestamp"})

						pod.Name = podName
						pod.Status = status
						pod.Cluster = clusterNm
						pod.Project = project
						pod.PodIP = podIP
						pod.Node = node
						pod.NodeIP = nodeIP
						pod.Cpu = cpu
						pod.Ram = ram
						pod.CreatedTime = createdTime

						resDeploymentOverview.Pods = append(resDeploymentOverview.Pods, pod)
					}
				}
			}
		}

		//events
		// eventURL := "https://" + openmcpURL + "/api/v1/namespaces/" + projectName + "/events?clustername=" + clusterNm
		// go CallAPI(token, eventURL, ch)
		// eventResult := <-ch
		// eventData := eventResult.data
		eventData := eventInfoList[clusterNm]
		eventItems := eventData["items"].([]interface{})
		resDeploymentOverview.Events = []Event{}

		if len(eventItems) > 0 {
			event := Event{}
			for _, element := range eventItems {
				kind := GetStringElement(element, []string{"involvedObject", "kind"})
				objectName := GetStringElement(element, []string{"involvedObject", "name"})
				if kind == "Deployment" && objectName == deploymentName {
					event.Typenm = GetStringElement(element, []string{"type"})
					event.Reason = GetStringElement(element, []string{"reason"})
					event.Message = GetStringElement(element, []string{"message"})
					// event.Time = GetStringElement(element, []string{"metadata", "creationTimestamp"})
					event.Time = GetStringElement(element, []string{"lastTimestamp"})
					event.Object = kind
					event.Project = projectName

					resDeploymentOverview.Events = append(resDeploymentOverview.Events, event)
				}
			}
		}
	}

	json.NewEncoder(w).Encode(resDeploymentOverview)
}

func GetOmcpDeploymentReplicaStatus(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	vars := mux.Vars(r)
	cluster := vars["clusterName"]
	projectName := vars["projectName"]
	deploymentName := vars["deploymentName"]

	// resReplicaStatus := ReplicaStatus{}

	// http://192.168.0.152:31635/apis/apps/v1/namespaces/openmcp/deployments/openmcp-deployment3?clustername=cluster1

	deploymentURL := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/" + projectName + "/openmcpdeployments/" + deploymentName + "?clustername=" + cluster

	// deploymentURL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + projectName + "/deployments/" + deploymentName + "?clustername=" + cluster

	go CallAPI(token, deploymentURL, ch)
	deploymentResult := <-ch
	deploymentData := deploymentResult.data

	clusterMaps := deploymentData["status"].(map[string]interface{})["clusterMaps"]

	clusterMapString := fmt.Sprintf("%v", clusterMaps)
	clusterMap := strings.Trim(strings.Split(clusterMapString, "map")[1], "[]")

	// cluster.split(" ").forEach(item => {
	//   clusters.push(item.split(':')[0]);
	// });

	type OmcpReplicaStatus struct {
		Cluster  string `json:"cluster"`
		Replicas string `json:"replicas"`
		// UnavailableReplicas int    `unavailable_replicas`
	}

	type ResOmcpReplicaStatus struct {
		OmcpReplicaStatus []OmcpReplicaStatus `json:"cluster"`
	}

	omcpReplicaStatus := OmcpReplicaStatus{}
	resOmcpReplicaStatus := ResOmcpReplicaStatus{}

	for _, clusterItem := range strings.Split(clusterMap, " ") {
		clusterInfo := strings.Split(clusterItem, ":")
		omcpReplicaStatus.Cluster = clusterInfo[0]
		omcpReplicaStatus.Replicas = clusterInfo[1]

		resOmcpReplicaStatus.OmcpReplicaStatus = append(resOmcpReplicaStatus.OmcpReplicaStatus, omcpReplicaStatus)
	}

	// readyReplicas := GetFloat64Element(deploymentData, []string{"status", "readyReplicas"})
	// replicas := GetFloat64Element(deploymentData, []string{"status", "replicas"})

	// resReplicaStatus.Cluster = cluster
	// resReplicaStatus.Project = namespace
	// resReplicaStatus.Deployment = deploymentName
	// resReplicaStatus.Replicas = int(replicas)
	// resReplicaStatus.ReadyReplicas = int(readyReplicas)

	json.NewEncoder(w).Encode(resOmcpReplicaStatus.OmcpReplicaStatus)
}

func UpdateDeploymentResources(w http.ResponseWriter, r *http.Request) {

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	clusterName := data["cluster"].(string)
	namespace := data["namespace"].(string)
	deployment := data["deployment"].(string)
	resources := data["resources"].(map[string]interface{})
	// map[spec:map[template:map[spec:map[containers:[map[name:nginx resources:map[requests:map[cpu:200m memory:20Mi]]]]]]]]
	// fmt.Println(resources)

	var jsonErrs []jsonErr

	// ${apiServer}/apis/apps/v1/namespaces/${req.body.namespace}/deployments/${req.body.deployment}?clustername=${req.body.cluster}
	URL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + namespace + "/deployments/" + deployment + "?clustername=" + clusterName

	resp, err := CallPatchAPI2(URL, "application/strategic-merge-patch+json", resources)
	var msg jsonErr

	if err != nil {
		msg = jsonErr{503, "failed", "request fail"}
	}

	var dataRes map[string]interface{}
	json.Unmarshal([]byte(resp), &dataRes)
	if dataRes != nil {
		if dataRes["kind"].(string) == "Status" {
			msg = jsonErr{501, "failed", dataRes["message"].(string)}
		} else {
			msg = jsonErr{200, "success", "Cluster Join Completed"}
		}
	}

	jsonErrs = append(jsonErrs, msg)
	json.NewEncoder(w).Encode(jsonErrs)
}

func UpdateReplicaSetPodNum(w http.ResponseWriter, r *http.Request) {

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지
	clusterName := data["cluster"].(string)
	namespace := data["namespace"].(string)
	deployment := data["deployment"].(string)
	body := data["value"].([]interface{})
	// map[spec:map[template:map[spec:map[containers:[map[name:nginx resources:map[requests:map[cpu:200m memory:20Mi]]]]]]]]
	// fmt.Println(body)

	var jsonErrs []jsonErr

	// https://192.168.0.152:30000/apis/apps/v1/namespaces/openmcp/deployments/openmcp-deployment5?clustername=cluster1

	URL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + namespace + "/deployments/" + deployment + "?clustername=" + clusterName

	resp, err := CallPatchAPI(URL, "application/json-patch+json", body, true)
	var msg jsonErr

	if err != nil {
		msg = jsonErr{503, "failed", "request fail"}
	}

	var dataRes map[string]interface{}
	json.Unmarshal([]byte(resp), &dataRes)
	if dataRes != nil {
		if dataRes["kind"].(string) == "Status" {
			msg = jsonErr{501, "failed", dataRes["message"].(string)}
		} else {
			msg = jsonErr{200, "success", "ReplicaSet PodNum Update Complete"}
		}
	}

	jsonErrs = append(jsonErrs, msg)
	json.NewEncoder(w).Encode(jsonErrs)
}

func CreateDeployments(w http.ResponseWriter, r *http.Request) {
	// w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	// w.WriteHeader(http.StatusOK)

	data := GetJsonBody(r.Body)

	defer r.Body.Close() // 리소스 누출 방지
	clusterName := data["cluster"].(string)
	yamlString := data["yaml"].(string)

	yamlReader := strings.NewReader(yamlString)
	b, err := ioutil.ReadAll(yamlReader)
	defer r.Body.Close()
	if err != nil {
		fmt.Println(err)
	}

	var jsonErrs []jsonErr
	decoder := yamlutil.NewYAMLOrJSONDecoder(bytes.NewReader(b), 1000)

	for {
		var urlString string
		var rawObj runtime.RawExtension
		if err = decoder.Decode(&rawObj); err != nil {
			break
		}

		obj, gvk, err := yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme).Decode(rawObj.Raw, nil, nil)
		if err != nil {
			log.Fatal("1  ", err)
		}
		unstructuredMap, err := runtime.DefaultUnstructuredConverter.ToUnstructured(obj)
		unstructuredObj := &unstructured.Unstructured{Object: unstructuredMap}
		namespace := "default"
		kind := "deployment"

		if unstructuredObj.GetKind() == "OpenMCPDeployment" {
			kind = "openmcpdeployment"
		}

		if unstructuredObj.GetNamespace() != "" {
			namespace = unstructuredObj.GetNamespace()
		}

		if gvk.Group == "" {
			urlString = "https://" + openmcpURL + "/apis/" + gvk.Version + "/namespaces/" + namespace + "/" + kind + "s?clustername=" + clusterName
		} else {
			urlString = "https://" + openmcpURL + "/apis/" + gvk.Group + "/" + gvk.Version + "/namespaces/" + namespace + "/" + kind + "s?clustername=" + clusterName
		}

		urlString = strings.ToLower(urlString)
		pBody := bytes.NewBuffer(rawObj.Raw)
		// fmt.Println("pBody:     ", pBody)
		resp, err := PostYaml(urlString, pBody)
		var msg jsonErr

		if err != nil {
			msg = jsonErr{503, "failed", "request fail | " + gvk.Kind + " | " + namespace + " | " + unstructuredObj.GetName()}
		}

		var data map[string]interface{}
		json.Unmarshal([]byte(resp), &data)
		if data != nil {
			if data["kind"].(string) == "Status" {
				msg = jsonErr{501, "failed", data["message"].(string) + " | " + gvk.Kind + " / " + namespace + " / " + unstructuredObj.GetName()}
			} else {
				msg = jsonErr{200, "success", "Resource Created" + " | " + gvk.Kind + " / " + namespace + " / " + unstructuredObj.GetName()}
			}
		}

		jsonErrs = append(jsonErrs, msg)
	}
	json.NewEncoder(w).Encode(jsonErrs)
}

func DeleteDeployments(w http.ResponseWriter, r *http.Request) {
	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	clusterName := data["cluster"].(string)
	namespace := data["namespace"].(string)
	deployment := data["deployment"].(string)
	ynOmcpDp := data["ynOmcpDp"].(bool)

	var jsonErrs []jsonErr

	URL := "https://" + openmcpURL + "/apis/apps/v1/namespaces/" + namespace + "/deployments/" + deployment + "?clustername=" + clusterName
	if ynOmcpDp {
		URL = "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/" + namespace + "/openmcpdeployments/" + deployment + "?clustername=" + clusterName
	}

	resp, err := CallDeleteAPI(URL)
	var msg jsonErr

	if err != nil {
		msg = jsonErr{503, "failed", "delete request fail"}
	}

	var dataRes map[string]interface{}
	json.Unmarshal([]byte(resp), &dataRes)

	if dataRes != nil {
		if dataRes["status"].(string) == "Success" {
			msg = jsonErr{200, "success", "Deployment delete completed"}
		} else {
			msg = jsonErr{501, "failed", dataRes["message"].(string)}
		}
	}

	jsonErrs = append(jsonErrs, msg)
	json.NewEncoder(w).Encode(jsonErrs)
}
