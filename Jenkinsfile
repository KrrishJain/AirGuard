pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        echo "✅ Checkout done"
      }
    }

    stage('Build Docker Image (Server)') {
      steps {
        script {
          try {
            echo "🚀 Building Docker image..."
            bat 'docker build -t airguard-server:latest web\\server'
            echo "✅ Build done"
          } catch (err) {
            echo "❌ Docker build failed!"
            echo "ERROR: ${err}"
            throw err
          }
        }
      }
    }
  }

  post {
    success { echo "🎉 PIPELINE SUCCESS" }
    failure { echo "❌ PIPELINE FAILED (see above error + docker output)" }
  }
}
