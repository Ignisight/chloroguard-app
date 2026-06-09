// photoguard — Client Application Logic

const API_URL = "http://localhost:8000";

// State Management
let selectedFile = null;
let metadata = null;
let lastServerResponse = null;

// DOM Elements
const systemStatusEl = document.getElementById("systemStatus");
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const dropZoneContent = document.getElementById("dropZoneContent");
const previewContainer = document.getElementById("previewContainer");
const imagePreview = document.getElementById("imagePreview");
const btnChangeImage = document.getElementById("btnChangeImage");
const btnAnalyze = document.getElementById("btnAnalyze");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");

// Content Cards
const idleCard = document.getElementById("idleCard");
const loadingCard = document.getElementById("loadingCard");
const resultCard = document.getElementById("resultCard");
const scannerPreview = document.getElementById("scannerPreview");

// Result Presentation Elements
const resCropName = document.getElementById("resCropName");
const resDiseaseName = document.getElementById("resDiseaseName");
const resSeverity = document.getElementById("resSeverity");
const resConfidence = document.getElementById("resConfidence");
const resConfidenceBar = document.getElementById("resConfidenceBar");
const resLeafMeta = document.getElementById("resLeafMeta");
const organicList = document.getElementById("organicList");
const chemicalList = document.getElementById("chemicalList");
const preventionList = document.getElementById("preventionList");

// Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

// Modals
const manualModal = document.getElementById("manualModal");
const safetyAlertModal = document.getElementById("safetyAlertModal");
const btnOpenManual = document.getElementById("btnOpenManual");
const btnCloseManualModal = document.getElementById("btnCloseManualModal");
const btnCloseSafetyModal = document.getElementById("btnCloseSafetyModal");

// Form Elements
const manualDiagnosisForm = document.getElementById("manualDiagnosisForm");
const manualCropSelect = document.getElementById("manualCropSelect");
const manualDiseaseSelect = document.getElementById("manualDiseaseSelect");
const btnForceAccept = document.getElementById("btnForceAccept");
const btnProceedManual = document.getElementById("btnProceedManual");
const safetyAlertMessage = document.getElementById("safetyAlertMessage");
const safetyReason = document.getElementById("safetyReason");
const safetyGuess = document.getElementById("safetyGuess");

// ── Startup & Initialization ────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    checkApiHealth();
    fetchMetadata();
    setupDragAndDrop();
    setupTabSwitching();
    setupModalListeners();
});

// Check server health
async function checkApiHealth() {
    try {
        const res = await fetch(`${API_URL}/`);
        const data = await res.json();
        if (data.status === "online") {
            systemStatusEl.innerHTML = `<span class="status-dot"></span> API: Online`;
            systemStatusEl.className = "system-status";
        } else {
            setOfflineStatus();
        }
    } catch (e) {
        setOfflineStatus();
    }
}

function setOfflineStatus() {
    systemStatusEl.innerHTML = `<span class="status-dot offline"></span> API: Offline`;
    systemStatusEl.className = "system-status offline";
}

// Fetch crop/disease list for manual entry
async function fetchMetadata() {
    try {
        const res = await fetch(`${API_URL}/metadata`);
        metadata = await res.json();
        populateCropDropdown();
    } catch (e) {
        console.error("Failed to load metadata hierarchy from API:", e);
    }
}

// ── Drag & Drop Handlers ─────────────────────────────────────
function setupDragAndDrop() {
    // Click on dropzone opens file picker
    dropZone.addEventListener("click", (e) => {
        // Prevent click trigger if change button is clicked
        if (e.target.closest("#btnChangeImage")) return;
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    // Drag events
    ["dragenter", "dragover"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
        }, false);
    });

    dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    btnChangeImage.addEventListener("click", (e) => {
        e.stopPropagation(); // Avoid triggering dropzone click
        resetUpload();
    });

    btnAnalyze.addEventListener("click", () => {
        if (selectedFile) {
            analyzeImage(selectedFile);
        }
    });
}

function handleFileSelection(file) {
    if (!file.type.match("image/jpeg") && !file.type.match("image/png") && !file.type.match("image/webp")) {
        alert("Please upload a valid image file (JPG, PNG, or WEBP).");
        return;
    }
    
    selectedFile = file;
    
    // Read file for preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        scannerPreview.src = e.target.result;
        dropZoneContent.style.display = "none";
        previewContainer.style.display = "block";
        btnAnalyze.disabled = false;
    };
    reader.readAsDataURL(file);
}

function resetUpload() {
    selectedFile = null;
    fileInput.value = "";
    imagePreview.src = "";
    scannerPreview.src = "";
    previewContainer.style.display = "none";
    dropZoneContent.style.display = "flex";
    btnAnalyze.disabled = true;
    showIdleState();
}

// ── UI States ────────────────────────────────────────────────
function showIdleState() {
    idleCard.style.display = "flex";
    loadingCard.style.display = "none";
    resultCard.style.display = "none";
}

function showLoadingState() {
    idleCard.style.display = "none";
    loadingCard.style.display = "flex";
    resultCard.style.display = "none";
    
    // Disable buttons
    btnAnalyze.disabled = true;
    btnText.style.display = "none";
    spinner.style.display = "inline-block";
}

function stopLoadingState() {
    btnAnalyze.disabled = false;
    btnText.style.display = "inline";
    spinner.style.display = "none";
}

// ── API Inference Request ────────────────────────────────────
async function analyzeImage(file) {
    showLoadingState();
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Server returned error: ${response.statusText}`);
        }
        
        const result = await response.json();
        lastServerResponse = result;
        
        // Short artificial delay so scanning animation feels tactile
        setTimeout(() => {
            stopLoadingState();
            
            if (result.is_agricultural_leaf) {
                renderResult(result);
            } else {
                // Safety filter triggered
                showSafetyAlert(result);
            }
        }, 1500);
        
    } catch (e) {
        stopLoadingState();
        showIdleState();
        alert(`Failed to analyze image: ${e.message}. Make sure your local API is running on ${API_URL}`);
    }
}

// Render prediction result on screen
function renderResult(result) {
    idleCard.style.display = "none";
    loadingCard.style.display = "none";
    resultCard.style.display = "flex";
    
    resCropName.innerText = result.crop;
    resDiseaseName.innerText = result.disease_name;
    
    // Set confidence
    const confPercentage = (result.confidence * 100).toFixed(1);
    resConfidence.innerText = `${confPercentage}%`;
    resConfidenceBar.style.width = `${confPercentage}%`;
    
    // Set severity badge
    const severity = result.report.severity.toLowerCase();
    resSeverity.innerText = `${result.report.severity} Severity`;
    resSeverity.className = `severity-badge ${severity}`;
    
    // Set leaf ratio meta text
    const leafRatioPct = (result.leaf_ratio * 100).toFixed(1);
    resLeafMeta.innerHTML = `<i class="fa-solid fa-circle-check"></i> Verified Agricultural Leaf (${leafRatioPct}% leaf color profile)`;
    resLeafMeta.className = "verification-meta";
    
    // Populate tabs
    populateList(organicList, result.report.organic);
    populateList(chemicalList, result.report.chemical);
    populateList(preventionList, result.report.prevention);
    
    // Reset tabs to organic active
    switchTab("organic");
}

function populateList(ulElement, items) {
    ulElement.innerHTML = "";
    if (items.length === 0) {
        const li = document.createElement("li");
        li.innerText = "No specific guidelines available.";
        ulElement.appendChild(li);
    } else {
        items.forEach(item => {
            const li = document.createElement("li");
            li.innerText = item;
            ulElement.appendChild(li);
        });
    }
}

// ── Tab Management ───────────────────────────────────────────
function setupTabSwitching() {
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.getAttribute("data-tab");
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    tabBtns.forEach(b => {
        if (b.getAttribute("data-tab") === tabName) {
            b.classList.add("active");
        } else {
            b.classList.remove("active");
        }
    });
    
    tabPanes.forEach(pane => {
        if (pane.id === `tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`) {
            pane.classList.add("active");
        } else {
            pane.classList.remove("active");
        }
    });
}

// ── Safety Filter Modal ──────────────────────────────────────
function showSafetyAlert(result) {
    const leafRatioPct = (result.leaf_ratio * 100).toFixed(1);
    const confPercentage = (result.confidence * 100).toFixed(1);
    
    safetyReason.innerText = `Leaf color profile ratio is low (${leafRatioPct}% vs min 10.0%)`;
    safetyGuess.innerText = `${result.label} (${confPercentage}% confidence)`;
    
    safetyAlertModal.classList.add("active");
}

// ── Manual Modal Dropdown Populate ───────────────────────────
function populateCropDropdown() {
    if (!metadata) return;
    
    manualCropSelect.innerHTML = `<option value="" disabled selected>Choose a crop...</option>`;
    metadata.crops.sort().forEach(crop => {
        const opt = document.createElement("option");
        opt.value = crop;
        opt.innerText = crop;
        manualCropSelect.appendChild(opt);
    });
    
    manualCropSelect.addEventListener("change", () => {
        const selectedCrop = manualCropSelect.value;
        populateDiseaseDropdown(selectedCrop);
    });
}

function populateDiseaseDropdown(crop) {
    if (!metadata || !metadata.crop_diseases[crop]) return;
    
    manualDiseaseSelect.innerHTML = `<option value="" disabled selected>Choose symptoms...</option>`;
    metadata.crop_diseases[crop].sort().forEach(disease => {
        const opt = document.createElement("option");
        opt.value = disease;
        opt.innerText = disease;
        manualDiseaseSelect.appendChild(opt);
    });
    
    manualDiseaseSelect.disabled = false;
}

// ── Modal Listeners & Actions ────────────────────────────────
function setupModalListeners() {
    // Open Manual Modal
    btnOpenManual.addEventListener("click", () => {
        manualModal.classList.add("active");
    });
    
    // Close Manual Modal
    btnCloseManualModal.addEventListener("click", () => {
        manualModal.classList.remove("active");
        manualDiagnosisForm.reset();
        manualDiseaseSelect.disabled = true;
    });
    
    // Close Safety Modal
    btnCloseSafetyModal.addEventListener("click", () => {
        safetyAlertModal.classList.remove("remove");
        safetyAlertModal.classList.remove("active");
    });
    
    // Manual Form Submission
    manualDiagnosisForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const crop = manualCropSelect.value;
        const disease = manualDiseaseSelect.value;
        
        manualModal.classList.remove("active");
        
        try {
            const res = await fetch(`${API_URL}/manual-diagnose`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ crop, disease })
            });
            
            if (!res.ok) throw new Error("Remedy info not found");
            const report = await res.json();
            
            // Render manual report
            renderManualReport(report);
            
        } catch (err) {
            alert(`Error loading manual report: ${err.message}`);
        }
    });
    
    // Force prediction override from safety warning
    btnForceAccept.addEventListener("click", () => {
        safetyAlertModal.classList.remove("active");
        if (lastServerResponse) {
            renderResult(lastServerResponse);
            // Customize leaf meta with warnings
            const leafRatioPct = (lastServerResponse.leaf_ratio * 100).toFixed(1);
            resLeafMeta.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Manual Override Accepted (Borderline leaf profile: ${leafRatioPct}%)`;
            resLeafMeta.className = "verification-meta warning";
        }
    });
    
    // Switch to manual mode from safety warning
    btnProceedManual.addEventListener("click", () => {
        safetyAlertModal.classList.remove("active");
        manualModal.classList.add("active");
    });
}

function renderManualReport(report) {
    idleCard.style.display = "none";
    loadingCard.style.display = "none";
    resultCard.style.display = "flex";
    
    resCropName.innerText = report.crop;
    resDiseaseName.innerText = report.disease;
    
    // Manual inputs have 100% confidence
    resConfidence.innerText = "Manual Input";
    resConfidenceBar.style.width = "100%";
    
    const severity = report.severity.toLowerCase();
    resSeverity.innerText = `${report.severity} Severity`;
    resSeverity.className = `severity-badge ${severity}`;
    
    resLeafMeta.innerHTML = `<i class="fa-solid fa-keyboard"></i> Manual Database Entry (Remedies & Guidelines Checked)`;
    resLeafMeta.className = "verification-meta";
    
    populateList(organicList, report.organic);
    populateList(chemicalList, report.chemical);
    populateList(preventionList, report.prevention);
    
    switchTab("organic");
}
