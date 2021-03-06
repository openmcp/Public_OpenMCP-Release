package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Targets is a representation of a list of targets for an endpoint.
type Targets []string

// TTL is a structure defining the TTL of a DNS record
type TTL int64

// Labels store metadata related to the endpoint
// it is then stored in a persistent storage via serialization
type Labels map[string]string

// Endpoint is a high-level association between a service and an IP.
type Endpoint struct {
	// The FQDN of the DNS record.
	DNSName string `json:"dnsName,omitempty"`
	// The targets that the DNS record points to.
	Targets Targets `json:"targets,omitempty"`
	// RecordType type of record, e.g. CNAME, A, SRV, TXT etc.
	RecordType string `json:"recordType,omitempty"`
	// TTL for the record in seconds.
	RecordTTL TTL `json:"recordTTL,omitempty"`
	// Labels stores labels defined for the Endpoint.
	// +optional
	Labels Labels `json:"labels,omitempty"`
}

// OpenMCPDNSEndpointSpec defines the desired state of DNSEndpoint
type OpenMCPDNSEndpointSpec struct {
	Endpoints []*Endpoint `json:"endpoints,omitempty"`
	Domains   []string    `json:"domain,omitempty"`
}

// DNSEndpointStatus defines the observed state of DNSEndpoint
type OpenMCPDNSEndpointStatus struct {
	// ObservedGeneration is the generation as observed by the controller consuming the DNSEndpoint.
	// +optional
	ObservedGeneration int64 `json:"observedGeneration,omitempty"`
}

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// OpenMCPDNSEndpoint is the CRD wrapper for Endpoint which is designed to act as a
// source of truth for external-dns.
//
// +k8s:openapi-gen=true
// +kubebuilder:resource:path=openmcpdnsendpoints
// +kubebuilder:subresource:status
type OpenMCPDNSEndpoint struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   OpenMCPDNSEndpointSpec   `json:"spec,omitempty"`
	Status OpenMCPDNSEndpointStatus `json:"status,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// OpenMCPDNSEndpointList contains a list of OpenMCPDNSEndpoint
type OpenMCPDNSEndpointList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []OpenMCPDNSEndpoint `json:"items"`
}
