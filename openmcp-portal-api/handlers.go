package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"portal-api-server/cloud"
	"portal-api-server/handler"
	"strconv"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/autoscaling"
	"github.com/aws/aws-sdk-go/service/eks"
)

var openmcpURL = handler.InitPortalConfig()

func GetEKSClusterInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	// http://192.168.0.51:4885/apis/geteksclusterinfo?region=ap-northeast-2
	// aws test(lkh1434@gmail.com)

	// region := r.URL.Query().Get("region")
	// akid := "AKIAJGFO6OXHRN2H6DSA"
	// secretkey := "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" //
	// // akid := "AKIAVJTB7UPJPEMHUAJR"
	// // secretkey := "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" //

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지

	region := data["region"].(string)
	akid := data["accessKey"].(string)
	secretkey := data["secretKey"].(string)

	sess, err := session.NewSession(&aws.Config{
		// Region:      aws.String("	ap-northeast-2"), //
		Region:      aws.String(region), //
		Credentials: credentials.NewStaticCredentials(akid, secretkey, ""),
	})

	if err != nil {
		errmsg := jsonErr{503, "failed", "result fail"}
		json.NewEncoder(w).Encode(errmsg)
	}

	var clusters []EKSCluster

	svc := eks.New(sess)
	asSvc := autoscaling.New(sess)
	cls, _ := svc.ListClusters(&eks.ListClustersInput{})

	for _, v := range cls.Clusters {
		ngs, _ := svc.ListNodegroups(&eks.ListNodegroupsInput{
			ClusterName: aws.String(*v),
		})
		var nodegroups []EKSNodegroup
		for _, ng := range ngs.Nodegroups {
			fmt.Println(*ng)
			dng, _ := svc.DescribeNodegroup(&eks.DescribeNodegroupInput{
				ClusterName:   aws.String(*v),
				NodegroupName: aws.String(*ng),
			})
			desiredSize := dng.Nodegroup.ScalingConfig.DesiredSize
			maxSize := dng.Nodegroup.ScalingConfig.MaxSize
			minSize := dng.Nodegroup.ScalingConfig.MinSize
			instanceType := dng.Nodegroup.InstanceTypes[0]
			asgs := dng.Nodegroup.Resources.AutoScalingGroups
			asEKSInstances := make(map[string][]EKSInstance)
			var asgName string
			for _, asg := range asgs {
				instances, _ := asSvc.DescribeAutoScalingInstances(&autoscaling.DescribeAutoScalingInstancesInput{})
				var ints []EKSInstance
				for index, instance := range instances.AutoScalingInstances {
					if *asg.Name == *instance.AutoScalingGroupName {
						fmt.Println(instance)
						fmt.Println(index, *instance.AutoScalingGroupName, *instance.InstanceId)
						ints = append(ints, EKSInstance{*instance.InstanceId})
					}
				}
				asgName = *asg.Name
				asEKSInstances[*asg.Name] = ints
			}
			nodegroups = append(nodegroups, EKSNodegroup{
				*ng,
				*instanceType,
				*desiredSize,
				*maxSize,
				*minSize,
				asgName,
				region,
				asEKSInstances[asgName],
			})
		}
		clusters = append(clusters, EKSCluster{*v, nodegroups})
	}
	json.NewEncoder(w).Encode(clusters)
}

// add/remove eks node
func ChangeEKSnode(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	// Post로 변경
	body := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지
	region := body["region"].(string)
	cluster := body["cluster"].(string)
	nodegroup := body["nodePool"].(string)
	desiredSizeStr := body["desiredCnt"].(string)
	akid := body["accessKey"].(string)
	secretkey := body["secretKey"].(string)

	// http://192.168.0.51:4885/apis/changeeksnode?region=ap-northeast-2&cluster=eks-cluster1&nodegroup=ng-1&nodecount=3
	// region := r.URL.Query().Get("region")
	// cluster := r.URL.Query().Get("cluster")
	// nodegroup := r.URL.Query().Get("nodegroup")
	// desiredSizeStr := r.URL.Query().Get("nodecount")
	// akid := "AKIAJGFO6OXHRN2H6DSA"
	// secretkey := "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"
	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(region),
		Credentials: credentials.NewStaticCredentials(akid, secretkey, ""),
	})

	if err != nil {
		errmsg := jsonErr{503, "failed", "result fail"}
		json.NewEncoder(w).Encode(errmsg)
	}

	svc := eks.New(sess)

	desirecnt, err := strconv.ParseInt(desiredSizeStr, 10, 64)

	// // la := make(map[string]*string)
	// // namelabel := "newlabel01"
	// // la["newlabel01"] = &namelabel

	// labelinput := eks.UpdateLabelsPayload{la["newlabel01"]}

	addResult, err := svc.UpdateNodegroupConfig(&eks.UpdateNodegroupConfigInput{
		ClusterName:   aws.String(cluster), //
		NodegroupName: aws.String(nodegroup),
		// Labels:        &eks.UpdateLabelsPayload{AddOrUpdateLabels: la},
		ScalingConfig: &eks.NodegroupScalingConfig{
			DesiredSize: &desirecnt,
			MaxSize:     &desirecnt,
		},
	})

	if err != nil {
		errmsg := jsonErr{503, "failed", "result fail"}
		json.NewEncoder(w).Encode(errmsg)
	}

	successmsg := jsonErr{200, "success", addResult.String()}
	// fmt.Println(addResult)
	json.NewEncoder(w).Encode(successmsg)

}

func Addec2node(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	data := GetJsonBody(r.Body)
	defer r.Body.Close() // 리소스 누출 방지
	node := data["node"].(string)
	cluster := data["cluster"].(string)
	aKey := data["a_key"].(string)
	sKey := data["s_key"].(string)
	result := cloud.AddNode(node, aKey, sKey)
	if err := json.NewEncoder(w).Encode(result); err != nil {
		errmsg := jsonErr{503, "failed", "result fail"}
		json.NewEncoder(w).Encode(errmsg)
	}
	if result.Result != "Could not create instance" {
		go cloud.GetNodeState(&result.InstanceID, node, cluster, aKey, sKey)
	}
}

// func WorkloadsDeploymentsOverviewList(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
// 	w.WriteHeader(http.StatusOK)
// 	if err := json.NewEncoder(w).Encode(resource.ListResource()); err != nil {
// 		panic(err)
// 	}

// }

// func WorkloadsPodsOverviewList(w http.ResponseWriter, r *http.Request) {
// 	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
// 	vars := mux.Vars(r)

// 	var client http.Client
// 	resp, err := client.Get("https://" + targetURL + "/seedcontainer/api/v1/clusters/" + vars["clusterName"] + "/daemonsets/list")
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode == http.StatusOK {
// 		bodyBytes, err := ioutil.ReadAll(resp.Body)
// 		if err != nil {
// 			log.Fatal(err)
// 		}
// 		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
// 		w.WriteHeader(http.StatusOK)
// 		w.Write(bodyBytes)
// 	}
// }

// func getDeploymentList(w http.ResponseWriter, r *http.Request) {
// 	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
// 	vars := mux.Vars(r)

// 	var client http.Client
// 	resp, err := client.Get("https://" + targetURL + "/seedcontainer/api/v1/clusters/" + vars["clusterName"] + "/deployments/list")
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode == http.StatusOK {
// 		bodyBytes, err := ioutil.ReadAll(resp.Body)
// 		if err != nil {
// 			log.Fatal(err)
// 		}
// 		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
// 		w.WriteHeader(http.StatusOK)
// 		w.Write(bodyBytes)
// 	}
// }

// func getDeploymentDetail(w http.ResponseWriter, r *http.Request) {
// 	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
// 	vars := mux.Vars(r)

// 	var client http.Client

// 	callUrl := "https://" + targetURL + "/seedcontainer/api/v1/clusters/" + vars["clusterName"] + "/namespaces/" + vars["namespaceName"] + "/deployments/" + vars["deploymentName"] + "/detail"
// 	//fmt.Print(callUrl)

// 	resp, err := client.Get(callUrl)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode == http.StatusOK {
// 		bodyBytes, err := ioutil.ReadAll(resp.Body)
// 		if err != nil {
// 			log.Fatal(err)
// 		}
// 		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
// 		w.WriteHeader(http.StatusOK)
// 		w.Write(bodyBytes)
// 	}
// }

// func getDeploymentYaml(w http.ResponseWriter, r *http.Request) {
// 	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
// 	vars := mux.Vars(r)

// 	var client http.Client

// 	callUrl := "https://" + targetURL + "/seedcontainer/api/v1/clusters/" + vars["clusterName"] + "/namespaces/" + vars["namespaceName"] + "/deployments/" + vars["deploymentName"] + "/yaml"
// 	//fmt.Print(callUrl)

// 	resp, err := client.Get(callUrl)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode == http.StatusOK {
// 		bodyBytes, err := ioutil.ReadAll(resp.Body)
// 		if err != nil {
// 			log.Fatal(err)
// 		}
// 		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
// 		w.WriteHeader(http.StatusOK)
// 		w.Write(bodyBytes)
// 	}
// }

// func getDeploymentEvent(w http.ResponseWriter, r *http.Request) {
// 	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
// 	vars := mux.Vars(r)

// 	var client http.Client

// 	callUrl := "https://" + targetURL + "/seedcontainer/api/v1/clusters/" + vars["clusterName"] + "/namespaces/" + vars["namespaceName"] + "/deployments/" + vars["deploymentName"] + "/events"
// 	//fmt.Print(callUrl)

// 	resp, err := client.Get(callUrl)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode == http.StatusOK {
// 		bodyBytes, err := ioutil.ReadAll(resp.Body)
// 		if err != nil {
// 			log.Fatal(err)
// 		}
// 		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
// 		w.WriteHeader(http.StatusOK)
// 		w.Write(bodyBytes)
// 	}
// }
