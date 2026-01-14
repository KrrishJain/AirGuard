pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image (Server)') {
      steps {
        bat 'docker build -t airguard-server:latest web\\server'
      }
    }
  }
}
