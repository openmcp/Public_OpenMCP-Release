CREATE EXTENSION "uuid-ossp"; -- uuid_generate_v4()를 사용하기 위함

--==================================================================================
-- tb_account_role
--==================================================================================
CREATE TABLE IF NOT EXISTS public.tb_account_role
(
    role_id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    role_name character varying(100) COLLATE pg_catalog."default",
    description character varying(200) COLLATE pg_catalog."default",
    CONSTRAINT tb_account_roles_pkey PRIMARY KEY (role_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_account_role
    OWNER to postgres;

--==================================================================================
--tb_accounts
--==================================================================================
CREATE TABLE IF NOT EXISTS public.tb_accounts
(
    user_id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    user_password character varying COLLATE pg_catalog."default",
    role_id character varying(50)[] COLLATE pg_catalog."default",
    created_time timestamp(6) without time zone,
    last_login_time timestamp(6) without time zone,
    projects character varying[] COLLATE pg_catalog."default",
    uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
    CONSTRAINT tb_accounts_pkey PRIMARY KEY (user_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.tb_accounts
    OWNER to postgres;

--==================================================================================
--tb_codes
--==================================================================================
CREATE TABLE IF NOT EXISTS public.tb_codes
(
    kinds character varying(20) COLLATE pg_catalog."default",
    code character varying(20) COLLATE pg_catalog."default" NOT NULL,
    description character varying(100) COLLATE pg_catalog."default",
    etc character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT tb_codes_pkey PRIMARY KEY (code)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_codes
    OWNER to postgres;



--==================================================================================
--tb_config_aks
--==================================================================================
CREATE SEQUENCE public.tb_config_aks_seq_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.tb_config_aks_seq_seq
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.tb_config_aks
(
    seq integer NOT NULL DEFAULT nextval('tb_config_aks_seq_seq'::regclass),
    cluster character varying(200) COLLATE pg_catalog."default" NOT NULL,
    "clientId" character varying(200) COLLATE pg_catalog."default" NOT NULL,
    "clientSec" character varying(200) COLLATE pg_catalog."default" NOT NULL,
    "tenantId" character varying(200) COLLATE pg_catalog."default" NOT NULL,
    "subId" character varying(200) COLLATE pg_catalog."default" NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_config_aks
    OWNER to postgres;


--==================================================================================
--tb_config_eks
--==================================================================================
CREATE SEQUENCE public.tb_config_eks_seq_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.tb_config_eks_seq_seq
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.tb_config_eks
(
    seq integer NOT NULL DEFAULT nextval('tb_config_eks_seq_seq'::regclass),
    cluster character varying(500) COLLATE pg_catalog."default" NOT NULL,
    "accessKey" character varying(500) COLLATE pg_catalog."default" NOT NULL,
    "secretKey" character varying(500) COLLATE pg_catalog."default" NOT NULL,
    region character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT tb_config_eks_pkey PRIMARY KEY (seq)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_config_eks
    OWNER to postgres;


--==================================================================================
--tb_config_gke
--==================================================================================
CREATE SEQUENCE public.tb_config_gke_seq_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.tb_config_gke_seq_seq
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.tb_config_gke
(
    seq integer NOT NULL DEFAULT nextval('tb_config_gke_seq_seq'::regclass),
    cluster character varying(200) COLLATE pg_catalog."default" NOT NULL,
    type character varying(200) COLLATE pg_catalog."default" NOT NULL,
    "clientEmail" character varying(200) COLLATE pg_catalog."default" NOT NULL,
    "projectID" character varying(200) COLLATE pg_catalog."default" NOT NULL,
    "privateKey" character varying(3000) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tb_config_gke_pkey PRIMARY KEY (seq)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_config_gke
    OWNER to postgres;


--==================================================================================
--tb_config_kvm
--==================================================================================
CREATE SEQUENCE public.tb_config_kvm_seq_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.tb_config_kvm_seq_seq
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.tb_config_kvm
(
    seq integer NOT NULL DEFAULT nextval('tb_config_kvm_seq_seq'::regclass),
    cluster character varying COLLATE pg_catalog."default" NOT NULL,
    "agentURL" character varying COLLATE pg_catalog."default" NOT NULL,
    "mClusterName" character varying COLLATE pg_catalog."default" NOT NULL,
    "mClusterPwd" character varying COLLATE pg_catalog."default" NOT NULL,
    "agentPort" character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tb_config_kvm_pkey PRIMARY KEY (seq)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_config_kvm
    OWNER to postgres;

--==================================================================================
--tb_group_role
--==================================================================================
CREATE SEQUENCE public.tb_group_auth_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.tb_group_auth_seq
    OWNER TO postgres;
    
CREATE TABLE IF NOT EXISTS public.tb_group_role
(
    group_id integer NOT NULL DEFAULT nextval('tb_group_auth_seq'::regclass),
    group_name character varying COLLATE pg_catalog."default" NOT NULL,
    description character varying COLLATE pg_catalog."default",
    member character varying[] COLLATE pg_catalog."default",
    clusters character varying[] COLLATE pg_catalog."default",
    CONSTRAINT tb_group_role_pkey PRIMARY KEY (group_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.tb_group_role
    OWNER to postgres;

    
--==================================================================================
--tb_group_member
--==================================================================================
CREATE TABLE IF NOT EXISTS public.tb_group_member
(
    group_id integer NOT NULL,
    user_id character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tb_group_member_pkey PRIMARY KEY (group_id, user_id),
    CONSTRAINT fk_group_id FOREIGN KEY (group_id)
        REFERENCES public.tb_group_role (group_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id)
        REFERENCES public.tb_accounts (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_group_member
    OWNER to postgres;

--==================================================================================
--tb_host_threshold
--==================================================================================
CREATE TABLE IF NOT EXISTS public.tb_host_threshold
(
    node_name character varying COLLATE pg_catalog."default" NOT NULL,
    cluster_name character varying COLLATE pg_catalog."default" NOT NULL,
    cpu_warn double precision,
    cpu_danger double precision,
    ram_warn double precision,
    ram_danger double precision,
    storage_warn double precision,
    storage_danger double precision,
    created_time timestamp with time zone,
    updated_time timestamp with time zone,
    CONSTRAINT tb_host_threshold_pkey PRIMARY KEY (node_name, cluster_name)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_host_threshold
    OWNER to postgres;



--==================================================================================
--tb_portal_logs
--==================================================================================
CREATE TABLE IF NOT EXISTS public.tb_portal_logs
(
    user_id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    code character varying(20) COLLATE pg_catalog."default" NOT NULL,
    created_time timestamp(6) without time zone NOT NULL,
    CONSTRAINT tb_portal_logs_pkey PRIMARY KEY (user_id, code, created_time)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_portal_logs
    OWNER to postgres;

--==================================================================================
--tb_replica_status
--==================================================================================
CREATE TABLE IF NOT EXISTS public.tb_replica_status
(
    cluster character varying COLLATE pg_catalog."default" NOT NULL,
    pod character varying COLLATE pg_catalog."default" NOT NULL,
    status character varying(20) COLLATE pg_catalog."default",
    created_time timestamp(6) without time zone,
    CONSTRAINT tb_replica_status_pkey PRIMARY KEY (cluster, pod)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_replica_status
    OWNER to postgres;

--==================================================================================
--tb_threshold_log
--==================================================================================
CREATE TABLE IF NOT EXISTS public.tb_threshold_log
(
    cluster_name character varying COLLATE pg_catalog."default" NOT NULL,
    node_name character varying COLLATE pg_catalog."default" NOT NULL,
    created_time timestamp with time zone NOT NULL,
    status character varying COLLATE pg_catalog."default",
    message character varying COLLATE pg_catalog."default",
    resource character varying COLLATE pg_catalog."default",
    CONSTRAINT tb_threshold_log_pkey PRIMARY KEY (cluster_name, node_name, created_time)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


ALTER TABLE public.tb_threshold_log
    OWNER to postgres;


--==================================================================================
--tb_dashboard
--==================================================================================
CREATE TABLE IF NOT EXISTS public.tb_dashboard
(
    user_id character varying COLLATE pg_catalog."default" NOT NULL,
    component character varying[] COLLATE pg_catalog."default",
    CONSTRAINT tb_dashboard_pkey PRIMARY KEY (user_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.tb_dashboard
    OWNER to postgres;





--==================================================================================
--oauth_tokens
--==================================================================================


CREATE TABLE IF NOT EXISTS public.oauth_tokens
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    access_token text COLLATE pg_catalog."default" NOT NULL,
    access_token_expires_on timestamp without time zone NOT NULL,
    client_id text COLLATE pg_catalog."default" NOT NULL,
    refresh_token text COLLATE pg_catalog."default" NOT NULL,
    refresh_token_expires_on timestamp without time zone NOT NULL,
    user_id character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT oauth_tokens_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.oauth_tokens
    OWNER to postgres;


--==================================================================================
--oauth_clients
--==================================================================================
CREATE TABLE IF NOT EXISTS public.oauth_clients
(
    client_id text COLLATE pg_catalog."default" NOT NULL,
    client_secret text COLLATE pg_catalog."default" NOT NULL,
    redirect_uri text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT oauth_clients_pkey PRIMARY KEY (client_id, client_secret)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.oauth_clients
    OWNER to postgres;







--==================================================================================
--tb_policy
--==================================================================================
-- CREATE TABLE IF NOT EXISTS public.tb_policy
-- (
--     policy_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
--     policy_name character varying COLLATE pg_catalog."default",
--     rate character varying(10) COLLATE pg_catalog."default",
--     period character varying(10) COLLATE pg_catalog."default",
--     CONSTRAINT tb_policy_pkey PRIMARY KEY (policy_id)
-- )
-- WITH (
--     OIDS = FALSE
-- )
-- TABLESPACE pg_default;


-- ALTER TABLE public.tb_policy
--     OWNER to postgres;


--==================================================================================
--tb_policy_projects
--==================================================================================
-- CREATE TABLE IF NOT EXISTS public.tb_policy_projects
-- (
--     project character varying(100) COLLATE pg_catalog."default" NOT NULL,
--     cluster character varying(100) COLLATE pg_catalog."default" NOT NULL,
--     cls_cpu_trh_r numeric(100,0),
--     cls_mem_trh_r numeric(100,0),
--     pod_cpu_trh_r numeric(100,0),
--     pod_mem_trh_r numeric(100,0),
--     updated_time timestamp(6) with time zone,
--     CONSTRAINT tb_policy_projects_pkey PRIMARY KEY (project, cluster)
-- )
-- WITH (
--     OIDS = FALSE
-- )
-- TABLESPACE pg_default;


-- ALTER TABLE public.tb_policy_projects
--     OWNER to postgres;



--==============================================================================
-- apiserver_state
--==============================================================================
CREATE TABLE IF NOT EXISTS public.apiserver_state
(
    cluster_name character(30) COLLATE pg_catalog."default",
    collected_time timestamp with time zone,
    running_cnt character(30) COLLATE pg_catalog."default",
    reqests_per_sec character(50) COLLATE pg_catalog."default",
    latency character(50) COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.apiserver_state
    OWNER to postgres;

--==============================================================================
-- cluster_node_state
--==============================================================================
CREATE TABLE IF NOT EXISTS public.cluster_node_state
(
    cluster_name character(30) COLLATE pg_catalog."default",
    node_total_cnt bigint,
    node_online_cnt bigint,
    collected_time timestamp with time zone,
    node_offline_cnt bigint
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.cluster_node_state
    OWNER to postgres;

--==============================================================================
-- cluster_pod_state
--==============================================================================
CREATE TABLE IF NOT EXISTS public.cluster_pod_state
(
    cluster_name character(30) COLLATE pg_catalog."default",
    pod_total bigint,
    pod_running bigint,
    pod_abnormal bigint,
    pod_quota bigint,
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.cluster_pod_state
    OWNER to postgres;

--==============================================================================
-- cluster_service_state
--==============================================================================
CREATE TABLE IF NOT EXISTS public.cluster_service_state
(
    cluster_name character(30) COLLATE pg_catalog."default",
    service_cnt bigint,
    endpoint_cnt bigint,
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.cluster_service_state
    OWNER to postgres;


--==============================================================================
-- cluster_workload_state
--==============================================================================
CREATE TABLE IF NOT EXISTS public.cluster_workload_state
(
    cluster_name character(30) COLLATE pg_catalog."default",
    deployment_cnt bigint,
    replicaset_cnt bigint,
    statefulset_cnt bigint,
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.cluster_workload_state
    OWNER to postgres;


--==============================================================================
-- daemonset_cpu_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.daemonset_cpu_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(30) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    cpu_usage character(50) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.daemonset_cpu_usage
    OWNER to postgres;

--==============================================================================
-- daemonset_memory_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.daemonset_memory_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    mem_usage character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.daemonset_memory_usage
    OWNER to postgres;


--==============================================================================
-- daemonset_net_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.daemonset_net_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    workload_net_bytes_transmitted character(100) COLLATE pg_catalog."default",
    workload_net_bytes_received character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.daemonset_net_usage
    OWNER to postgres;

--==============================================================================
-- daemonset_replica_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.daemonset_replica_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    workload_daemonset_replica character(100) COLLATE pg_catalog."default",
    workload_daemonset_replica_available character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.daemonset_replica_usage
    OWNER to postgres;


--==============================================================================
-- deploy_cpu_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.deploy_cpu_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(30) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    cpu_usage character(50) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.deploy_cpu_usage
    OWNER to postgres;



--==============================================================================
-- deploy_memory_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.deploy_memory_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    mem_usage character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.deploy_memory_usage
    OWNER to postgres;



--==============================================================================
-- deploy_net_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.deploy_net_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    workload_net_bytes_transmitted character(100) COLLATE pg_catalog."default",
    workload_net_bytes_received character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.deploy_net_usage
    OWNER to postgres;


--==============================================================================
-- deploy_replica_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.deploy_replica_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    workload_deployment_replica_available character(100) COLLATE pg_catalog."default",
    workload_deployment_replica character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.deploy_replica_usage
    OWNER to postgres;


--==============================================================================
-- namespace_pod_state
--==============================================================================
CREATE TABLE IF NOT EXISTS public.namespace_pod_state
(
    cluster_name character(30) COLLATE pg_catalog."default",
    namespace_name character(30) COLLATE pg_catalog."default",
    pod_total bigint,
    pod_running bigint,
    pod_abnormal bigint,
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.namespace_pod_state
    OWNER to postgres;


--==============================================================================
-- namespace_resources
--==============================================================================
CREATE TABLE IF NOT EXISTS public.namespace_resources
(
    cluster_name character(30) COLLATE pg_catalog."default",
    namespace_name character(30) COLLATE pg_catalog."default",
    collected_time timestamp with time zone,
    cpu_usage character(50) COLLATE pg_catalog."default",
    memory_usage character(50) COLLATE pg_catalog."default",
    n_tx character(50) COLLATE pg_catalog."default",
    n_rx character(50) COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.namespace_resources
    OWNER to postgres;


--==============================================================================
-- namespace_service_state
--==============================================================================
CREATE TABLE IF NOT EXISTS public.namespace_service_state
(
    cluster_name character(30) COLLATE pg_catalog."default",
    namespace_name character(30) COLLATE pg_catalog."default",
    service_cnt bigint,
    endpoint_cnt bigint,
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.namespace_service_state
    OWNER to postgres;



--==============================================================================
-- namespace_volume_state
--==============================================================================
CREATE TABLE IF NOT EXISTS public.namespace_volume_state
(
    cluster_name character(30) COLLATE pg_catalog."default",
    namespace_name character(30) COLLATE pg_catalog."default",
    pvc_cnt bigint,
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.namespace_volume_state
    OWNER to postgres;


--==============================================================================
-- namespace_workload_state
--==============================================================================
CREATE TABLE IF NOT EXISTS public.namespace_workload_state
(
    cluster_name character(30) COLLATE pg_catalog."default",
    namespace_name character(30) COLLATE pg_catalog."default",
    deployment_cnt bigint,
    replicaset_cnt bigint,
    statefulset_cnt bigint,
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.namespace_workload_state
    OWNER to postgres;

--==============================================================================
-- node_cpu_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.node_cpu_usage
(
    cluster_name character(30) COLLATE pg_catalog."default",
    node_name character(30) COLLATE pg_catalog."default",
    collected_time timestamp with time zone,
    total_cpu_cnt bigint,
    avg1m double precision
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.node_cpu_usage
    OWNER to postgres;



--==============================================================================
-- node_disk_usage
--==============================================================================

CREATE TABLE IF NOT EXISTS public.node_disk_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    node_name character(100) COLLATE pg_catalog."default",
    node_disk_read_iops character(100) COLLATE pg_catalog."default",
    node_disk_write_iops character(100) COLLATE pg_catalog."default",
    node_disk_read_throughput character(100) COLLATE pg_catalog."default",
    node_disk_write_throughput character(100) COLLATE pg_catalog."default",
    node_disk_size_capacity character(100) COLLATE pg_catalog."default",
    node_disk_size_available character(100) COLLATE pg_catalog."default",
    node_disk_size_usage character(100) COLLATE pg_catalog."default",
    node_disk_size_utilisation character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.node_disk_usage
    OWNER to postgres;


--==============================================================================
-- node_memory_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.node_memory_usage
(
    cluster_name character(30) COLLATE pg_catalog."default",
    node_name character(30) COLLATE pg_catalog."default",
    collected_time timestamp with time zone,
    node_memory_available character(50) COLLATE pg_catalog."default",
    node_memory_utilisation character(50) COLLATE pg_catalog."default",
    node_memory_total character(50) COLLATE pg_catalog."default",
    node_memory_usage_wo_cache character(50) COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.node_memory_usage
    OWNER to postgres;


--==============================================================================
-- node_net_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.node_net_usage
(
    cluster_name character(30) COLLATE pg_catalog."default",
    node_name character(30) COLLATE pg_catalog."default",
    collected_time timestamp with time zone,
    node_net_utilisation character(50) COLLATE pg_catalog."default",
    node_net_bytes_transmitted character(50) COLLATE pg_catalog."default",
    node_net_bytes_received character(50) COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.node_net_usage
    OWNER to postgres;


--==============================================================================
-- node_pod_state
--==============================================================================
CREATE TABLE IF NOT EXISTS public.node_pod_state
(
    cluster_name character(100) COLLATE pg_catalog."default",
    node_name character(100) COLLATE pg_catalog."default",
    node_pod_count character(100) COLLATE pg_catalog."default",
    node_pod_quota character(100) COLLATE pg_catalog."default",
    node_pod_running_count character(100) COLLATE pg_catalog."default",
    node_pod_succeeded_count character(100) COLLATE pg_catalog."default",
    node_pod_abnormal_count character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.node_pod_state
    OWNER to postgres;



--==============================================================================
-- node_power_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.node_power_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    node_name character(100) COLLATE pg_catalog."default",
    power double precision,
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.node_power_usage
    OWNER to postgres;



--==============================================================================
-- node_workload_prediction
--==============================================================================
CREATE TABLE IF NOT EXISTS public.node_workload_prediction
(
    cluster character(100) COLLATE pg_catalog."default",
    node character(150) COLLATE pg_catalog."default",
    cpu double precision,
    memory double precision,
    collected_time timestamp without time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.node_workload_prediction
    OWNER to postgres;



--==============================================================================
-- nodeuptime
--==============================================================================
CREATE TABLE IF NOT EXISTS public.nodeuptime
(
    node_name character(100) COLLATE pg_catalog."default",
    last_boot_time timestamp with time zone,
    collect_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.nodeuptime
    OWNER to postgres;



--==============================================================================
-- pod_cpu_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.pod_cpu_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    node_name character(100) COLLATE pg_catalog."default",
    owner_name character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    pod character(100) COLLATE pg_catalog."default",
    cpu_usage character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.pod_cpu_usage
    OWNER to postgres;



--==============================================================================
-- pod_memory_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.pod_memory_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    node_name character(100) COLLATE pg_catalog."default",
    owner_name character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    pod character(100) COLLATE pg_catalog."default",
    mem_usage character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.pod_memory_usage
    OWNER to postgres;



--==============================================================================
-- pod_net_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.pod_net_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    node_name character(100) COLLATE pg_catalog."default",
    owner_name character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    pod character(100) COLLATE pg_catalog."default",
    pod_net_bytes_transmitted character(100) COLLATE pg_catalog."default",
    pod_net_bytes_received character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.pod_net_usage
    OWNER to postgres;




--==============================================================================
-- pod_workload_prediction
--==============================================================================
CREATE TABLE IF NOT EXISTS public.pod_workload_prediction
(
    cluster character(100) COLLATE pg_catalog."default",
    node character(150) COLLATE pg_catalog."default",
    pod character(150) COLLATE pg_catalog."default",
    cpu double precision,
    memory double precision,
    collected_time timestamp without time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.pod_workload_prediction
    OWNER to postgres;





--==============================================================================
-- readynode
--==============================================================================
CREATE SEQUENCE public."ready-node_id_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public."ready-node_id_seq"
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.readynode
(
    id integer NOT NULL DEFAULT nextval('"ready-node_id_seq"'::regclass),
    node_nm character(300) COLLATE pg_catalog."default",
    cluster_nm character(300) COLLATE pg_catalog."default",
    ip_addr character(300) COLLATE pg_catalog."default",
    provider character(300) COLLATE pg_catalog."default",
    status character(100) COLLATE pg_catalog."default",
    CONSTRAINT "ready-node_pkey" PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.readynode
    OWNER to postgres;
-- Index: unique_cluster_node

-- DROP INDEX public.unique_cluster_node;

CREATE UNIQUE INDEX unique_cluster_node
    ON public.readynode USING btree
    (cluster_nm COLLATE pg_catalog."default" ASC NULLS LAST, node_nm COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE COALESCE(cluster_nm, node_nm) IS NOT NULL;


--==============================================================================
-- statefulset_cpu_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.statefulset_cpu_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(30) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    cpu_usage character(50) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.statefulset_cpu_usage
    OWNER to postgres;


    
--==============================================================================
-- statefulset_memory_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.statefulset_memory_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    mem_usage character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.statefulset_memory_usage
    OWNER to postgres;
--==============================================================================
-- statefulset_net_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.statefulset_net_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    workload_net_bytes_transmitted character(100) COLLATE pg_catalog."default",
    workload_net_bytes_received character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.statefulset_net_usage
    OWNER to postgres;


--==============================================================================
-- statefulset_replica_usage
--==============================================================================
CREATE TABLE IF NOT EXISTS public.statefulset_replica_usage
(
    cluster_name character(100) COLLATE pg_catalog."default",
    namespace character(100) COLLATE pg_catalog."default",
    owner_kind character(100) COLLATE pg_catalog."default",
    workload character(100) COLLATE pg_catalog."default",
    workload_statefulset_replica character(100) COLLATE pg_catalog."default",
    workload_statefulset_replica_available character(100) COLLATE pg_catalog."default",
    collected_time timestamp with time zone
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.statefulset_replica_usage
    OWNER to postgres;

--##############################################################################
-- METERING TABLES
--##############################################################################

--==============================================================================
-- tb_metering_cluster
--==============================================================================
-- DROP TABLE public.tb_metering_cluster;

CREATE TABLE IF NOT EXISTS public.tb_metering_cluster
(
    region character varying(20) COLLATE pg_catalog."default" NOT NULL,
    cost numeric,
    region_name character varying(30) COLLATE pg_catalog."default" NOT NULL,
    created_time timestamp without time zone,
    updated_time timestamp without time zone,
    CONSTRAINT tb_metering_cluster_pkey PRIMARY KEY (region)
)

TABLESPACE pg_default;

ALTER TABLE public.tb_metering_cluster
    OWNER to postgres;


--==============================================================================
-- tb_metering_worker
--==============================================================================
-- DROP SEQUENCE public.tb_metering_worker_seq;
CREATE SEQUENCE public.tb_metering_worker_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.tb_metering_worker_seq
    OWNER TO postgres;

-- DROP TABLE public.tb_metering_worker;
CREATE TABLE IF NOT EXISTS public.tb_metering_worker
(
    id integer NOT NULL DEFAULT nextval('tb_metering_worker_seq'::regclass),
    region character varying(20) COLLATE pg_catalog."default" NOT NULL,
    cpu numeric,
    memory numeric,
    disk numeric,
    cost numeric,
    created_time timestamp without time zone,
    updated_time timestamp without time zone,
    CONSTRAINT tb_metering_worker_pkey PRIMARY KEY (id),
    CONSTRAINT fk_tb_metering_woker FOREIGN KEY (region)
        REFERENCES public.tb_metering_cluster (region) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE public.tb_metering_worker
    OWNER to postgres;
-- Index: fki_fk_tb_metering_woker

-- DROP INDEX public.fki_fk_tb_metering_woker;

CREATE INDEX fki_fk_tb_metering_woker
    ON public.tb_metering_worker USING btree
    (region COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

--==============================================================================
-- tb_billings
--==============================================================================
-- DROP TABLE public.tb_billings;

CREATE TABLE IF NOT EXISTS public.tb_billings
(
    date date NOT NULL,
    region character varying(20) COLLATE pg_catalog."default" NOT NULL,
    clusters bigint,
    workers bigint,
    hours bigint,
    cost numeric,
    cpu numeric,
    memory numeric,
    disk numeric,
    CONSTRAINT tb_billings_pkey PRIMARY KEY (date, region)
)

TABLESPACE pg_default;

ALTER TABLE public.tb_billings
    OWNER to postgres;