package cache

import (
	"context"
	"encoding/json"
	"openmcp/openmcp/apis"
	v1alpha1 "openmcp/openmcp/apis/cache/v1alpha1"
	clusterv1alpha1 "openmcp/openmcp/apis/cluster/v1alpha1"
	"openmcp/openmcp/omcplog"
	"openmcp/openmcp/util/clusterManager"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"time"

	"k8s.io/apimachinery/pkg/api/errors"

	nodeapi "openmcp/openmcp/openmcp-cache/pkg/run/dist"

	"admiralty.io/multicluster-controller/pkg/cluster"
	"admiralty.io/multicluster-controller/pkg/controller"
	"admiralty.io/multicluster-controller/pkg/reconcile"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

var cm *clusterManager.ClusterManager

func NewController(live *cluster.Cluster, ghosts []*cluster.Cluster, ghostNamespace string, myClusterManager *clusterManager.ClusterManager) (*controller.Controller, error) {
	cm = myClusterManager
	omcplog.V(1).Info("NewController start")
	liveclient, err := live.GetDelegatingClient()
	if err != nil {
		omcplog.Error("getting delegating client for live cluster: ", err)
		return nil, err
	}
	//imagelist := make(map[string]int)
	ghostclients := []client.Client{}
	for _, ghost := range ghosts {
		ghostclient, err := ghost.GetDelegatingClient()
		if err != nil {
			omcplog.Error("getting delegating client for ghost cluster: ", err)
			return nil, err
		}

		// listClient := *cm.Cluster_kubeClients[ghost.Name]
		// pods, _ := listClient.CoreV1().Pods("").List(context.TODO(), metav1.ListOptions{})
		// for i, item := range pods.Items {
		// 	omcplog.V(1).Info(item.Spec.NodeName)
		// 	omcplog.V(1).Info("--------- ", i)
		// 	for j, container := range item.Spec.Containers {
		// 		imagename := strings.Split(container.Image, ":")
		// 		omcplog.V(1).Info(j, "-----", imagename)
		// 		_, ok := imagelist[imagename[0]]
		// 		if ok {
		// 			imagelist[imagename[0]] += 1
		// 		} else {
		// 			imagelist[imagename[0]] = 1
		// 		}
		// 	}
		// }
		ghostclients = append(ghostclients, ghostclient)

	}
	co := controller.New(&reconciler{live: liveclient, ghosts: ghostclients, ghostNamespace: ghostNamespace}, controller.Options{})

	if err := apis.AddToScheme(live.GetScheme()); err != nil {
		omcplog.Error("adding APIs to live cluster's scheme: ", err)
		return nil, err
	}
	if err := co.WatchResourceReconcileObject(context.TODO(), live, &v1alpha1.Cache{}, controller.WatchOptions{}); err != nil {
		omcplog.Error("setting up Pod watch in live cluster: ", err)
		return nil, err
	}
	omcplog.V(1).Info("NewController end")
	return co, nil
}

type reconciler struct {
	live           client.Client
	ghosts         []client.Client
	ghostNamespace string
}

type imageInfo struct {
	clusterName  string
	nodeName     string
	imageName    string
	imageVersion string
}

// Reconcile reads that state of the cluster for a GlobalRegistry object and makes changes based on the state read
// and what is in the GlobalRegistry.Spec
// TODO(user): Modify this Reconcile function to implement your Controller logic.  This example creates
// a Pod as an example
// Note:
// The Controller will requeue the Request to be processed again if the returned error is non-nil or
// Result.Requeue is true, otherwise upon completion it will remove the work from the queue.
func (r *reconciler) Reconcile(req reconcile.Request) (reconcile.Result, error) {
	omcplog.V(0).Info("Function Called Reconcile")

	instance := &v1alpha1.Cache{}
	err := r.live.Get(context.TODO(), req.NamespacedName, instance)
	if err != nil {
		omcplog.Error("get instance error")
		r.MakeStatus(instance, false, "", err)
		r.Sleep("10")
		omcplog.V(0).Info("Requeue...")
		return reconcile.Result{Requeue: true}, nil
	}
	if instance.Status.Succeeded == true {
		omcplog.V(1).Info(instance.Name + " running... start")
		// r.Sleep(instance.Spec.Timer)
		// omcplog.V(0).Info("Requeue...")
		// return reconcile.Result{Requeue: true}, nil
	}
	if instance.Status.Succeeded == false && instance.Status.Reason != "" {
		// 이미 실패한 케이스는 로직을 다시 안탄다. - 캐시는 타야함.
		omcplog.V(1).Info(instance.Name + " already failed... start")
		// r.Sleep(instance.Spec.Timer)
		// omcplog.V(0).Info("Requeue...")
		// return reconcile.Result{Requeue: true}, nil
	}

	r.Run(instance)
	omcplog.V(1).Info("end")

	r.Sleep(instance.Spec.Timer)
	omcplog.V(0).Info("Requeue...")
	return reconcile.Result{Requeue: true}, nil
}

func (r *reconciler) Sleep(timer string) {
	omcplog.V(1).Info("sleep ", timer, " min")
	ti, err := strconv.ParseInt(timer, 10, 64)
	if err != nil {
		omcplog.Error("Timer error")
	}
	time.Sleep(time.Duration(ti) * time.Minute)
	// time.Sleep(time.Duration(10) * time.Second)
}

func getIsSkip(exceptList []string, targetName string) bool {
	for _, exceptName := range exceptList {
		if targetName == exceptName {
			return true
		}
	}
	return false
}

type kv struct {
	Key   string
	Value int
}

func sortValue(m map[string]int) []kv {
	var ss []kv
	for k, v := range m {
		ss = append(ss, kv{k, v})
	}
	sort.Slice(ss, func(i, j int) bool {
		return ss[i].Value > ss[j].Value
	})
	return ss
}

func (r *reconciler) Run(instance *v1alpha1.Cache) (bool, error) {
	omcplog.V(1).Info("start cache co.")
	var registryManager nodeapi.RegistryManager
	clusternamelist := []string{}
	clusterInstanceList := &clusterv1alpha1.OpenMCPClusterList{}
	err := r.live.List(context.TODO(), clusterInstanceList, &client.ListOptions{})
	if err != nil {
		if errors.IsNotFound(err) {
			//r.DeleteOpenMCPCluster(cm, request.Namespace, request.Name)
			return true, nil
		}
		return false, err
	}
	for _, item := range clusterInstanceList.Items {
		if item.Spec.JoinStatus == "JOIN" {
			clusternamelist = append(clusternamelist, item.Name)
		}
	}

	// 1. 모든 클러스터의 pods들을 검색하여 전체 이미지 목록 및 카운터를 추출하는 함수.
	// imageList : 모든 ImageList
	// imageCount : ImageList 와 매핑되는 Image Count 값.
	omcplog.V(1).Info("#############################")
	omcplog.V(1).Info("# 1. imageList 추출         #")
	omcplog.V(1).Info("#############################")
	imageList := make(map[string]imageInfo)
	imageCount := make(map[string]int)
	//cluster 8번, 19번 이슈.
	exceptClusters := []string{"cluster011", "cluster021", "cluster031", "cluster041", "cluster051", "cluster061", "cluster071", "cluster081", "cluster09", "cluster10", "cluster11", "cluster12", "cluster13", "cluster14", "cluster15", "cluster16", "cluster17", "cluster18", "cluster19"}
	exceptNamespace := []string{"istio-system", "openmcp", "kube-system", "metallb-system", "custom-metrics", "ingress-nginx"}
	addCount := 3

	for _, clientName := range clusternamelist {
		// 예외처리한 Cluster 제외.
		isSkip := getIsSkip(exceptClusters, clientName)
		if isSkip {
			omcplog.V(4).Info("-----except Cluster : ", clientName)
			continue
		} else {
			omcplog.V(1).Info("-----clientName : ", clientName)
		}

		//kubernetes 접속 객체가 nil인 경우를 skip하기위한 코드.
		if cm == nil {
			omcplog.Error("cm is nil")
			continue
		}
		if cm.Cluster_kubeClients == nil {
			omcplog.Error("cluster_kubeClients is nil")
			continue
		}
		if cm.Cluster_kubeClients[clientName] == nil {
			omcplog.Error("------------------")
			omcplog.Error(clientName, " client is nil !!!!!!!!!!!!!!!!!.. continue")
			omcplog.Error(cm.Cluster_kubeClients)
			omcplog.Error("------------------")
			continue
		}

		// # pods에 clientName 에 해당하는 모든 pods 정보 추출.
		listClient := *cm.Cluster_kubeClients[clientName]                                  // list Client 객체에 client 접속 정보 중 단일 정보를 저장
		pods, _ := listClient.CoreV1().Pods("").List(context.TODO(), metav1.ListOptions{}) //pods 에는 모든 pods List가 추출됨.

		// SetNodeLabelSync 실행
		err = registryManager.Init(clientName, cm)
		if err != nil {
			omcplog.Error(clientName, "**** node 지정이 불가능한 cluster 입니다. Image Cache 대상에서 제외합니다.")
			isDupl := false
			for _, name := range exceptClusters {
				if clientName == name {
					isDupl = true
				}
			}
			if !isDupl {
				exceptClusters = append(exceptClusters, clientName)
			}
			continue
		}
		registryManager.SetNodeLabelSync()
		// SetNodeLabelSync 실행 종료

		// registryManager.DeleteJob 실행
		err := registryManager.DeleteJob()
		if err != nil {
			r.MakeStatusWithSource(instance, false, instance.Spec, err, err)
			return false, err
		}
		// registryManager.DeleteJob 실행 완료

		// # pods 를 순회하며 컨테이너의 이미지 정보를 추출함
		// imageList 객체에 정보 저장.
		for _, item := range pods.Items {

			isSkip := getIsSkip(exceptNamespace, item.Namespace)
			if isSkip {
				omcplog.V(4).Info("-----except Namespace pod : ", item.Namespace, ".", item.Name)
				continue
			} else {
				omcplog.V(2).Info("-----pod : ", item.Namespace, ".", item.Name)
			}
			//omcplog.V(1).Info(item.Spec.NodeName)
			for _, container := range item.Spec.Containers {
				//imagefullname := strings.Split(container.Image, ":")
				//imagename := imagefullname[0]
				imagename := container.Image
				//omcplog.V(1).Info("imageFullname : ", container.Image)

				//imageFullname : ketidevit2/cluster-metric-collector:v0.0.1
				if imagename == "docker" {
					continue
				}
				imagename = strings.Replace(imagename, "docker.io/", "", -1)
				//omcplog.V(1).Info("image name : ", imagename)
				//image name : ketidevit2/cluster-metric-collector
				imageversion := "1"
				imageinfo := imageInfo{}
				imageinfo.clusterName = clientName
				imageinfo.nodeName = item.Spec.NodeName
				imageinfo.imageName = imagename
				imageinfo.imageVersion = imageversion
				_, ok := imageCount[imagename]
				if ok {
					imageCount[imagename] += addCount
				} else {
					imageCount[imagename] = addCount
					imageList[imagename] = imageinfo
				}
				//wordpress 가중치 부여
				if strings.Index(imagename, "wordpress") >= 0 {
					if imageCount[imagename] < 20 {
						omcplog.V(1).Info("-----weight +15")
						imageCount[imagename] += 15
					}
				}
			}
		}
		omcplog.V(1).Info("imageList Length : ", len(imageList))
	}

	// 2. 추출된 ImageList 중 상위 5개의 이미지를 Push
	omcplog.V(1).Info("#############################")
	omcplog.V(1).Info("# 2. 상위 이미지를 업로드    #")
	omcplog.V(1).Info("#############################")
	cachecount := instance.Spec.CacheCount
	sortedImageList := sortValue(imageCount)
	for _, item := range sortedImageList[:cachecount] {
		imagename := item.Key
		imageInfo := imageList[imagename]
		omcplog.V(1).Info("##### imagecache select image : ", imageInfo)
		err = registryManager.Init(imageInfo.clusterName, cm)
		if err != nil {
			r.MakeStatusWithSource(instance, false, instance.Spec, err, err)
			return false, err
		}
		// registryManager.SetNodeLabelSync()
		err := registryManager.CreatePushJob(imageInfo.nodeName, item.Key)
		if err != nil {
			r.MakeStatusWithSource(instance, false, instance.Spec, err, err)
			return false, err
		}
	}
	omcplog.V(1).Info("image push job complete!")

	// 3. 추출된 ImageList 중 상위 5개의 이미지를 다른 노드에 업로드
	omcplog.V(1).Info("#############################")
	omcplog.V(1).Info("# 3. 타 노드에 전송          #")
	omcplog.V(1).Info("#############################")
	for _, pullList := range clusternamelist {
		// 예외처리한 Cluster 제외.
		isSkip := getIsSkip(exceptClusters, pullList)
		if isSkip {
			omcplog.V(4).Info("-----except Cluster : ", pullList)
			continue
		} else {
			omcplog.V(2).Info("-----clientName : ", pullList)
		}

		if cm == nil {
			omcplog.Error("cm is nil")
			continue
		}
		if cm.Cluster_kubeClients == nil {
			omcplog.Error("cluster_kubeClients is nil")
			continue
		}
		if cm.Cluster_kubeClients[pullList] == nil {
			omcplog.Error("------------------")
			omcplog.Error(pullList, " client is nil !!!!!!!!!!!!!!!!!....continue")
			omcplog.Error(cm.Cluster_kubeClients)
			omcplog.Error("------------------")
			continue
		}
		listClient := *cm.Cluster_kubeClients[pullList]
		err = registryManager.Init(pullList, cm)
		if err != nil {
			r.MakeStatusWithSource(instance, false, instance.Spec, err, err)
			return false, err
		}
		nodelist, _ := listClient.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
		for _, item := range nodelist.Items {
			omcplog.V(3).Info("nodename : ", item.Name)
			for _, image := range sortedImageList[:cachecount] {
				err = registryManager.CreatePullJob(item.Name, image.Key)
				if err != nil {
					r.MakeStatusWithSource(instance, false, instance.Spec, err, err)
					return false, err
				}
			}
		}
		//err := registryManager.DeleteJob()
		//if err != nil {
		//	r.MakeStatusWithSource(instance, false, instance.Spec, err, err)
		//	return false, err
		//}
	}
	omcplog.V(1).Info("image pull job complete!")

	// 4. 이미지 정보 update
	omcplog.V(1).Info("#############################")
	omcplog.V(1).Info("# 4. 이미지 정보 업데이트     #")
	omcplog.V(1).Info("#############################")
	data := v1alpha1.Data{}
	cacheimagelist := v1alpha1.Data{}

	for _, item := range sortedImageList[:cachecount] {
		imageinfo := v1alpha1.ImageInfo{
			ImageName:  item.Key,
			ImageCount: int64(item.Value),
		}
		data.ImageList = append(data.ImageList, imageinfo)
	}
	data.Timestamp = time.Now().Local().Format("2006-01-02 15:04:05")
	if instance.Status.History != nil {
		cacheimagelist = instance.Status.History[len(instance.Status.History)-1]
	} else {
		cacheimagelist = data
	}
	instance.Status.History = append(instance.Status.History, data)

	if instance.Status.UpdateList == nil {
		for _, item := range cacheimagelist.ImageList {
			updatedata := v1alpha1.UpdateData{}
			updatedata.ImageName = item.ImageName
			updatedata.ImageStatus = "up"
			updatedata.Timestamp = data.Timestamp
			instance.Status.UpdateList = append(instance.Status.UpdateList, updatedata)
			omcplog.V(1).Info("init list : ", updatedata)
		}
	} else {
		if reflect.DeepEqual(cacheimagelist.ImageList, data.ImageList) != true {
			for _, item := range data.ImageList {
				result := Has(item.ImageName, cacheimagelist)
				if result == false {
					updatedata := v1alpha1.UpdateData{}
					updatedata.ImageName = item.ImageName
					updatedata.ImageStatus = "up"
					updatedata.Timestamp = data.Timestamp
					instance.Status.UpdateList = append(instance.Status.UpdateList, updatedata)
					omcplog.V(1).Info("up list : ", updatedata)
				}
			}
			for _, item := range cacheimagelist.ImageList {
				result := Has(item.ImageName, data)
				if result == false {
					updatedata := v1alpha1.UpdateData{}
					updatedata.ImageName = item.ImageName
					updatedata.ImageStatus = "down"
					updatedata.Timestamp = data.Timestamp
					instance.Status.UpdateList = append(instance.Status.UpdateList, updatedata)
					omcplog.V(1).Info("down list : ", updatedata)
				}
			}
		}
	}

	HISTORY_MAX_LENGTH := 5
	if len(instance.Status.History) > HISTORY_MAX_LENGTH {
		maxIndex := len(instance.Status.History) - 1
		instance.Status.History = instance.Status.History[maxIndex-HISTORY_MAX_LENGTH : maxIndex]
	}

	UPDATE_MAX_LENGTH := 20
	if len(instance.Status.UpdateList) > UPDATE_MAX_LENGTH {
		maxIndex := len(instance.Status.UpdateList) - 1
		instance.Status.UpdateList = instance.Status.UpdateList[maxIndex-UPDATE_MAX_LENGTH : maxIndex]
	}

	// tmpHistoryList := []v1alpha1.Data{}
	// for i := MAX_LENGTH; i > 0; i++ {
	// 	idx := len(instance.Status.History) - MAX_LENGTH
	// 	history := instance.Status.History[idx-i]
	// 	append(tmpHistoryList, history)
	// }

	// tmpUpdateList := []v1alpha1.UpdateData{}
	// for i := 0; i < MAX_LENGTH; i++ {
	// 	idx := len(instance.Status.UpdateList) - MAX_LENGTH
	// 	update := instance.Status.UpdateList[idx-i]
	// 	append(tmpUpdateList, v1alpha1.UpdateData{})
	// 	append(tmpUpdateList, update)
	// }
	// instance.Status.UpdateList = tmpUpdateList

	r.MakeStatusWithSource(instance, true, instance.Spec, nil, nil)
	// push, pull - nodeName 이 없을 경우 Cluster 단위 명령
	return true, nil
}
func Has(a string, list v1alpha1.Data) bool {
	for _, b := range list.ImageList {
		if b.ImageName == a {
			return true
		}
	}
	return false
}

func (r *reconciler) MakeStatusWithSource(instance *v1alpha1.Cache, CacheStatus bool, CacheSpec v1alpha1.CacheSpec, err error, detailErr error) {
	r.makeStatusRun(instance, CacheStatus, CacheSpec, "", err, detailErr)
}

func (r *reconciler) MakeStatus(instance *v1alpha1.Cache, CacheStatus bool, elapsed string, err error) {
	r.makeStatusRun(instance, CacheStatus, v1alpha1.CacheSpec{}, elapsed, err, nil)
}

func (r *reconciler) makeStatusRun(instance *v1alpha1.Cache, CacheStatus bool, CacheSpec v1alpha1.CacheSpec, elapsedTime string, err error, detailErr error) {
	instance.Status.Succeeded = CacheStatus

	if elapsedTime == "" {
		elapsedTime = "0"
	}

	omcplog.V(1).Info("CacheStatus : ", CacheStatus)

	if !CacheStatus {
		omcplog.Error("CacheStatus is not nil ... err : ", err.Error())
		tmp := make(map[string]interface{})

		//tmp["ResourceType"] = snapshotSource.ResourceType
		//tmp["ResourceName"] = snapshotSource.ResourceName
		//tmp["VolumeSnapshotClassName"] = snapshotSource.VolumeDataSource.VolumeSnapshotClassName
		//tmp["VolumeSnapshotSourceKind"] = snapshotSource.VolumeDataSource.VolumeSnapshotSourceKind
		//tmp["VolumeSnapshotSourceName"] = snapshotSource.VolumeDataSource.VolumeSnapshotSourceName
		//tmp["VolumeSnapshotKey"] = instance.Status.VolumeDataSource.VolumeSnapshotKey
		tmp["Reason"] = err.Error()
		//tmp["ReasonDetail"] = detailErr.Error()

		jsonTmp, err := json.Marshal(tmp)
		if err != nil {
			omcplog.Error(err, "  json.Marshal Error-----------")
		}
		instance.Status.Reason = string(jsonTmp)
		if detailErr != nil {
			instance.Status.Reason = detailErr.Error()
		}
	}
	omcplog.V(1).Info("history log : ", instance.Status.History)
	omcplog.V(1).Info("UpdateList log : ", instance.Status.UpdateList)
	//r.live.Update(context.TODO(), instance)
	//r.live.Status().Patch(context.TODO(), instance)
	//r.live.Status().Update(context.TODO(), instance)
	//err = r.live.Status().Update(context.TODO(), instance)
	omcplog.V(1).Info("live Status update")
	err = r.live.Status().Update(context.TODO(), instance)
	if err != nil {
		omcplog.Error(err, "live Statue Update Error -----------")
	}
	omcplog.V(1).Info("live update")
	err = r.live.Update(context.TODO(), instance)
	if err != nil {
		omcplog.Error(err, "live Update Error -----------")
	}
	omcplog.V(1).Info("live update end")
}
