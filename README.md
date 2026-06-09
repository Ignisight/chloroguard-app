# 🌱 ChloroGuard: AI-Powered Plant Disease Intelligence

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Llama-3](https://img.shields.io/badge/Meta_Llama_3-0466C8?style=for-the-badge)

ChloroGuard is a production-ready mobile application designed to diagnose agricultural plant diseases using Edge-Cloud AI. It combines a highly optimized computer vision scanner with a generative AI chatbot acting as a Master Agronomist.

---

## 📲 Download the App (Android)

You can download and test the fully compiled Android app directly from the GitHub Releases page:

**👉 [Download ChloroGuard v1.0.0 APK](https://github.com/Ignisight/chloroguard-app/releases/tag/v1.0.0)**

*(Note: The backend API is hosted on Render's free tier. The very first scan or chat may take ~50 seconds due to server cold-start. Subsequent requests take <2 seconds).*

---

## ✨ Key Features

1. **📷 Deep Learning Computer Vision:**
   - Powered by a fine-tuned **MobileNetV2** architecture running on a FastAPI Python backend.
   - Diagnoses 38 unique crop/disease classes with 95%+ accuracy.
   - MobileNetV2 was explicitly chosen over ResNet50 due to its minimal parameter count (Depthwise Separable Convolutions), ensuring lightning-fast CPU inference latency and low memory footprint.

2. **💬 Generative AI Agronomy Chatbot:**
   - Powered by **Meta-Llama-3-8B-Instruct** via Hugging Face Serverless Inference.
   - The AI operates under a strict, highly professional System Prompt. It acts as an Indian Agronomist, diagnosing context and providing rigid, structured treatment plans (What it is, Causes, Treatment).

3. **☁️ OTA (Over-The-Air) Updates:**
   - Integrated with **Expo Application Services (EAS)**.
   - Supports invisible, over-the-air JavaScript updates directly to user devices without requiring a new APK compilation or Play Store review.

---

## 🛠️ Architecture & Tech Stack

*   **Frontend:** React Native, Expo SDK 54, EAS Build/Update
*   **Backend:** FastAPI, Uvicorn, Python
*   **Machine Learning:** PyTorch, MobileNetV2 (CV), Hugging Face `huggingface_hub` (LLM)
*   **Dataset:** PlantVillage Augmented (87,000+ images)

---

## 🚀 Building Locally

To compile this project locally into an `.apk` using EAS:

```bash
# 1. Install Expo CLI
npm install -g eas-cli

# 2. Login to your Expo account
eas login

# 3. Trigger the Android APK Build
cd mobile_app
npx eas-cli build -p android --profile preview
```
