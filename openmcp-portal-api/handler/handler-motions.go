package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

func MigrationLog(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	migRes := MigrationRes{}
	URL := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/migrations?clustername=" + openmcpClusterName
	go CallAPI(token, URL, ch)
	result := <-ch
	migData := result.data
	migItems := migData["items"].([]interface{})

	for _, element := range migItems {
		name := GetStringElement(element, []string{"metadata", "name"})
		creationTime := GetStringElement(element, []string{"metadata", "creationTimestamp"})

		deployment := GetStringElement(element, []string{"spec", "migrationServiceSource", "migrationSource", "resourceName"})
		sourceCluster := GetStringElement(element, []string{"spec", "migrationServiceSource", "sourceCluster"})
		targetCluster := GetStringElement(element, []string{"spec", "migrationServiceSource", "targetCluster"})
		namespace := GetStringElement(element, []string{"spec", "migrationServiceSource", "nameSpace"})
		description := GetStringElement(element, []string{"status", "description"})
		elapsedTime := GetStringElement(element, []string{"status", "elapsedTime"})
		isZeroDownTime := GetStringElement(element, []string{"status", "isZeroDownTime"})
		progress := GetStringElement(element, []string{"status", "progress"})
		statusBool := GetStringElement(element, []string{"status", "status"})
		status := "Fail"
		if statusBool == "True" {
			status = "Success"
		} else if statusBool == "Running" {
			status = "Running"
		}

		migRes.MigrationInfo = append(migRes.MigrationInfo, MigrationInfo{name, deployment, sourceCluster, targetCluster, namespace, creationTime, description, elapsedTime, isZeroDownTime, progress, status})
	}
	json.NewEncoder(w).Encode(migRes.MigrationInfo)
}

func Migration(w http.ResponseWriter, r *http.Request) {
	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	clusterName := data["cluster"].(string)
	namespace := data["namespace"].(string)
	value := data["value"].(map[string]interface{})

	var jsonErrs []jsonErr
	URL := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/" + namespace + "/migrations?clustername=" + clusterName

	resp, err := CallPostAPI(URL, "application/json", value)
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
			msg = jsonErr{200, "success", "Migration Completed"}
		}
	}

	jsonErrs = append(jsonErrs, msg)
	json.NewEncoder(w).Encode(jsonErrs)
}

func SnapshotList(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()
	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	gCluster := data["g_clusters"].([]interface{})

	type SnapTemp struct {
		Name             string            `json:"name"`
		SnapshotSubInfos []SnapshotSubInfo `json:"snapshot_sub_info"`
	}
	var subInfoMap = make(map[string]SnapTemp)

	URL := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/snapshots?clustername=" + openmcpClusterName
	go CallAPI(token, URL, ch)
	result := <-ch
	snapData := result.data
	snapItems := snapData["items"].([]interface{})

	for _, element := range snapItems {

		statusBool := GetStringElement(element, []string{"status", "status"})
		status := "Fail"

		if statusBool == "True" {
			// progress := GetStringElement(element, []string{"status", "progress"})
			status = "Success"

			snapshotName := GetStringElement(element, []string{"metadata", "name"})
			creationTime := GetStringElement(element, []string{"metadata", "creationTimestamp"})
			groupSnapshotkey := GetStringElement(element, []string{"spec", "groupSnapshotKey"})
			spaceSnapshotSources := GetArrayElement(element, []string{"spec", "snapshotSources"})
			deployment := ""
			cluster := ""

			for _, item := range spaceSnapshotSources {
				resourceType := GetStringElement(item, []string{"resourceType"})
				if resourceType == "Deployment" {
					cluster = GetStringElement(item, []string{"resourceCluster"})
					deployment = GetStringElement(item, []string{"resourceName"})
				}
			}

			volumeSize := ""
			statusSnapshotSource := GetArrayElement(element, []string{"status", "snapshotSource"})
			for _, item := range statusSnapshotSource {
				resourceType := GetStringElement(item, []string{"resourceType"})
				if resourceType == "PersistentVolume" {
					snapshotVolumes := GetArrayElement(item, []string{"VolumeInfo"})
					for _, vol := range snapshotVolumes {
						if groupSnapshotkey == GetStringElement(vol, []string{"volumeSnapshotKey"}) {
							volumeSize = GetStringElement(vol, []string{"volumeSnapshotSize"})
						}
					}

				}
			}

			snapSubInfo := SnapshotSubInfo{}
			snapSubs := []SnapshotSubInfo{}

			snapSubInfo.Snapshot = snapshotName
			snapSubInfo.Status = status
			snapSubInfo.CreationTime = creationTime
			snapSubInfo.Cluster = cluster
			snapSubInfo.Deployment = deployment
			size, _ := strconv.ParseFloat(volumeSize, 64)
			snapSubInfo.Increment = size

			snapSubs = append(snapSubs, snapSubInfo)
			cluDep := cluster + deployment

			subInfoMap[cluDep] = SnapTemp{cluDep, append(subInfoMap[cluDep].SnapshotSubInfos, snapSubInfo)}
			// SnapshotSubInfo{snapshotName, status, creationTime, "5%"}
		}
	}

	clusterurl := "https://" + openmcpURL + "/apis/core.kubefed.io/v1beta1/kubefedclusters?clustername=openmcp"
	go CallAPI(token, clusterurl, ch)
	clusters := <-ch
	clusterData := clusters.data

	clusterNames := []string{}
	if gCluster[0] == "allClusters" {
		clusterNames = append(clusterNames, "openmcp")
	}

	resSnapshot := SnapshotRes{}

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

	for _, clusterName := range clusterNames {
		deploymentURL := "https://" + openmcpURL + "/apis/apps/v1/deployments?clustername=" + clusterName
		go CallAPI(token, deploymentURL, ch)
		deploymentResult := <-ch
		deploymentData := deploymentResult.data
		deploymentItems := deploymentData["items"].([]interface{})

		// get deployement Information
		for _, element := range deploymentItems {
			deployment := GetStringElement(element, []string{"metadata", "name"})
			namespace := GetStringElement(element, []string{"metadata", "namespace"})
			cldp := clusterName + deployment

			snapshots := 0
			if subInfoMap[cldp].SnapshotSubInfos != nil {
				snapshots = len(subInfoMap[cldp].SnapshotSubInfos)
			}

			resSnapshot.SnapshotInfo = append(resSnapshot.SnapshotInfo, SnapshotInfo{deployment, strconv.Itoa(snapshots), clusterName, namespace, subInfoMap[cldp].SnapshotSubInfos})
		}
	}

	json.NewEncoder(w).Encode(resSnapshot.SnapshotInfo)
}

func SnapshotLog(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	snapRes := SnapshotLogRes{}

	URL := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/snapshots?clustername=" + openmcpClusterName
	go CallAPI(token, URL, ch)
	result := <-ch
	snapData := result.data
	snapItems := snapData["items"].([]interface{})

	restoreUrl := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/snapshotrestores?clustername=" + openmcpClusterName
	go CallAPI(token, restoreUrl, ch)
	restoreResult := <-ch
	restoreData := restoreResult.data
	restoreItems := restoreData["items"].([]interface{})

	for _, element := range snapItems {
		//main
		snapshotName := GetStringElement(element, []string{"metadata", "name"})
		namespace := GetStringElement(element, []string{"metadata", "namespace"})
		statusBool := GetStringElement(element, []string{"status", "status"})
		status := statusBool
		// status := "Fail"
		// if statusBool == "True" {
		// 	status = "Success"
		// }

		description := GetStringElement(element, []string{"status", "description"})
		// reasonObj := GetStringElement(element, []string{"status", "reason"})
		// reason := ""

		// if reasonObj != "-" {
		// 	slice := strings.Split(reasonObj, ",")
		// 	reason = strings.Replace(slice[3], "\"", "", -1)
		// 	reason = strings.Replace(reason, "\\", "\"", -1)
		// 	reason = strings.Replace(reason, "Reason:", "", -1)
		// }
		creationTime := GetStringElement(element, []string{"metadata", "creationTimestamp"})
		elapsedTime := GetStringElement(element, []string{"status", "elapsedTime"})
		progress := GetStringElement(element, []string{"status", "progress"})
		snapSubInfo := SnapshotLogSubInfo{}
		snapSubs := []SnapshotLogSubInfo{}

		snapshotKey := GetStringElement(element, []string{"spec", "groupSnapshotKey"})
		sources := GetArrayElement(element, []string{"spec", "snapshotSources"})
		deployment := ""
		for _, item := range sources {
			resourceType := GetStringElement(item, []string{"resourceType"})
			if resourceType == "Deployment" {
				deployment = GetStringElement(item, []string{"resourceName"})
			}
			snapSubInfo.Cluster = GetStringElement(item, []string{"resourceCluster"})
			snapSubInfo.ResourceName = GetStringElement(item, []string{"resourceName"})
			snapSubInfo.Namespace = GetStringElement(item, []string{"resourceNamespace"})
			snapSubInfo.Type = GetStringElement(item, []string{"resourceType"})
			snapSubInfo.SnapshotKey = "-"
			snapSubs = append(snapSubs, snapSubInfo)
		}

		snapRes.SnpashotLogInfo = append(snapRes.SnpashotLogInfo, SnpashotLogInfo{"snapshot", snapshotName, deployment, namespace, status, description, snapshotKey, creationTime, elapsedTime, progress, snapSubs})
	}

	for _, element := range restoreItems {

		if element.(map[string]interface{})["status"] != nil {
			restoreName := GetStringElement(element, []string{"metadata", "name"})
			namespace := GetStringElement(element, []string{"metadata", "namespace"})
			statusBool := GetStringElement(element, []string{"status", "status"})
			status := statusBool //True, Running, False

			description := GetStringElement(element, []string{"status", "description"})
			// reasonObj := GetStringElement(element, []string{"status", "reason"})
			// reason := ""

			// if reasonObj != "-" {
			// 	slice := strings.Split(reasonObj, ",")
			// 	reason = strings.Replace(slice[1], "\"", "", -1)
			// 	reason = strings.Replace(reason, "\\", "\"", -1)
			// 	reason = strings.Replace(reason, "Reason:", "", -1)
			// 	reason = strings.Replace(reason, "}", "", -1)
			// }

			creationTime := GetStringElement(element, []string{"metadata", "creationTimestamp"})
			elapsedTime := GetStringElement(element, []string{"status", "elapsedTime"})
			progress := GetStringElement(element, []string{"status", "progress"})
			snapSubInfo := SnapshotLogSubInfo{}
			snapSubs := []SnapshotLogSubInfo{}

			snapshotKey := GetStringElement(element, []string{"spec", "groupSnapshotKey"})
			sources := GetArrayElement(element, []string{"status", "snapshotRestoreSource"})
			deployment := ""

			for _, item := range sources {
				resourceType := GetStringElement(item, []string{"resourceType"})
				if resourceType == "Deployment" {
					resourceSnapshotKey := GetStringElement(item, []string{"resourceSnapshotKey"})

					slice := strings.Split(resourceSnapshotKey, "/")
					deployment = slice[len(slice)-1]

					snapSubInfo.Cluster = GetStringElement(item, []string{"resourceCluster"})
					snapSubInfo.Namespace = GetStringElement(item, []string{"resourceNamespace"})
					snapSubInfo.Type = resourceType
					snapSubInfo.SnapshotKey = GetStringElement(item, []string{"resourceSnapshotKey"})
				}
				snapSubInfo.ResourceName = "-"
				snapSubs = append(snapSubs, snapSubInfo)
			}

			snapRes.SnpashotLogInfo = append(snapRes.SnpashotLogInfo, SnpashotLogInfo{"restore", restoreName, deployment, namespace, status, description, snapshotKey, creationTime, elapsedTime, progress, snapSubs})
		}
		//main
	}

	json.NewEncoder(w).Encode(snapRes.SnpashotLogInfo)
}

func TakeSnapshot(w http.ResponseWriter, r *http.Request) {
	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	clusterName := data["cluster"].(string)
	namespace := data["namespace"].(string)
	value := data["value"].(map[string]interface{})

	var jsonErrs []jsonErr
	URL := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/" + namespace + "/snapshots?clustername=" + clusterName
	resp, err := CallPostAPI(URL, "application/json", value)
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
			msg = jsonErr{200, "success", "Take Snapshot Completed"}
		}
	}

	jsonErrs = append(jsonErrs, msg)
	json.NewEncoder(w).Encode(jsonErrs)
}

func SnapshotRestore(w http.ResponseWriter, r *http.Request) {
	ch := make(chan Resultmap)
	token := GetOpenMCPToken()

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	//snapshot 정보 확인
	//해당 정보로 restore 수행

	clusterName := data["cluster"].(string)
	namespace := data["namespace"].(string)
	snapshotName := data["snapshot"].(string)
	restoreName := data["restoreName"].(string)

	var jsonErrs []jsonErr

	URL := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/" + namespace + "/snapshots/" + snapshotName + "?clustername=" + clusterName
	go CallAPI(token, URL, ch)
	result := <-ch
	snapData := result.data

	// apiVersion: openmcp.k8s.io/v1alpha1
	// kind: SnapshotRestore
	// metadata:
	// 	name: example-snapshotrestore-group
	// spec:
	// 	groupSnapshotKey: "1636967136"
	// 	isGroupSnapshot: true

	var msg jsonErr
	if snapData["kind"].(string) == "Snapshot" && GetStringElement(snapData["status"], []string{"status"}) == "True" {
		apiVersion := snapData["apiVersion"].(string)
		kind := "SnapshotRestore"
		groupSnapshotKey := GetStringElement(snapData["spec"], []string{"groupSnapshotKey"})
		isGroupSnapshot := true //GetBoolElement(snapData["spec"], []string{"isGroupSnapshot"})

		// snapshotSource := snapData["status"].(map[string]interface{})["snapshotSource"].([]interface{})

		type MetaData struct {
			Name string `json:"name"`
		}

		type Spec struct {
			GroupSnapshotKey string `json:"groupSnapshotKey"`
			IsGroupSnapshot  bool   `json:"isGroupSnapshot"`
			// SnapshotRestoreSource []interface{} `json:"snapshotRestoreSource"`
		}

		type RestoreInfo struct {
			ApiVersion string   `json:"apiVersion"`
			Kind       string   `json:"kind"`
			Metadata   MetaData `json:"metadata"`
			Spec       Spec     `json:"spec"`
		}

		value := RestoreInfo{apiVersion, kind, MetaData{restoreName}, Spec{groupSnapshotKey, isGroupSnapshot}}
		e, err := json.Marshal(value)

		var dataRes2 map[string]interface{}
		json.Unmarshal(e, &dataRes2)
		// fmt.Println(string(e))

		restoreURL := "https://" + openmcpURL + "/apis/openmcp.k8s.io/v1alpha1/namespaces/" + namespace + "/snapshotrestores?clustername=" + clusterName
		// fmt.Println(dataRes2)
		resp, err := CallPostAPI(restoreURL, "application/json", dataRes2)
		if err != nil {
			msg = jsonErr{503, "failed", "request fail"}
		}

		var dataRes map[string]interface{}
		json.Unmarshal([]byte(resp), &dataRes)
		if dataRes != nil {
			if dataRes["kind"].(string) == "Status" {
				msg = jsonErr{501, "failed", dataRes["message"].(string)}
			} else {
				msg = jsonErr{200, "success", "Snapshot Restore Completed"}
			}
		}

		jsonErrs = append(jsonErrs, msg)
	} else {
		msg = jsonErr{503, "failed", "data not exist"}
		jsonErrs = append(jsonErrs, msg)
	}

	json.NewEncoder(w).Encode(jsonErrs)
}
