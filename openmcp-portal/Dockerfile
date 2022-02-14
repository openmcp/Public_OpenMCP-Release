
FROM node:10
# FROM registry.access.redhat.com/ubi7/ubi-minimal:latest

WORKDIR /app
COPY . .

RUN npm install yarn

RUN npm install react-scripts@3.4.3 -g
RUN npm install @devexpress/dx-core@2.7.2 
RUN npm install @devexpress/dx-grid-core@2.7.2 
RUN npm install @devexpress/dx-react-core@2.7.2
RUN npm install @devexpress/dx-react-grid@2.7.2
RUN npm install @devexpress/dx-react-grid-bootstrap4@2.7.2 
RUN npm install @devexpress/dx-react-grid-material-ui@2.7.2 
RUN npm install @material-ui/core@4.11.0
RUN npm install @material-ui/icons@4.9.1

COPY package*.json ./

RUN npm install

WORKDIR /app/client
RUN npm install

WORKDIR /app

EXPOSE 3000

CMD [ "yarn", "dev" ]
