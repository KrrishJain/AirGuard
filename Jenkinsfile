pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        echo "✅ Checkout done"
      }
    }

    stage('Test (Jest)') {
      steps {
        bat '''
          cd web\\server
          corepack enable
          pnpm --version
          pnpm install
          pnpm test
        '''
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

    stage('Run Smoke Test') {
      steps {
        withCredentials([string(credentialsId: 'airguard-server-env', variable: 'ENV_TEXT')]) {
          bat '''
            echo %ENV_TEXT%> web\\server\\.env

            docker rm -f airguard_test 2>NUL || exit /b 0

            docker run -d --name airguard_test --env-file web\\server\\.env -p 3001:3001 airguard-server:latest || exit /b 1

            docker ps --filter "name=airguard_test"
            docker logs airguard_test

            docker rm -f airguard_test
          '''
        }
      }
    }
  }

  post {
    success { echo "🎉 PIPELINE SUCCESS" }
    failure { echo "❌ PIPELINE FAILED (see above error + docker output)" }
  }
}
