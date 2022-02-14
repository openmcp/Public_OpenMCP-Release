-- Login/Logout
insert into tb_codes values ('LOG-PT','log-LG-VW01','Enter login Page','Login');
insert into tb_codes values ('LOG-PT','log-LG-EX01','Log in','Login');
insert into tb_codes values ('LOG-PT','log-LG-EX02','Log out','Logout');

-- Dashboard Pages
insert into tb_codes values ('LOG-PT','log-DS-VW01','View Dashboard System Status','Dashboard > System Status');
insert into tb_codes values ('LOG-PT','log-DS-VW02','View Dashboard Cluster Power Usage','Dashboard > Cluster Power Usage');
insert into tb_codes values ('LOG-PT','log-DS-VW03','View Dashboard Cluster Join/Unjoin','Dashboard > Cluster Join/Unjoin');
insert into tb_codes values ('LOG-PT','log-DS-VW04','View Dashboard Cluster Regions','Dashboard > Cluster Regions');
insert into tb_codes values ('LOG-PT','log-DS-VW05','View Dashboard World Cluster Status','Dashboard > World Cluster Status');
insert into tb_codes values ('LOG-PT','log-DS-VW06','View Dashboard Cluster Topology','Dashboard > Cluster Topology');
insert into tb_codes values ('LOG-PT','log-DS-VW07','View Dashboard Service Topology','Dashboard > Service Topology');
insert into tb_codes values ('LOG-PT','log-DS-VW08','View Dashboard Region Topology','Dashboard > Region Topology');
insert into tb_codes values ('LOG-PT','log-DS-MD01','Modify Dashboard Contents','Dashboard > Edit Dashboard > Save');
insert into tb_codes values ('LOG-PT','log-DS-EX01','Execute Service Deployment','Dashboard > Service Deployment > Execution');
insert into tb_codes values ('LOG-PT','log-DS-EX02','Execute Cluster Join','Dashboard > Cluster Join/Unjoin > Join');
insert into tb_codes values ('LOG-PT','log-DS-EX03','Execute Cluster Unjoin','Dashboard > Cluster Join/Unjoin > Unjoin');

-- Multiple Metrics
insert into tb_codes values ('LOG-PT','log-MM-VW01','View Multiple Metrics','Multiple Metrics');
insert into tb_codes values ('LOG-PT','log-MM-CG01','Change Multiple Metrics Cluster Item','Multiple Metrics > Cluster Selector');
insert into tb_codes values ('LOG-PT','log-MM-CG02','Change Multiple Metrics Namespace Metric Item','Multiple Metrics > Namespace Selector');
insert into tb_codes values ('LOG-PT','log-MM-CG03','Change Multiple Metrics Node Metric Item','Multiple Metrics > Node Selector');

-- Cluster Pages
insert into tb_codes values ('LOG-PT','log-CL-VW01','View Clusters Joined Page','Clusters > Jonied');
insert into tb_codes values ('LOG-PT','log-CL-VW02','View Clusters Joinable Page','Clusters > Joinable');
insert into tb_codes values ('LOG-PT','log-CL-EX01','Execute Cluster Joine','Clusters > Joinable > Joined');
insert into tb_codes values ('LOG-PT','log-CL-EX02','Execute Cluster Unjoin','Clusters > Joined > Unjoin');
insert into tb_codes values ('LOG-PT','log-CL-VW03','View Clusters Overview','Clusters > Overview');
insert into tb_codes values ('LOG-PT','log-CL-VW04','View Clusters Node List','Clusters > Nodes');
insert into tb_codes values ('LOG-PT','log-CL-VW05','View Clusters Pod List','Clusters > Pods');
insert into tb_codes values ('LOG-PT','log-CL-VW06','View Clusters Node Overview','Clusters > Nodes > Overview');
insert into tb_codes values ('LOG-PT','log-CL-VW07','View Clusters Pod Overivew','Clusters > Pods > Overview');

-- Nodes Pages
insert into tb_codes values ('LOG-PT','log-ND-VW01','View Nodes Page','Nodes');
insert into tb_codes values ('LOG-PT','log-ND-VW02','View Node Overview Page','Nodes > Node Overview');
insert into tb_codes values ('LOG-PT','log-ND-EX01','Execute Node Start','Nodes > Node Overview > Start Node');
insert into tb_codes values ('LOG-PT','log-ND-EX02','Execute Node Stop','Nodes > Node Overview > Stop Node');
insert into tb_codes values ('LOG-PT','log-ND-EX03','Execute Node Delete','Nodes > Node Overview > Delete Node');
insert into tb_codes values ('LOG-PT','log-ND-VW03','View Add Node EKS','Nodes > Add Node > EKS');
insert into tb_codes values ('LOG-PT','log-ND-VW04','View Add Node GKE','Nodes > Add Node > GKE');
insert into tb_codes values ('LOG-PT','log-ND-VW05','View Add Node AKS','Nodes > Add Node > AKS');
insert into tb_codes values ('LOG-PT','log-ND-VW06','View Add Node KVM','Nodes > Add Node > KVM');
insert into tb_codes values ('LOG-PT','log-ND-EX04','Execute Add EKS Node','Nodes > Add EKS Node');
insert into tb_codes values ('LOG-PT','log-ND-EX05','Execute Add GKE Node','Nodes > Add GKE Node');
insert into tb_codes values ('LOG-PT','log-ND-EX06','Execute Add AKS Node','Nodes > Add AKS Node');
insert into tb_codes values ('LOG-PT','log-ND-EX07','Execute Add KVM Node','Nodes > Add KVM Node');
insert into tb_codes values ('LOG-PT','log-ND-EX08','Execute Add Node Taint','Nodes > Node Overview > ConfigTaint > Add Taint(save)');
insert into tb_codes values ('LOG-PT','log-ND-EX09','Execute Delete Node Taint','Nodes > Node Overview > ConfigTaint > Delete');
insert into tb_codes values ('LOG-PT','log-ND-EX10','Execute Change Node Resources','Nodes > Node Overview > Node Resources > Resource Config');

-- Projects Pages
insert into tb_codes values ('LOG-PT','log-PJ-VW01','View Projects Page','WorkLoads > Projects');
insert into tb_codes values ('LOG-PT','log-PJ-VW02','View Project Overview Page','WorkLoads > Projects > Overview');
insert into tb_codes values ('LOG-PT','log-PJ-VW03','View Project Deployment Page','WorkLoads > Projects > Resources > Workloads > Deplotments');
insert into tb_codes values ('LOG-PT','log-PJ-VW04','View Project Statefulsets Page','WorkLoads > Projects > Resources > Workloads > Statefulsets');
insert into tb_codes values ('LOG-PT','log-PJ-VW05','View Project Pods Page','WorkLoads > Projects > Resources > Pods');
insert into tb_codes values ('LOG-PT','log-PJ-VW06','View Project Services Page','WorkLoads > Projects > Resources > Services');
insert into tb_codes values ('LOG-PT','log-PJ-VW07','View Project Ingress Page','WorkLoads > Projects > Resources > Ingress');
insert into tb_codes values ('LOG-PT','log-PJ-VW08','View Project Volumes Page','WorkLoads > Projects > Volumes');
insert into tb_codes values ('LOG-PT','log-PJ-VW09','View Project Secrets Page','WorkLoads > Projects > Config > Secrets');
insert into tb_codes values ('LOG-PT','log-PJ-VW10','View Project ConfigMaps Page','WorkLoads > Projects > Config > ConfigMaps');
insert into tb_codes values ('LOG-PT','log-PJ-VW11','View Project Deployment Overview','WorkLoads > Projects > Resources > Workloads > Deplotments > Overview');
insert into tb_codes values ('LOG-PT','log-PJ-VW12','View Project Statefulsets Overview','WorkLoads > Projects > Resources > Workloads > Statefulsets > Overview');
insert into tb_codes values ('LOG-PT','log-PJ-VW13','View Project Pods Overview','WorkLoads > Projects > Resources > Pods > Overview');
insert into tb_codes values ('LOG-PT','log-PJ-VW14','View Project Services Overview','WorkLoads > Projects > Resources > Services > Overview');
insert into tb_codes values ('LOG-PT','log-PJ-VW15','View Project Ingress Overview','WorkLoads > Projects > Resources > Ingress > Overview');
insert into tb_codes values ('LOG-PT','log-PJ-VW16','View Project Volumes Overview ','WorkLoads > Projects > Volumes > Overview');
insert into tb_codes values ('LOG-PT','log-PJ-VW17','View Project Secrets Overview ','WorkLoads > Projects > Config > Secrets > Overview');
insert into tb_codes values ('LOG-PT','log-PJ-VW18','View Project ConfigMaps Overview ','WorkLoads > Projects > Config > ConfigMaps > Overview');
insert into tb_codes values ('LOG-PT','log-PJ-EX01','Execute Create Project','WorkLoads > Projects > Create Project');

-- Deployments
insert into tb_codes values ('LOG-PT','log-DP-VW01','View Deployments Page','WorkLoads > Deployments > Deployment');
insert into tb_codes values ('LOG-PT','log-DP-VW02','View OpenMCP Deployments Page','WorkLoads > Deployments > OpenMCP Deployment');
insert into tb_codes values ('LOG-PT','log-DP-VW03','View Deployment Overview','WorkLoads > Deployments > Overview');
insert into tb_codes values ('LOG-PT','log-DP-VW04','View Deployment OpenMCP Overview','WorkLoads > Deployments > OpenMCP Overview');
insert into tb_codes values ('LOG-PT','log-DP-EX01','Execute Create Deployment','WorkLoads > Deployment > Create Deployment');
insert into tb_codes values ('LOG-PT','log-DP-EX02','Execute Delete Deployment','WorkLoads > Deployment > Delete Deployment');
insert into tb_codes values ('LOG-PT','log-DP-EX03','Execute Create OpenMCP Deployment','WorkLoads > Deployment > Create OpenMCP Deployment');
insert into tb_codes values ('LOG-PT','log-DP-EX04','Execute Delete OpenMCP Deployment','WorkLoads > Deployment > Delete OpenMCP Deployment');
insert into tb_codes values ('LOG-PT','log-DP-EX05','Execute Deployment Add Replicas','WorkLoads > Deployment > Overview > Add Replicas');
insert into tb_codes values ('LOG-PT','log-DP-EX06','Execute Deployment Delete Replicas','WorkLoads > Deployment > Overview > Delete Replicas');

-- Pods
insert into tb_codes values ('LOG-PT','log-PD-VW01','View Pods Page','WorkLoads > Pods > Pod');
insert into tb_codes values ('LOG-PT','log-PD-VW02','View HPA Page','WorkLoads > Pods > HPA');
insert into tb_codes values ('LOG-PT','log-PD-VW03','View VPA Page','WorkLoads > Pods > VPA');
insert into tb_codes values ('LOG-PT','log-PD-VW04','View Pods Overview','WorkLoads > Pods > Pod Overview');
insert into tb_codes values ('LOG-PT','log-PD-EX01','Modify pod resources(cpu,memory)','WorkLoads > Pod Information - Basic Info(Resource Config)');

-- Network
insert into tb_codes values ('LOG-PT','log-NW-VW01','View Network DNS Page','WorkLoads > Network > DNS');
insert into tb_codes values ('LOG-PT','log-NW-VW02','View Network Services Page','WorkLoads > Network > Services');
insert into tb_codes values ('LOG-PT','log-NW-VW03','View Network Ingress Page','WorkLoads > Network > Ingress');
insert into tb_codes values ('LOG-PT','log-NW-VW04','View Network DNS Overview','WorkLoads > Network > DNS > Overview');
insert into tb_codes values ('LOG-PT','log-NW-VW05','View Network Services Overview','WorkLoads > Network > Services > Overview');
insert into tb_codes values ('LOG-PT','log-NW-VW06','View Network Ingress Overview','WorkLoads > Network > Ingress > Overview');
insert into tb_codes values ('LOG-PT','log-NW-EX01','Execute Create Service','WorkLoads > Network > Services > Create Service');
insert into tb_codes values ('LOG-PT','log-NW-EX02','Execute Create Ingress','WorkLoads > Network > Ingress > Create Ingress');
insert into tb_codes values ('LOG-PT','log-NW-EX03','Execute Delete Service','WorkLoads > Network > Service > Delete Service');

-- Migrations
insert into tb_codes values ('LOG-PT','log-MG-VW01','View Migration Page','Motions > Migrations > Migrations');
insert into tb_codes values ('LOG-PT','log-MG-VW02','View Migration Log Page','Motions > Migrations > Migration Logs');
insert into tb_codes values ('LOG-PT','log-MG-EX01','Execute Migration','Motions > Migrations > Migrations > Migration');

-- Snapshots
insert into tb_codes values ('LOG-PT','log-SS-VW01','View Snapshots Page','Motions > Snapshots > Snapshot');
insert into tb_codes values ('LOG-PT','log-SS-VW02','View Snapshots Log Page','Motions > Snapshots > Snapshot Log');
insert into tb_codes values ('LOG-PT','log-SS-EX01','Execute Take Snapshot','Motions > Snapshots > Snapshot > Take Snapshot');
insert into tb_codes values ('LOG-PT','log-SS-EX02','Execute Restore Snapshot','Motions > Snapshots > Snapshot > Restore');

-- Global Cache
insert into tb_codes values ('LOG-PT','log-GC-VW01','View Global Cache Page','Global Cache');

-- Accounts
insert into tb_codes values ('LOG-PT','log-AC-VW01','View Accounts Page','Settings > Accounts > Account');
insert into tb_codes values ('LOG-PT','log-AC-VW02','View User Log Page','Settings > Accounts > User Log');
insert into tb_codes values ('LOG-PT','log-AC-EX01','Execute Create Account','Settings > Accounts > Account > Create an Account');
insert into tb_codes values ('LOG-PT','log-AC-EX02','Execute Account Change Role','Settings > Accounts > Account > Change Role');

-- Group Role
insert into tb_codes values ('LOG-PT','log-GR-VW01','View Group Role Page','Settings > Group Role');
insert into tb_codes values ('LOG-PT','log-GR-EX01','Execute Create Group Role','Settings > Group Role > Create Group');
insert into tb_codes values ('LOG-PT','log-GR-EX02','Execute Edit Group Role','Settings > Group Role > Edit Group');
insert into tb_codes values ('LOG-PT','log-GR-EX03','Execute Delete Group Role','Settings > Group Role > Delete Group');

-- policy
insert into tb_codes values ('LOG-PT','log-PO-VW01','View OMCP Policy','Settings > Policy > OMCP Policy');
insert into tb_codes values ('LOG-PT','log-PO-EX01','Execute Edit Policy','Settings > Policy > OMCP Policy > Edit Policy');

-- Alert
insert into tb_codes values ('LOG-PT','log-AL-VW01','View Alerts Log Page','Settings > Alerts > Alert Log');
insert into tb_codes values ('LOG-PT','log-AL-VW02','View Threshold Page','Settings > Alerts > Threshold');
insert into tb_codes values ('LOG-PT','log-AL-EX01','Execute Create Threshold','Settings > Alerts > Threshold > Create Threshold');
insert into tb_codes values ('LOG-PT','log-AL-EX02','Execute Edit Threshold','Settings > Alerts > Threshold > Edit Threshold');
insert into tb_codes values ('LOG-PT','log-AL-EX03','Execute Delete Threshold','Settings > Alerts > Threshold > Delete Threshold');

-- Meterings
insert into tb_codes values ('LOG-PT','log-MR-VW01','View Meterings Page','Settings > Meterings');
insert into tb_codes values ('LOG-PT','log-MR-EX01','Execute Add Region','Settings > Meterings > Add Region');
insert into tb_codes values ('LOG-PT','log-MR-EX02','Execute Edit Metering','Settings > Meterings > Edit Metering');

-- Billings
insert into tb_codes values ('LOG-PT','log-BL-VW01','View Billings Page','Settings > Billings');

-- Config
insert into tb_codes values ('LOG-PT','log-CF-VW01','View Public Cloud Auth EKS Page','Settings > Config > Public Cloud Auth > EKS');
insert into tb_codes values ('LOG-PT','log-CF-EX01','Execute Add EKS Configrations','Settings > Config > Public Cloud Auth > EKS > New');
insert into tb_codes values ('LOG-PT','log-CF-EX02','Execute Edit EKS Configrations','Settings > Config > Public Cloud Auth > EKS > Edit');
insert into tb_codes values ('LOG-PT','log-CF-EX03','Execute Delete EKS Configrations','Settings > Config > Public Cloud Auth > EKS > Delete');

insert into tb_codes values ('LOG-PT','log-CF-VW02','View Public Cloud Auth GKE Page','Settings > Config > Public Cloud Auth > GKE');
insert into tb_codes values ('LOG-PT','log-CF-EX04','Execute Add GKE Configrations','Settings > Config > Public Cloud Auth > GKE > New');
insert into tb_codes values ('LOG-PT','log-CF-EX05','Execute Edit GKE Configrations','Settings > Config > Public Cloud Auth > GKE > Edit');
insert into tb_codes values ('LOG-PT','log-CF-EX06','Execute Delete GKE Configrations','Settings > Config > Public Cloud Auth > GKE > Delete');

insert into tb_codes values ('LOG-PT','log-CF-VW03','View Public Cloud Auth AKS Page','Settings > Config > Public Cloud Auth > AKS');
insert into tb_codes values ('LOG-PT','log-CF-EX07','Execute Add AKS Configrations','Settings > Config > Public Cloud Auth > AKS > New');
insert into tb_codes values ('LOG-PT','log-CF-EX08','Execute Edit AKS Configrations','Settings > Config > Public Cloud Auth > AKS > Edit');
insert into tb_codes values ('LOG-PT','log-CF-EX09','Execute Delete AKS Configrations','Settings > Config > Public Cloud Auth > AKS > Delete');

insert into tb_codes values ('LOG-PT','log-CF-VW04','View Public Cloud Auth KVM Page','Settings > Config > Public Cloud Auth > KVM');
insert into tb_codes values ('LOG-PT','log-CF-EX10','Execute Add KVM Configrations','Settings > Config > Public Cloud Auth > KVM > New');
insert into tb_codes values ('LOG-PT','log-CF-EX11','Execute Edit KVM Configrations','Settings > Config > Public Cloud Auth > KVM > Edit');
insert into tb_codes values ('LOG-PT','log-CF-EX12','Execute Delete KVM Configrations','Settings > Config > Public Cloud Auth > KVM > Delete');

insert into tb_codes values ('LOG-PT','log-CF-VW05','View Dashboard Config Page','Settings > Config > Dashboard Config');
insert into tb_codes values ('LOG-PT','log-CF-EX13','Execute Edit Dashboard Config Refresh Cycle','Settings > Config > Dashboard Config > Refresh Cycle');
insert into tb_codes values ('LOG-PT','log-CF-EX14','Execute Edit Dashboard Config Power Usage Range','Settings > Config > Dashboard Config > Power Usage Range');

-- Public Cloud Vendors
insert into tb_codes values ('VENDOR','EKS','Cloud Service Vender - Amazon Elastic Kubernetes Servic','');
insert into tb_codes values ('VENDOR','AKS','Cloud Service Vender - Azure Kubernetes Service','');
insert into tb_codes values ('VENDOR','GCP','Cloud Service Vender - Google Cloud Platform','');

--public cloud instance type
insert into tb_codes values ('EC2-TYPE','t2.nano','AWS EC2 t2.nano instance type','cpu:1,memory:0.5');
insert into tb_codes values ('EC2-TYPE','t2.micro','AWS EC2 t2.micro instance type','cpu:1,memory:1');
insert into tb_codes values ('EC2-TYPE','t2.small','AWS EC2 t2.small instance type','cpu:1,memory:2');
insert into tb_codes values ('EC2-TYPE','t2.medium','AWS EC2 t2.medium instance type','cpu:2,memory:4');
insert into tb_codes values ('EC2-TYPE','t2.large','AWS EC2 t2.large instance type','cpu:2,memory:8');
insert into tb_codes values ('EC2-TYPE','t2.xlarge','AWS EC2 t2.xlarge instance type','cpu:4,memory:16');
insert into tb_codes values ('EC2-TYPE','t2.2xlarge','AWS EC2 t2.2xlarge instance type','cpu:8,memory:32');
insert into tb_codes values ('EC2-TYPE','t3.nano','AWS EC2 t3.nano instance type','cpu:2,memory:0.5');
insert into tb_codes values ('EC2-TYPE','t3.micro','AWS EC2 t3.micro instance type','cpu:2,memory:1');
insert into tb_codes values ('EC2-TYPE','t3.small','AWS EC2 t3.small instance type','cpu:2,memory:2');
insert into tb_codes values ('EC2-TYPE','t3.medium','AWS EC2 t3.medium instance type','cpu:2,memory:4');
insert into tb_codes values ('EC2-TYPE','t3.large','AWS EC2 t2.large instance type','cpu:2,memory:8');
insert into tb_codes values ('EC2-TYPE','t3.xlarge','AWS EC2 t2.xlarge instance type','cpu:4,memory:16');
insert into tb_codes values ('EC2-TYPE','t3.2xlarge','AWS EC2 t2.2xlarge instance type','cpu:8,memory:32');
insert into tb_codes values ('AKS-TYPE','Standard_B1ms','Standard','cpu:1 / memory:2');
insert into tb_codes values ('AKS-TYPE','Standard_B1s','Standard','cpu:1 / memory:1');
insert into tb_codes values ('AKS-TYPE','Standard_B2ms','Standard','cpu:2 / memory:8');
insert into tb_codes values ('AKS-TYPE','Standard_B2s','Standard','cpu:2 / memory:4');
insert into tb_codes values ('EKS-TYPE','EKS.t2.large','AWS EKS t2.large instance type','cpu:2 / memory:8');
insert into tb_codes values ('EKS-TYPE','EKS.t2.micro','AWS EKS t2.micro instance type','cpu:1 / memory:1');
insert into tb_codes values ('EKS-TYPE','EKS.t2.small','AWS EKS t2.small instance type','cpu:1 / memory:2');
insert into tb_codes values ('EKS-TYPE','EKS.t3.large','AWS EKS t2.large instance type','cpu:2 / memory:8');
insert into tb_codes values ('EKS-TYPE','EKS.t3.medium','AWS EKS t3.medium instance type','cpu:2 / memory:4');
insert into tb_codes values ('EKS-TYPE','EKS.t3.micro','AWS EKS t3.micro instance type','cpu:2 / memory:1');
insert into tb_codes values ('EKS-TYPE','EKS.t3.small','AWS EKS t3.small instance type','cpu:2 / memory:2');

-- Dashboard module
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('DASHBOARD','DBCOMP01','System Status','');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('DASHBOARD','DBCOMP02','Cluster Regions','');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('DASHBOARDx','DBCOMP03','Management Clusters','');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('DASHBOARD','DBCOMP04','World Cluster Status','');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('DASHBOARD','DBCOMP05','Topology','');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('DASHBOARDx','DBCOMP06','Cluster Topology','');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('DASHBOARDx','DBCOMP07','Service Topology','');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('DASHBOARDx','DBCOMP08','Service-Region Topology','');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('DASHBOARD','DBCOMP09','Cluster Join/Unjoin','');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('DASHBOARD','DBCOMP10','Cluster Power Usage','');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('CONFIG', 'DASHBOARD-CYCLE', '5', 'Dashboard Refresh Cycle / Sec');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('CONFIG', 'POWER-HIGH', '100', 'Power Usage Range 71~100');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('CONFIG', 'POWER-MEDIUM', '70', 'Power Usage Range 31~70');
INSERT INTO public.tb_codes(kinds, code, description, etc) VALUES ('CONFIG', 'POWER-LOW', '30', 'Power Usage Range 0~30');


--tb_account_role
INSERT INTO public.tb_account_role VALUES ('admin', 'Administrator', 'System Administrator');
INSERT INTO public.tb_account_role VALUES ('user', 'User', 'Openmcp Portal User');

--tb_accounts
INSERT INTO public.tb_accounts VALUES ('openmcpadmin','$2b$10$nvkN2RtN5/8UNHhNEVGDiOF8WIwdiPp/P7SU/DibOtPzaRXUoBG8y','{admin}','2021-10-12 13:43:24','2021-10-12 13:43:24');

--oauth_clients
INSERT INTO public.oauth_clients(client_id, client_secret, redirect_uri) VALUES ('openmcp-client', 'openmcp-secret', 'http://localhost:3000/oauth/callback');

-- metering default regions 
 INSERT INTO public.tb_metering_cluster(region, cost, region_name, created_time, updated_time) VALUES ('KR', 0.1, 'Korea', current_timestamp, current_timestamp);
 INSERT INTO public.tb_metering_cluster(region, cost, region_name, created_time, updated_time) VALUES ('US', 0.1, 'US',current_timestamp, current_timestamp);
 INSERT INTO public.tb_metering_cluster(region, cost, region_name, created_time, updated_time) VALUES ('JP', 0.1, 'Japan',current_timestamp, current_timestamp);
 INSERT INTO public.tb_metering_cluster(region, cost, region_name, created_time, updated_time) VALUES ('HK', 0.1, 'Hongkong',current_timestamp,current_timestamp);
 INSERT INTO public.tb_metering_cluster(region, cost, region_name, created_time, updated_time) VALUES ('CN', 0.1, 'China',current_timestamp,current_timestamp);