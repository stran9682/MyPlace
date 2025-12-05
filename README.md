# MyPlace
Project for CSC 478, Cloud Engineering

## Purpose
My Place is a cloud based roommate matching app, styled like Tinder, using vector search to find users compatible roommates!

## Components
Kurbernetes microservice architecture with:

### Data Handling
Frontend - built with React + Typescript and served via NGINX
API - ASP.NET pod for handling user information (matches, logging in, etc.)
Chathub - SignalR based websocket server for user messaging. Currently no limit on group size, have fun!
MigrationApplication - Startup container for seeding database and creating indexes

### Storage
ElasticSearch - for storing user vectors and retrieving recommendations via KNN search
CloudnativePG - Postgres built for kubernetes, configured with master and slave Dbs
MINIO - object storage for user images

### Cloud Tools
Long Horn - For handling PV at scale on baremetal hardware
NGINX ingress controller - for routing to pods and maintaining websocket connections via sticky sessions


