import streamlit as st
import requests
from PIL import Image
import io

# 🎨 App Configuration
st.set_page_config(
    page_title="Potato Leaf Disease Detector",
    page_icon="🥔",
    layout="centered"
)

# 🏷️ Title & Description
st.title("🥔 Potato Leaf Disease Detection")
st.markdown(
    """
    Upload an image of a **potato leaf**, and this app will analyze it using a trained deep learning model  
    to detect whether the leaf is **healthy** or affected by a **disease**.
    """
)

st.info("Supported formats: JPG, JPEG, PNG | Model must be running on FastAPI backend.")

# 📤 File Uploader
uploaded_file = st.file_uploader("📷 Upload a potato leaf image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    try:
        # Display the uploaded image
        image = Image.open(uploaded_file).convert("RGB")
        st.image(image, caption="Uploaded Leaf Image", use_container_width=True)

        # Convert image to bytes
        img_bytes = io.BytesIO()
        image.save(img_bytes, format="PNG")
        img_bytes = img_bytes.getvalue()

        # 🚀 Send Image to Backend
        with st.spinner("🔍 Analyzing image... please wait"):
            url = "http://localhost:8000/predict" 
            files = {"file": ("leaf.png", img_bytes, "image/png")}
            response = requests.post(url, files=files)

        # 📊 Display Results
        if response.status_code == 200:
            result = response.json()
            predicted_class = result.get("class", "Unknown")
            confidence = result.get("confidence", 0)

            st.success(f"✅ Predicted Class: **{predicted_class}**")
            st.progress(confidence)
            st.write(f"**Confidence:** {confidence*100:.2f}%")

            # Add conditional color-coded message
            if confidence > 0.85:
                st.success("Model is highly confident in this prediction ✅")
            elif confidence > 0.60:
                st.warning("Prediction has moderate confidence ⚠️. Consider verifying with more images.")
            else:
                st.error("Model is uncertain ❌. Try uploading a clearer image.")

        else:
            st.error("⚠️ Could not get prediction from server. Please ensure backend is running.")

    except Exception as e:
        st.error(f"❌ An error occurred: {str(e)}")

# 📌 Footer
st.markdown("---")
st.markdown("💡 *Built with Streamlit & FastAPI | Deep Learning for Agriculture* 🌱")
