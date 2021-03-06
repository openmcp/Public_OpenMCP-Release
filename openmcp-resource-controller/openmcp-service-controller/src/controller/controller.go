/*
Copyright 2018 The Multicluster-Controller Authors.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package openmcpservice

import (
	"context"
	"encoding/json"
	"fmt"
	"openmcp/openmcp/apis"
	resourcev1alpha1 "openmcp/openmcp/apis/resource/v1alpha1"
	syncv1alpha1 "openmcp/openmcp/apis/sync/v1alpha1"
	"openmcp/openmcp/omcplog"
	"openmcp/openmcp/util/clusterManager"
	"reflect"
	"strconv"

	"admiralty.io/multicluster-controller/pkg/cluster"
	"admiralty.io/multicluster-controller/pkg/controller"
	"admiralty.io/multicluster-controller/pkg/reconcile"
	"admiralty.io/multicluster-controller/pkg/reference"
	"github.com/getlantern/deepcopy"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

var cm *clusterManager.ClusterManager

func NewController(live *cluster.Cluster, ghosts []*cluster.Cluster, ghostNamespace string, myClusterManager *clusterManager.ClusterManager) (*controller.Controller, error) {
	omcplog.V(4).Info("Function Called NewController")
	cm = myClusterManager

	liveclient, err := live.GetDelegatingClient()
	if err != nil {
		return nil, fmt.Errorf("getting delegating client for live cluster: %v", err)
	}

	ghostclients := []client.Client{}
	for _, ghost := range ghosts {
		ghostclient, err := ghost.GetDelegatingClient()
		if err != nil {
			return nil, fmt.Errorf("getting delegating client for ghost cluster: %v", err)
		}
		ghostclients = append(ghostclients, ghostclient)
	}

	co := controller.New(&reconciler{live: liveclient, ghosts: ghostclients, ghostNamespace: ghostNamespace}, controller.Options{MaxConcurrentReconciles: 32})
	if err := apis.AddToScheme(live.GetScheme()); err != nil {
		return nil, fmt.Errorf("adding APIs to live cluster's scheme: %v", err)
	}

	if err := co.WatchResourceReconcileObject(context.TODO(), live, &resourcev1alpha1.OpenMCPService{}, controller.WatchOptions{}); err != nil {
		return nil, fmt.Errorf("setting up Pod watch in live cluster: %v", err)
	}

	for _, ghost := range ghosts {
		if err := co.WatchResourceReconcileController(context.TODO(), ghost, &corev1.Service{}, controller.WatchOptions{}); err != nil {
			return nil, fmt.Errorf("setting up PodGhost watch in ghost cluster: %v", err)
		}
	}

	return co, nil
}

type reconciler struct {
	live           client.Client
	ghosts         []client.Client
	ghostNamespace string
}

var i int = 0

func (r *reconciler) Reconcile(req reconcile.Request) (reconcile.Result, error) {
	omcplog.V(4).Info("Function Called Reconcile")
	i += 1
	omcplog.V(5).Info("********* [", i, "] *********")
	omcplog.V(3).Info(req.Context, " / ", req.Namespace, " / ", req.Name)

	// Fetch the OpenMCPService instance
	instance := &resourcev1alpha1.OpenMCPService{}
	err := r.live.Get(context.TODO(), req.NamespacedName, instance)

	omcplog.V(3).Info("instance Name: ", instance.Name)
	omcplog.V(3).Info("instance Namespace : ", instance.Namespace)

	if err != nil {
		if errors.IsNotFound(err) {
			omcplog.V(3).Info("***********************")
			omcplog.V(3).Info("*Osvc Delete Detection*")
			omcplog.V(3).Info("***********************")
			omcplog.V(3).Info("Delete Services ..Cluster")

			err := r.DeleteServices(cm, req.NamespacedName.Name, req.NamespacedName.Namespace)

			// OpenMCPIngress Check
			r.IngressNotify(req.NamespacedName.Name, req.NamespacedName.Namespace)

			return reconcile.Result{}, err
		} else {
			omcplog.V(0).Info(err)
			return reconcile.Result{}, err
		}

	}
	if instance.Status.ClusterMaps == nil {
		omcplog.V(3).Info("***********************")
		omcplog.V(3).Info("*Osvc Create Detection*")
		omcplog.V(3).Info("***********************")
		omcplog.V(3).Info("Service Create Start")
		err := r.createService(req, cm, instance)
		if err != nil {
			omcplog.V(0).Info(err)
			return reconcile.Result{}, err
		}

		//OpenMCPIngress Check
		r.IngressNotify(instance.Name, instance.Namespace)

		return reconcile.Result{}, nil

	}
	if !reflect.DeepEqual(instance.Status.LastSpec, instance.Spec) {
		omcplog.V(3).Info("***********************")
		omcplog.V(3).Info("*Osvc Update Detection*")
		omcplog.V(3).Info("***********************")
		omcplog.V(3).Info("Service Update Start")

		err := r.updateService(req, cm, instance)
		if err != nil {
			omcplog.V(0).Info(err)
			return reconcile.Result{}, err
		}

		// OpenMCPIngress Check
		r.IngressNotify(instance.Name, instance.Namespace)

		return reconcile.Result{}, nil

	}
	if instance.Status.ChangeNeed {
		omcplog.V(3).Info("***********************")
		omcplog.V(3).Info("*Odep Change Detection*")
		omcplog.V(3).Info("***********************")
		omcplog.V(3).Info("Receive notify from OpenMCP Deployment ")

		r.updateService(req, cm, instance)

		// OpenMCPIngress Check
		r.IngressNotify(instance.Name, instance.Namespace)
		return reconcile.Result{}, nil

	}

	// Check Service in cluster
	if instance.Status.CheckSubResource == true {
		omcplog.V(2).Info("[Member Cluster Check Service]")
		sync_req_name := ""
		for k, v := range instance.Status.ClusterMaps {
			cluster_name := k
			replica := v

			if v == 0 {
				continue
			}
			// if _, ok := cm.Cluster_genClients[cluster_name]; !ok {
			// 	r.updateService(req, cm, instance)
			// }
			found := &corev1.Service{}
			if _, ok := cm.Cluster_genClients[cluster_name]; ok {
				cluster_client := cm.Cluster_genClients[cluster_name]
				err = cluster_client.Get(context.TODO(), found, instance.Namespace, instance.Name)

				if err != nil && errors.IsNotFound(err) {
					// Delete Service Detected
					omcplog.V(2).Info("Cluster '"+cluster_name+"' ReDeployed => ", replica)
					svc := r.serviceForOpenMCPService(req, instance, cluster_name)

					command := "create"
					omcplog.V(3).Info("SyncResource Create (ClusterName : "+cluster_name+", Command : "+command+", Replicas :", replica, ")")
					sync_req_name, err = r.sendSync(svc, command, cluster_name)

					r.IngressNotify(instance.Name, instance.Namespace)

					if err != nil {
						return reconcile.Result{}, err
					}

				} else {
					omcplog.V(0).Info("err GenClients", cluster_name)
				}
			}

		}
		omcplog.V(3).Info("sync_req_name : ", sync_req_name)

	}

	return reconcile.Result{}, nil // err
}

func (r *reconciler) serviceForOpenMCPService(req reconcile.Request, m *resourcev1alpha1.OpenMCPService, clusterName string) *corev1.Service {
	omcplog.V(4).Info("Function Called serviceForOpenMCPService")

	svc := &corev1.Service{
		TypeMeta: metav1.TypeMeta{
			Kind:       "Service",
			APIVersion: "v1",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name:      m.Name,
			Namespace: m.Namespace,
		},
	}

	deepcopy.Copy(&svc.Spec, &m.Spec.Template.Spec)
	// deepcopy.Copy(&svc.Spec.Selector, &m.Spec.LabelSelector)

	r.ApplyClusterLabel(svc, clusterName)

	reference.SetMulticlusterControllerReference(svc, reference.NewMulticlusterOwnerReference(m, m.GroupVersionKind(), req.Context))

	return svc
}

func (r *reconciler) ApplyClusterLabel(svc *corev1.Service, clusterName string) {
	newLabel := svc.Spec.Selector
	if newLabel == nil {
		newLabel = make(map[string]string)
	}
	newLabel["cluster"] = clusterName

	svc.Spec.Selector = newLabel
	// dep.Spec.Selector.MatchLabels = newLabel

}
func (r *reconciler) DeleteServices(cm *clusterManager.ClusterManager, name string, namespace string) error {
	omcplog.V(4).Info("Function Called DeleteServices")

	svc := &corev1.Service{}
	for _, cluster := range cm.Cluster_list.Items {
		cluster_client := cm.Cluster_genClients[cluster.Name]
		fmt.Println(namespace, name)
		err := cluster_client.Get(context.Background(), svc, namespace, name)
		if err != nil && errors.IsNotFound(err) {
			omcplog.V(0).Info("Not Found")
			continue
		}
		if !isInObject(svc, "OpenMCPService") {
			continue
		}
		omcplog.V(3).Info(cluster.Name, " Delete Start")
		svc = &corev1.Service{
			TypeMeta: metav1.TypeMeta{
				Kind:       "Service",
				APIVersion: "v1",
			},
			ObjectMeta: metav1.ObjectMeta{
				Name:      name,
				Namespace: namespace,
			},
		}
		command := "delete"
		_, err = r.sendSync(svc, command, cluster.Name)
		if err != nil {
			return err
		}
		omcplog.V(3).Info(cluster.Name, "Delete Complate")
	}
	return nil
}

func isInObject(child *corev1.Service, parent string) bool {
	omcplog.V(4).Info("Function Called isInObject")
	refKind_str := child.ObjectMeta.Annotations["multicluster.admiralty.io/controller-reference"]
	omcplog.V(5).Info("refKind_str: ", refKind_str)
	refKind_map := make(map[string]interface{})
	err := json.Unmarshal([]byte(refKind_str), &refKind_map)
	if err != nil {
		panic(err)
	}
	if _, ok := refKind_map["kind"]; !ok {
		return false
	}
	if refKind_map["kind"] == parent {
		return true
	}
	return false
}
func unique(strSlice []string) []string {
	omcplog.V(4).Info("Function Called unique")
	keys := make(map[string]bool)
	list := []string{}
	for _, entry := range strSlice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}

func (r *reconciler) getClusterIncludeLabel(label_map map[string]string, namespace string) []string {
	omcplog.V(4).Info("Function Called getClusterIncludeLabel")
	result_cluster_list := []string{}

	odeploy_list := &resourcev1alpha1.OpenMCPDeploymentList{}
	listOptions := &client.ListOptions{Namespace: namespace}

	r.live.List(context.TODO(), odeploy_list, listOptions)
	for _, odeploy := range odeploy_list.Items {
		omcplog.V(5).Info("odeploy Name : ", odeploy.Name)
		for k, v := range odeploy.Spec.Labels {
			omcplog.V(5).Info("label : ", k, " / ", v)
			if label_map[k] == v {
				omcplog.V(5).Info("Match!")
				for cluster_name, replica := range odeploy.Status.ClusterMaps {
					fmt.Println(cluster_name, replica)
					if replica != 0 {
						result_cluster_list = append(result_cluster_list, cluster_name)
					}
				}
			}
		}
	}
	result_cluster_list = unique(result_cluster_list)

	omcplog.V(3).Info(result_cluster_list)
	return result_cluster_list
}
func (r *reconciler) createService(req reconcile.Request, cm *clusterManager.ClusterManager, instance *resourcev1alpha1.OpenMCPService) error {
	omcplog.V(4).Info("Function Called createService")
	cluster_map := make(map[string]int32)

	for _, cluster := range cm.Cluster_list.Items {
		cluster_map[cluster.Name] = 0
	}

	label_include_cluster_list := r.getClusterIncludeLabel(instance.Spec.Template.Spec.Selector, instance.Namespace)
	//clusterList := cm.Cluster_list

	//for _, cluster := range clusterList.Items {
	//	cluster_name := cluster.Name
	for _, cluster_name := range label_include_cluster_list {
		omcplog.V(5).Info("cluster_name: ", cluster_name)
		found := &corev1.Service{}
		cluster_client := cm.Cluster_genClients[cluster_name]

		err := cluster_client.Get(context.TODO(), found, instance.Namespace, instance.Name)

		if err != nil && errors.IsNotFound(err) {
			omcplog.V(5).Info("sendSyc: ", cluster_name)
			command := "create"
			svc := r.serviceForOpenMCPService(req, instance, cluster_name)
			_, err = r.sendSync(svc, command, cluster_name)
			cluster_map[cluster_name] = 1
			if err != nil {
				omcplog.V(0).Info("Send Sync err: ", err)
				return err
			}
		} else {
			return err
		}
	}
	omcplog.V(5).Info("Status Update")
	instance.Status.CheckSubResource = true
	instance.Status.LastSpec = instance.Spec
	instance.Status.ClusterMaps = cluster_map

	err := r.live.Status().Update(context.TODO(), instance)
	omcplog.V(5).Info("Status Update Result :", err)
	return err

}
func contains(slice []string, item string) bool {
	omcplog.V(4).Info("Function Called contains")
	set := make(map[string]struct{}, len(slice))
	for _, s := range slice {
		set[s] = struct{}{}
	}

	_, ok := set[item]
	return ok
}
func (r *reconciler) updateService(req reconcile.Request, cm *clusterManager.ClusterManager, instance *resourcev1alpha1.OpenMCPService) error {
	omcplog.V(4).Info("Function Called updateService")
	cluster_map := make(map[string]int32)

	for _, cluster := range cm.Cluster_list.Items {
		cluster_map[cluster.Name] = 0
	}
	// for _, cluster := range cm.Cluster_list.Items {

	// 	omcplog.V(3).Info("Cluster '" + cluster.Name + "' Deployed")
	// 	dep := r.serviceForOpenMCPService(req, instance, cluster.Name)
	// 	command := "update"
	// 	_, err := r.sendSync(dep, command, cluster.Name)
	// 	if err != nil {
	// 		return err
	// 	}
	// }
	label_include_cluster_list := r.getClusterIncludeLabel(instance.Spec.Template.Spec.Selector, instance.Namespace)

	for _, cluster := range cm.Cluster_list.Items {
		cluster_client := cm.Cluster_genClients[cluster.Name]

		found := &corev1.Service{}
		err := cluster_client.Get(context.TODO(), found, instance.Namespace, instance.Name)

		if contains(label_include_cluster_list, cluster.Name) {
			if err != nil && errors.IsNotFound(err) {
				svc := r.serviceForOpenMCPService(req, instance, cluster.Name)
				cluster_map[cluster.Name] = 1
				command := "create"
				omcplog.V(3).Info("Create Service")
				_, err = r.sendSync(svc, command, cluster.Name)
				if err != nil {
					return err
				}
			} else if err == nil {
				svc := r.serviceForOpenMCPService(req, instance, cluster.Name)

				svc.Spec.ClusterIP = found.Spec.ClusterIP
				svc.ResourceVersion = found.ResourceVersion

				cluster_map[cluster.Name] = 1
				command := "update"
				omcplog.V(3).Info("Update Service")
				_, err = r.sendSync(svc, command, cluster.Name)
				if err != nil {
					return err
				}
			}
		} else {
			if err != nil && errors.IsNotFound(err) {
				continue
			} else if err == nil {
				svc := &corev1.Service{
					TypeMeta: metav1.TypeMeta{
						Kind:       "Service",
						APIVersion: "v1",
					},
					ObjectMeta: metav1.ObjectMeta{
						Name:      instance.Name,
						Namespace: instance.Namespace,
					},
				}
				command := "delete"
				omcplog.V(3).Info("Delete Service")
				_, err = r.sendSync(svc, command, cluster.Name)
				if err != nil {
					return err
				}
			}
		}
	}
	instance.Status.LastSpec = instance.Spec
	instance.Status.ClusterMaps = cluster_map
	instance.Status.ChangeNeed = false
	err := r.live.Status().Update(context.TODO(), instance)
	return err

}

var syncIndex int = 0

func (r *reconciler) sendSync(service *corev1.Service, command string, clusterName string) (string, error) {
	omcplog.V(4).Info("Function Called sendSync")
	syncIndex += 1

	s := &syncv1alpha1.Sync{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "openmcp-service-sync-" + strconv.Itoa(syncIndex),
			Namespace: "openmcp",
		},
		Spec: syncv1alpha1.SyncSpec{
			ClusterName: clusterName,
			Command:     command,
			Template:    *service,
		},
	}
	omcplog.V(5).Info("Delete Check ", s.Spec.Template.(corev1.Service).Name, s.Spec.Template.(corev1.Service).Namespace)

	err := r.live.Create(context.TODO(), s)

	if err != nil {
		omcplog.V(0).Info(err)
	}

	omcplog.V(0).Info(s.Name)
	return s.Name, err
}

func (r *reconciler) IngressNotify(osvcName, osvcNamespace string) {
	ingress_list := &resourcev1alpha1.OpenMCPIngressList{}
	r.live.List(context.TODO(), ingress_list, &client.ListOptions{Namespace: osvcNamespace})

	for _, ingressInstance := range ingress_list.Items {
		fmt.Println("Ingress:", ingressInstance.Name)
		for _, value := range ingressInstance.Spec.Template.Spec.Rules {
			for _, v := range value.HTTP.Paths {
				fmt.Println("Service In Ingress : ", v.Backend.ServiceName)
				fmt.Println("OpenMCP Service Name : ", osvcName)
				if v.Backend.ServiceName == osvcName {
					ingressInstance.Status.ChangeNeed = true
					err := r.live.Status().Update(context.TODO(), &ingressInstance)
					if err != nil {
						fmt.Println(err)
					}
				}
			}
		}
	}
}
