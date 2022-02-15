package httphandler

import (
	"net/http"
	"openmcp/openmcp/util/clusterManager"
)

type HttpManager struct {
	HTTPServer_IP   string
	HTTPServer_PORT string
	ClusterManager  *clusterManager.ClusterManager
	Client          *http.Client
}
