# Job Portal – Full-Stack Cloud-Native Application

A modern **online job portal** built as an demo project using a microservices architecture. The system demonstrates **end-to-end full-stack engineering** with real-world technologies:  

- **Frontend**: React (hosted on **Azure Static Web Apps – Free Tier**)  
- **APIs**:  
  - **ASP.NET Core API** (C# + EF Core + PostgreSQL) for job postings, applications, users, and notifications.  
  - **Python Flask API** (SQLAlchemy + AI/ML libraries) for resume parsing, recommendations, and analytics.  
- **Database**: PostgreSQL (managed on DigitalOcean using free student credit).  
- **Caching & Queues**: Redis Cloud (Free 30 MB plan).  
- **AI**: Azure Document Intelligence (F0 free tier) + NLP/embeddings for resume/job matching.  
- **Infrastructure**: Dockerized microservices deployed on Kubernetes (**DigitalOcean Kubernetes – free credit**), with Ingress, cert-manager, and Helm.  
- **CI/CD**: GitHub Actions (3,000 free minutes/month via Student Pack) + GitHub Container Registry (GHCR).  
- **Observability**: New Relic (APM/metrics/logs) + Sentry (error tracking).  
- **Domain & SSL**: Free domain from Namecheap/Name.com (GitHub Student Pack).  

## Features
- Job posting & application workflows  
- Resume upload & parsing with AI  
- Candidate ↔ job matching recommendations  
- Realtime notifications with Azure SignalR (Free tier)  
- Search with Meilisearch (self-hosted on K8s)  
- Secure authentication & role-based access  

## Purpose
Showcases a **production-style architecture** using GitHub Student Developer Pack + free cloud credits, integrating modern **DevOps, microservices, and AI analytics**.  
