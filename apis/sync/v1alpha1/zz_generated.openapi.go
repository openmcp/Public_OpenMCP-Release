// +build !ignore_autogenerated

// This file was autogenerated by openapi-gen. Do not edit it manually!

package v1alpha1

import (
	spec "github.com/go-openapi/spec"
	common "k8s.io/kube-openapi/pkg/common"
)

func GetOpenAPIDefinitions(ref common.ReferenceCallback) map[string]common.OpenAPIDefinition {
	return map[string]common.OpenAPIDefinition{
		"openmcp/openmcp/apis/sync/v1alpha1.Sync":       schema_pkg_apis_sync_v1alpha1_Sync(ref),
		"openmcp/openmcp/apis/sync/v1alpha1.SyncSpec":   schema_pkg_apis_sync_v1alpha1_SyncSpec(ref),
		"openmcp/openmcp/apis/sync/v1alpha1.SyncStatus": schema_pkg_apis_sync_v1alpha1_SyncStatus(ref),
	}
}

func schema_pkg_apis_sync_v1alpha1_Sync(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Description: "Sync is the Schema for the syncs API",
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Ref: ref("k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"),
						},
					},
					"spec": {
						SchemaProps: spec.SchemaProps{
							Ref: ref("multicluster-controller/controller/sync-controller/pkg/apis/sync/v1alpha1.SyncSpec"),
						},
					},
					"status": {
						SchemaProps: spec.SchemaProps{
							Ref: ref("multicluster-controller/controller/sync-controller/pkg/apis/sync/v1alpha1.SyncStatus"),
						},
					},
				},
			},
		},
		Dependencies: []string{
			"k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta", "multicluster-controller/controller/sync-controller/pkg/apis/sync/v1alpha1.SyncSpec", "multicluster-controller/controller/sync-controller/pkg/apis/sync/v1alpha1.SyncStatus"},
	}
}

func schema_pkg_apis_sync_v1alpha1_SyncSpec(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Description: "SyncSpec defines the desired state of Sync",
				Properties:  map[string]spec.Schema{},
			},
		},
		Dependencies: []string{},
	}
}

func schema_pkg_apis_sync_v1alpha1_SyncStatus(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Description: "SyncStatus defines the observed state of Sync",
				Properties:  map[string]spec.Schema{},
			},
		},
		Dependencies: []string{},
	}
}
