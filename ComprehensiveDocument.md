=============================================

# Requirement Understanding

### MULTI-TIER (2 TIER APP):
    1-Service API Tier
            - Node based Backend
            - Expose public Api endpoint to get data from DATABASE
            - Using config files for configurations
            - Pooling connection for database
            
            Must REquirements:
                - Support rolling updates: so we can do incremental updates(future deployment) without Downtime 
                - Be externally accessible: ONLY API endpoint should be exposed and not the DATABASE
                - Demonstrate self-healing: if any node fails for some reason it can be respawned without human involvement
                - Demonstrate HPA on Service API: SO if suddenly api-load is increased  then we can scale pods without human intervention


    2-Database Tier
        - Postgress Database
        -Should consist of 5-10 entries in database
        -Data persistence: DAtabase is SAFE even if postgres server dies for some reason
        -expose it  only for cluster and not to public
        -Automeatically REstart the database pod even if it dies for some reason
                
                ------------------------------------------------

### Kubernetes Requirements:

Kubernetes Requirements

    1-Service API Tier
        -Externally accessible
        -Runs 4 pods
        -Supports rolling updates
        -Configured via ConfigMap
        -Uses Kubernetes Secrets

    2-Database Tier
        -Cluster only access
        -Only 1 database pod
        -Requires persistent storage.
        -Uses Kubernetes Secrets and config.

                ------------------------------------------------

### Other requirements
    -database access using config.yaml
    -base64 encoded password
    -database should preservs the state
    -not using pod ip for internal communication(because it will be changed once new pod is created)
    -Using ingress for exposing the api-service
=============================================

=============================================

-Assumptions

NONE 

=============================================

=============================================

-Solution Overview

WEB EXPOSED API >

LOAD BALANCER(google cloud) > 

YAML configured- API-INGRESS> 

YAML configured- API-SERVICE(CLUSTER_IP with 4 pods(SELF-HEALING) and 10 HPA, Reads config +secret)  >

YAML configured- DATABASE-SERVICE(CLUSTER_IP and not exposed to public)  >

YAML configured- Posgress(Stateful so it doesnot lose its config) >

YAML configured- DATABASE(actual database stored on storage to prevent data loss incase of failure)

```
Internet
   │
   ▼
[GCE HTTP Load Balancer]   ← provisioned automatically by GKE Ingress
   │
   ▼
[Ingress: users-api-ingress]
   │
   ▼
[Service: users-api-service]  (ClusterIP)
   │
   ├── [users-api Pod 1]
   ├── [users-api Pod 2]    ← Deployment, 4 replicas (HPA: up to 10)
   ├── [users-api Pod 3]
   └── [users-api Pod 4]
          │  reads ConfigMap + Secret at startup
          ▼
   [Service: postgres-service]  (ClusterIP — no external access)
          │
          ▼
   [StatefulSet: postgres-0]
          │
          ▼
   [PVC: postgres-data-pvc]  →  GCE Persistent Disk (1Gi)
```


=============================================

=============================================

-Justification for the Resources Utilized
NODE JS : BE api

POSTGRES: SQL Database

DOCKER-> For containerizing the api service

KUBERNETSS

CLISTERIP - for internal network communication

namespace.yaml => for creating namespace and to establish relation between all the ymal services

ingress.yaml => To expose single IP for pulic access

configmap.yaml=> storing env variables(key:value) variables to reuse on multiple places

secret.yaml=> for storing sensitive/database credentials(BASE64 encoded)

api-service.yaml =>exposes actual API-services

api-hpa.yaml=>Scaling up when load increases

postgres-statefulset.yaml =>provides stable identity for postgres

postgres-service.yaml provide stable endpoint for postgress

postgres-pvc.yaml creates a persistent volume

api-deployment.yaml=>Created deployment config for replicas, container image, and rolling update strategy

=============================================
