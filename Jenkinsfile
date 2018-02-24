#!/usr/bin/groovy

def helmConfig() {
    println "Initiliazing Helm"
    sh "helm init"
    sh "helm version"
}

def String image_tag

podTemplate(label: 'jenkins-pipeline', containers: [
        containerTemplate(name: 'jnlp', image: 'jenkins/jnlp-slave:3.10-1-alpine', args: '${computer.jnlpmac} ${computer.name}'),
        containerTemplate(name: 'docker', image: 'docker:17', command: 'cat', ttyEnabled: true),
        containerTemplate(name: 'helm', image: 'lachlanevenson/k8s-helm:v2.7.2', command: 'cat', ttyEnabled: true),
        containerTemplate(name: 'kubectl', image: 'lachlanevenson/k8s-kubectl:v1.9.3', command: 'cat', ttyEnabled: true)
    ],
    volumes: [
        hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock'),
    ]) {

    node('jenkins-pipeline') {

        checkout scm

        image_tag = env.BRANCH_NAME + '-' + sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()

        stage('Test app') {
            println "success"
        }

        stage('Build/Publish container image') {
            container('docker') {
                withCredentials([
                    [$class: 'UsernamePasswordMultiBinding', credentialsId: 'dockerhub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']
                ]) {
                    sh "docker login -u ${env.USERNAME} -p ${env.PASSWORD}"
                }
                println "Build container image"
                sh "docker build -t nkobber/hello-world:${image_tag} ."
                println "Push container image"
                sh "docker push nkobber/hello-world:${image_tag}"
            }
        }

        stage('Helm lint/test') {
            container('helm') {
                helmConfig()
                println "Lint helm chart"
                sh "helm lint charts/hello-world"
                println "Deploy dry-run"
                sh "helm upgrade --dry-run --install hello-world charts/hello-world --set imageTag=${image_tag} --namespace hello-world"
            }
        }

        if (env.BRANCH_NAME =~ "PR-*") {
            stage('Deploy') {
                container('helm') {
                    helmConfig()
                    println "Deploying PR"
                    sh "helm upgrade --dry-run --install hello-world-${BRANCH_NAME} charts/hello-world --set imageTag=${image_tag} --set ingress.hostname=${env.BRANCH_NAME}-hello-world.demo.ialocin.com --namespace hello-world-${env.BRANCH_NAME}"
                    sh "helm test hello-world-${BRANCH_NAME} --cleanup"
                }
            }
        }

        if (env.BRANCH_NAME == "master") {
            stage('Deploy') {
                container('helm') {
                    helmConfig()
                    println "Deploying to prod"
                    sh "helm upgrade --install hello-world charts/hello-world --set imageTag=${image_tag} --namespace hello-world"
                }
            }
        }
    }
}
