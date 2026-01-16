pipeline {
  agent any

  environment {
    IMAGE_NAME = "airguard-server"
    EC2_HOST   = "ec2-3-109-2-225.ap-south-1.compute.amazonaws.com"
    EC2_USER   = "ubuntu"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        echo "✅ Checkout done"
      }
    }

    stage('Set Image Tag') {
      steps {
        script {
          def out = bat(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          def commit = out.tokenize('\r\n')[-1].trim()
          env.IMAGE_TAG = "${env.BUILD_NUMBER}-${commit}"
          echo "🏷️ Image Tag: ${env.IMAGE_NAME}:${env.IMAGE_TAG}"
        }
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
            bat "docker build -t ${env.IMAGE_NAME}:${env.IMAGE_TAG} -t ${env.IMAGE_NAME}:latest web\\\\server"
            echo "✅ Build done"
          } catch (err) {
            echo "❌ Docker build failed!"
            throw err
          }
        }
      }
    }

    stage('Run Smoke Test') {
      steps {
        withCredentials([file(credentialsId: 'airguard-server-env-file', variable: 'ENV_FILE')]) {
          bat '''
            copy /Y "%ENV_FILE%" web\\server\\.env
            docker rm -f airguard_test 2>NUL || exit /b 0
            docker run -d --name airguard_test --env-file web\\server\\.env -p 3001:3001 %IMAGE_NAME%:%IMAGE_TAG% || exit /b 1
            docker ps --filter "name=airguard_test"
            docker rm -f airguard_test
          '''
        }
      }
    }

    stage('Deploy to EC2') {
      steps {
        withCredentials([file(credentialsId: 'ec2-key-file', variable: 'SSH_KEY_FILE')]) {
          bat """
            ssh -i "%SSH_KEY_FILE%" -o StrictHostKeyChecking=no %EC2_USER%@%EC2_HOST% "set -e; \\
              cd ~/AirGuard; \\
              git checkout development; \\
              git pull origin development; \\
              cd web/server; \\
              docker rm -f airguard_server >/dev/null 2>&1 || true; \\
              docker build -t airguard-server:ec2 .; \\
              docker run -d --restart unless-stopped --name airguard_server --env-file .env -p 3001:3001 airguard-server:ec2; \\
              sleep 3; \\
              curl -s http://localhost:3001/health"
          """
        }
      }
    }
  }
  post {
    success { echo "🎉🎉 PIPELINE SUCCESS" }
    failure { echo "❌ PIPELINE FAILED" }
  }
}