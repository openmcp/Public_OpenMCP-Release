package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// OpenMCPDomain
// +k8s:openapi-gen=true
// +kubebuilder:resource:path=openmcpdomains
type OpenMCPDomain struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	// Domain is the DNS zone associated with the OpenMCP control plane
	Domain string `json:"domain"`
	// NameServer is the authoritative DNS name server for the OpenMCP domain
	NameServer string `json:"nameServer,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object
// OpenMCPDomainList contains a list of OpenMCPDomain
type OpenMCPDomainList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []OpenMCPDomain `json:"items"`
}
