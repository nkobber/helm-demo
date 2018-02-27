#!/usr/bin/groovy

def branch_name_lowercase = env.BRANCH_NAME.toLowerCase()
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

        image_tag = branch_name_lowercase + '-' + sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()

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
                println "Initiliazing Helm"
                sh "helm init"
                sh "helm version"
                println "Lint helm chart"
                sh "helm lint charts/hello-world"
                println "Deploy dry-run"
                sh "helm upgrade --dry-run --install hello-world charts/hello-world --set imageTag=${image_tag} --namespace hello-world"
            }
        }

        if (env.BRANCH_NAME =~ "PR-*") {
            stage('Deploy') {
                container('helm') {
                    println "Deploying PR"
                    sh "helm upgrade --install hello-world-${branch_name_lowercase} charts/hello-world --set imageTag=${image_tag} --set ingress.hostname=hello-world-${branch_name_lowercase}.demo.ialocin.com --namespace hello-world-${branch_name_lowercase}"
                    sleep(20)
                    sh "helm test hello-world-${branch_name_lowercase} --cleanup"
                }
            }
        }

        if (env.BRANCH_NAME == "master") {
            stage('Deploy') {
                container('helm') {
                    println "Deploying to prod"
                    sh "helm upgrade --install hello-world charts/hello-world --set imageTag=${image_tag} --namespace hello-world"
                }
            }
        }
    }
}
