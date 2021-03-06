package influx

import (
	"openmcp/openmcp/omcplog"
	"os"

	"github.com/influxdata/influxdb/client/v2"
)

type Influx struct {
	inClient client.Client
}

func ClearInfluxDB(clusterName string) error {
	INFLUX_IP := os.Getenv("INFLUX_IP")
	INFLUX_PORT := os.Getenv("INFLUX_PORT")
	INFLUX_USERNAME := os.Getenv("INFLUX_USERNAME")
	INFLUX_PASSWORD := os.Getenv("INFLUX_PASSWORD")

	if len(INFLUX_IP) != 0 && len(INFLUX_PORT) != 0 && len(INFLUX_USERNAME) != 0 && len(INFLUX_PASSWORD) != 0 {
		inf := NewInflux(INFLUX_IP, INFLUX_PORT, INFLUX_USERNAME, INFLUX_PASSWORD)

		err := inf.DeleteAllCluster(clusterName)
		if err != nil {
			omcplog.V(4).Info("ClearInfluxDB ERROR : ", err)
		}

		return err
	}else {
		omcplog.V(0).Info("!! error : http: no Value in request URL")
	}

	return nil
}
func NewInflux(INFLUX_IP, INFLUX_PORT, username, password string) *Influx {
	omcplog.V(4).Info("Func NewInflux Called")
	inf := &Influx{
		inClient: InfluxDBClient(INFLUX_IP, INFLUX_PORT, username, password),
	}
	return inf
}
func InfluxDBClient(INFLUX_IP, INFLUX_PORT, username, password string) client.Client {
	omcplog.V(4).Info("Func InfluxDBClient Called")
	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr:     "http://" + INFLUX_IP + ":" + INFLUX_PORT,
		Username: username,
		Password: password,
	})
	if err != nil {
		omcplog.V(0).Info("Error: ", err)
	}
	return c
}

func (in *Influx) DeleteAllCluster(clusterName string) error {
	omcplog.V(4).Info("Func DeleteAllCluster Called")

	//q := client.Query{}
	q := client.NewQuery("DELETE FROM Pods WHERE cluster = '"+clusterName+"'", "Metrics", "")
	response, err := in.inClient.Query(q)

	if err != nil && response.Error() != nil {
		omcplog.V(0).Info("!! err: ", err)
		omcplog.V(0).Info("!! response.Error(): ", response.Error())
		//return response.Error()
	}

	q2 := client.NewQuery("DELETE FROM Nodes WHERE cluster = '"+clusterName+"'", "Metrics", "")
	response2, err := in.inClient.Query(q2)

	if err != nil && response2.Error() != nil {
		omcplog.V(0).Info("!! err: ", err)
		omcplog.V(0).Info("!! response.Error(): ", response2.Error())
		//return response2.Error()
	}

	return nil

}
