# 🥔 Potato Disease Detection System

A deep learning system to classify potato leaf images into three categories:

* **Early Blight** 🌿
* **Late Blight** 🍂
* **Healthy** ✅

Helps farmers quickly identify diseases and improve crop yield.

---

## 📂 Dataset

* Used the **Potato Disease Dataset** from Kaggle.
* Thousands of labeled images in three classes.
* Resized all images to **256×256 px**.
* Dataset reasonably balanced, no advanced balancing needed.

---

## 🛠️ Data Preparation

* **Split:** 80% train, 10% validation, 10% test.
* **Normalization:** Pixel values scaled to 0-1.
* **Augmentation:** Horizontal/vertical flips, small rotations to improve generalization.

---

## 🏗️ Model Architecture (CNN)

* **Input:** 256×256 RGB images.
* **Conv Layers:** 6 layers (32 → 64 filters), ReLU activation.
* **MaxPooling:** 2×2 after each conv layer.
* **Flatten & Dense:** 64 neurons + ReLU, output layer with 3 neurons (softmax).

---

## ⚙️ Training

* **Loss:** Sparse Categorical Crossentropy
* **Optimizer:** Adam, lr=0.001
* **Batch Size:** 32
* **Epochs:** 50
* **Validation:** Monitored for overfitting/underfitting

---

## 📊 Performance

* Training & validation showed stable learning.
* **Test accuracy:** >90% ✅
* Model can correctly classify potato leaf diseases most of the time.

---

## 💾 Model Saving & Versioning

* Saved with automatic versioning for easy updates.

---

## 🌐 Backend API (FastAPI)

* **Endpoints:**

  * `/ping` → server status
  * `/predict` → upload image, get predicted class & confidence
* Handles image preprocessing & runs the TensorFlow model.
* **CORS enabled** for frontend integration.
* Can be deployed for real-time disease detection.

---
