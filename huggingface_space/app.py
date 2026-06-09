import os
import io
import numpy as np
from PIL import Image
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
import gradio as gr

# Try to load remedies from local directory
try:
    from remedies import DISEASE_INFO
except ImportError:
    # Inline fallback database if remedies.py is missing (to ensure it works under all circumstances)
    DISEASE_INFO = {
        "Potato with Late Blight": {
            "crop": "Potato",
            "disease": "Late Blight (Phytophthora infestans)",
            "healthy": False,
            "severity": "High",
            "organic": ["Destroy infected parts.", "Apply organic copper spray preemptively."],
            "chemical": ["Apply systemic fungicides (Mefenoxam, Cymoxanil) immediately."],
            "prevention": ["Use certified disease-free seeds.", "Avoid sprinkler irrigation in the afternoon."]
        }
    }

PROCESSOR_NAME = "google/mobilenet_v2_1.0_224"
MODEL_NAME = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

# ── Load model at startup ────────────────────────────────────
print("Loading model and processor...")
try:
    processor = AutoImageProcessor.from_pretrained(PROCESSOR_NAME)
    model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"⚠️ Failed to load model: {e}. Running with mock fallback.")
    processor = None
    model = None

# ── Leaf Verification Check ──────────────────────────────────
def check_is_leaf(image: Image.Image) -> tuple[bool, float]:
    """Analyzes HSV color channels to see if leaf color ratio meets minimum threshold."""
    hsv = image.convert("HSV")
    hsv_np = np.array(hsv)
    h, s, v = hsv_np[:, :, 0], hsv_np[:, :, 1], hsv_np[:, :, 2]

    # Green leaves: H: 42 to 120 (60-170 deg)
    # Yellow/Brown: H: 7 to 42 (10-60 deg)
    leaf_mask = (
        ((h >= 7) & (h <= 125)) &
        (s > 30) &
        (v > 30)
    )
    leaf_ratio = float(np.sum(leaf_mask) / leaf_mask.size)
    return (leaf_ratio >= 0.10), leaf_ratio

# ── Automated Predict Function ────────────────────────────────
def predict_foliage(image):
    if image is None:
        return "⚠️ Please upload an image.", None, {}

    # Convert PIL Image
    pil_img = Image.fromarray(image).convert("RGB")
    
    # 1. Check Leaf Presence
    is_leaf, leaf_ratio = check_is_leaf(pil_img)
    leaf_pct = leaf_ratio * 100
    
    # Fallback if model failed to load
    if model is None or processor is None:
        return (
            f"⚠️ Model not loaded. Color check result: {'Valid Leaf' if is_leaf else 'Not a leaf'} ({leaf_pct:.1f}% leaf pixels).",
            None,
            {"error": "Model offline"}
        )

    # 2. Run Inference
    inputs = processor(images=pil_img, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        
    probs = torch.softmax(logits, dim=-1)[0]
    top_idx = int(probs.argmax(-1).item())
    confidence = float(probs[top_idx].item())
    label = model.config.id2label[str(top_idx)]
    
    # 3. Apply safety filter threshold
    is_agricultural_leaf = is_leaf and (confidence >= 0.40)
    
    # Retrieve remedies
    info = DISEASE_INFO.get(label)
    if not info:
        # Fallback details if not found in db
        info = {
            "crop": label.split(" ")[0] if " " in label else label,
            "disease": label,
            "healthy": "healthy" in label.lower(),
            "severity": "Medium",
            "organic": ["Maintain good agricultural ventilation."],
            "chemical": ["Consult local agricultural extension for chemical controls."],
            "prevention": ["Prune and clear plant debris."]
        }
        
    # Format remedy response
    remedy_text = (
        f"### 🌱 Diagnosis Report: **{info['crop']} — {info['disease']}**\n"
        f"**Status:** {'🟢 Healthy' if info['healthy'] else '🔴 Diseased'} | **Severity:** {info['severity']}\n"
        f"**Color Profile Leaf Ratio:** {leaf_pct:.1f}% | **Inference Confidence:** {confidence*100:.1f}%\n\n"
    )
    
    if not is_agricultural_leaf:
        warning_msg = (
            "### ⚠️ Safety Filter Alert\n"
            "This image does not resemble an agricultural plant leaf. "
            "Confidence was too low or leaf colors were missing.\n\n"
            "If you want to view the diagnosis anyway, see the override below.\n"
        )
        return warning_msg + remedy_text, "Low Confidence/Invalid Leaf", info
        
    # Standard output format
    details = (
        f"#### 🍃 Organic Remedies:\n" + "\n".join([f"- {r}" for r in info['organic']]) + "\n\n"
        f"#### 🧪 Chemical Treatments:\n" + "\n".join([f"- {c}" for c in info['chemical']]) + "\n\n"
        f"#### 🛡️ Prevention Guidelines:\n" + "\n".join([f"- {p}" for p in info['prevention']])
    )
    
    return remedy_text + details, label, info

# ── Manual Lookup Function ────────────────────────────────────
def manual_lookup(crop, disease):
    if not crop or not disease:
        return "Please select both a crop and a disease symptoms option."
        
    matched_info = None
    for class_name, info in DISEASE_INFO.items():
        if info["crop"] == crop and info["disease"] == disease:
            matched_info = info
            break
            
    if not matched_info:
        return f"No record found in database for {crop} and {disease}."
        
    report = (
        f"### 📋 Manual Report: **{matched_info['crop']} — {matched_info['disease']}**\n"
        f"**Severity:** {matched_info['severity']}\n\n"
        f"#### 🍃 Organic Remedies:\n" + "\n".join([f"- {r}" for r in matched_info['organic']]) + "\n\n"
        f"#### 🧪 Chemical Treatments:\n" + "\n".join([f"- {c}" for c in matched_info['chemical']]) + "\n\n"
        f"#### 🛡️ Prevention Guidelines:\n" + "\n".join([f"- {p}" for p in matched_info['prevention']])
    )
    return report

# Load metadata helper
crops_list = []
diseases_map = {}
if DISEASE_INFO:
    for c_name, info in DISEASE_INFO.items():
        crop = info["crop"]
        disease = info["disease"]
        if crop not in crops_list:
            crops_list.append(crop)
        if crop not in diseases_map:
            diseases_map[crop] = []
        if disease not in diseases_map[crop]:
            diseases_map[crop].append(disease)
            
crops_list.sort()

# ── Gradio Block Interface ───────────────────────────────────
theme = gr.themes.Soft(
    primary_hue="emerald",
    secondary_hue="slate",
)

with gr.Blocks(
    title="photoguard — Crop Leaf Safety & Disease Prediction",
    theme=theme,
    css=".gradio-container { max-width: 1000px !important; }"
) as demo:
    gr.Markdown(
        """
        # 🍃 photoguard
        **Crop Leaf Verification & Disease Diagnosis System**
        
        This system first validates if the image is an agricultural leaf, runs fine-tuned **MobileNetV2** (PlantVillage, 38 classes) and exposes treatment remedies.
        """
    )
    
    with gr.Tab("🔍 Auto Diagnosis"):
        with gr.Row():
            with gr.Column():
                input_image = gr.Image(label="Upload Leaf Photo", type="numpy")
                btn_diagnose = gr.Button("Analyze Leaf", variant="primary")
            with gr.Column():
                output_md = gr.Markdown(label="Report Output", value="*Diagnosis will appear here after analysis.*")
                output_label = gr.Textbox(label="Predicted Class Output", interactive=False)
                
        btn_diagnose.click(
            fn=predict_foliage,
            inputs=[input_image],
            outputs=[output_md, output_label],
            api_name="predict"
        )
        
    with gr.Tab("📋 Manual Remedy Lookup"):
        gr.Markdown("Select crop plant and symptom state manually to retrieve immediate organic & chemical remedies.")
        with gr.Row():
            with gr.Column():
                crop_select = gr.Dropdown(choices=crops_list, label="Select Crop Plant")
                disease_select = gr.Dropdown(choices=[], label="Select Symptoms / Disease", interactive=False)
                btn_lookup = gr.Button("Generate Report")
            with gr.Column():
                manual_output = gr.Markdown(value="*Remedy report will appear here.*")
                
        def update_diseases(selected_crop):
            if not selected_crop or selected_crop not in diseases_map:
                return gr.update(choices=[], interactive=False)
            return gr.update(choices=sorted(diseases_map[selected_crop]), interactive=True)
            
        crop_select.change(fn=update_diseases, inputs=crop_select, outputs=disease_select)
        
        btn_lookup.click(
            fn=manual_lookup,
            inputs=[crop_select, disease_select],
            outputs=manual_output
        )

if __name__ == "__main__":
    demo.launch()
