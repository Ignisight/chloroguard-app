# Remedies and recommendations for 38 classes of PlantVillage dataset
DISEASE_INFO = {
    "Apple Scab": {
        "crop": "Apple",
        "disease": "Scab (Venturia inaequalis)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Rake and destroy fallen leaves in autumn to reduce overwintering spores.",
            "Apply neem oil or copper soap spray early in the season.",
            "Prune branches to improve air circulation and speed up leaf drying."
        ],
        "chemical": [
            "Apply preventative fungicides containing Captan, Mancozeb, or Myclobutanil at green tip stage."
        ],
        "prevention": [
            "Plant resistant apple varieties (e.g., Liberty, Enterprise, Freedom).",
            "Keep the ground clean beneath apple trees.",
            "Water at the base of the tree rather than wetting foliage."
        ]
    },
    "Apple with Black Rot": {
        "crop": "Apple",
        "disease": "Black Rot (Botryosphaeria obtusa)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Prune out dead wood, cankers, and mummified fruit during the dormant season.",
            "Dispose of all infected wood by burning or burying it deep.",
            "Apply organic copper-based sprays."
        ],
        "chemical": [
            "Apply fungicides like Captan, Thiophanate-methyl, or Mancozeb starting at bud break."
        ],
        "prevention": [
            "Control insect damage to prevent entry wounds for the fungus.",
            "Ensure proper pruning to maintain open canopy."
        ]
    },
    "Cedar Apple Rust": {
        "crop": "Apple",
        "disease": "Cedar Apple Rust (Gymnosporangium juniperi-virginianae)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Remove nearby infected red cedars or junipers if possible.",
            "Pick off and destroy leaf galls before they release spores.",
            "Spray copper fungicides or sulfur as leaves emerge."
        ],
        "chemical": [
            "Use preventative fungicides containing Myclobutanil or Chlorothalonil early in the spring."
        ],
        "prevention": [
            "Grow rust-resistant apple cultivars.",
            "Do not plant apple trees within a few hundred yards of eastern red cedar trees."
        ]
    },
    "Healthy Apple": {
        "crop": "Apple",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Maintain current watering and composting schedule."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Continue regular pruning, proper spacing, and seasonal cleanups."]
    },
    "Healthy Blueberry Plant": {
        "crop": "Blueberry",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Ensure soil pH remains acidic (4.5–5.2) by adding peat moss or pine needles."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Monitor for insects and keep birds away with netting."]
    },
    "Cherry with Powdery Mildew": {
        "crop": "Cherry",
        "disease": "Powdery Mildew (Podosphaera clandestina)",
        "healthy": False,
        "severity": "Low",
        "organic": [
            "Apply potassium bicarbonate sprays or milk-water mixtures (40% milk, 60% water) under sunlight.",
            "Spray neem oil or horticultural oils on infected leaves."
        ],
        "chemical": [
            "Apply fungicides containing Myclobutanil, Triadimefon, or Sulfur at the first sign of mildew."
        ],
        "prevention": [
            "Prune trees to open up the canopy for better sunlight and wind penetration.",
            "Avoid overhead irrigation."
        ]
    },
    "Healthy Cherry Plant": {
        "crop": "Cherry",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Maintain mulching and deep root watering."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Prune annually during dormancy and inspect for aphids or fungal spores regularly."]
    },
    "Corn (Maize) with Cercospora and Gray Leaf Spot": {
        "crop": "Corn (Maize)",
        "disease": "Gray Leaf Spot (Cercospora zeae-maydis)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Till under infected crop residue to accelerate decomposition of the fungus.",
            "Rotate crops with non-grass species (like soybeans) for at least one year."
        ],
        "chemical": [
            "Apply foliar fungicides such as Strobilurins (e.g., Pyraclostrobin) or Triazoles when weather is warm and humid."
        ],
        "prevention": [
            "Select hybrids with high resistance scores for Gray Leaf Spot.",
            "Manage field drainage to avoid prolonged leaf wetness."
        ]
    },
    "Corn (Maize) with Common Rust": {
        "crop": "Corn (Maize)",
        "disease": "Common Rust (Puccinia sorghi)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Destroy infected leaves and stalks.",
            "Rotate crops annually."
        ],
        "chemical": [
            "Use fungicides containing Strobilurin or Triazole if rust appears early on the ears."
        ],
        "prevention": [
            "Plant rust-resistant corn hybrids.",
            "Plant early in the season to avoid high-temperature spore dispersal cycles."
        ]
    },
    "Corn (Maize) with Northern Leaf Blight": {
        "crop": "Corn (Maize)",
        "disease": "Northern Leaf Blight (Exserohilum turcicum)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Incorporate crop residue into the soil after harvest.",
            "Implement a strict crop rotation plan."
        ],
        "chemical": [
            "Apply protective fungicides (e.g., Azoxystrobin, Propiconazole) if lesions appear before silking."
        ],
        "prevention": [
            "Utilize hybrids with Ht genes for resistance.",
            "Ensure proper spacing to increase air movement."
        ]
    },
    "Healthy Corn (Maize) Plant": {
        "crop": "Corn (Maize)",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Apply balanced organic fertilizers (high in nitrogen during early growth)."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Practice crop rotation and keep weeds down to avoid pest vectors."]
    },
    "Grape with Black Rot": {
        "crop": "Grape",
        "disease": "Black Rot (Guignardia bidwellii)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Prune infected vines and remove mummified grapes from the trellis.",
            "Apply copper sprays before and after bloom."
        ],
        "chemical": [
            "Apply fungicides like Mancozeb, Ziram, or Myclobutanil starting at bud break until 4 weeks post-bloom."
        ],
        "prevention": [
            "Keep canopy open to sunlight.",
            "Keep trellis rows clean of weeds and debris."
        ]
    },
    "Grape with Esca (Black Measles)": {
        "crop": "Grape",
        "disease": "Esca / Black Measles (Phaeomoniella chlamydospora / Phaeoacremonium minimum)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Protect pruning wounds with organic paint or Trichoderma-based formulations.",
            "Remove and burn severely infected vines to protect the vineyard."
        ],
        "chemical": [
            "No direct chemical cure exists; protect pruning wounds with wound sealants containing fungicides."
        ],
        "prevention": [
            "Avoid pruning in wet, rainy weather when fungal spores are active.",
            "Sanitize pruning shears between vines with alcohol or bleach solution."
        ]
    },
    "Grape with Isariopsis Leaf Spot": {
        "crop": "Grape",
        "disease": "Isariopsis Leaf Spot (Pseudocercospora vitis)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Remove and destroy infected leaves.",
            "Apply sulfur or copper fungicides to the foliage."
        ],
        "chemical": [
            "Apply protective fungicides such as Mancozeb or Chlorothalonil early in the wet season."
        ],
        "prevention": [
            "Ensure proper vine spacing and air circulation.",
            "Avoid watering vines from above."
        ]
    },
    "Healthy Grape Plant": {
        "crop": "Grape",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Apply organic mulch around the root zone and prune annually during winter dormancy."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Prune correctly to keep fruit and leaves well ventilated."]
    },
    "Orange with Citrus Greening": {
        "crop": "Orange",
        "disease": "Citrus Greening / Huanglongbing (Candidatus Liberibacter asiaticus)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Remove and destroy infected trees immediately to prevent spread.",
            "Control Asian Citrus Psyllid (vector) using neem oil or insecticidal soaps.",
            "Boost tree health with micronutrients (zinc, iron, manganese)."
        ],
        "chemical": [
            "Apply systemic insecticides (e.g., Imidacloprid) to control psyllids.",
            "Use antibiotic trunk injections (where permitted and managed by professionals)."
        ],
        "prevention": [
            "Use only certified disease-free nursery stock.",
            "Inspect trees frequently for yellow shoots and asymmetrical leaf mottling."
        ]
    },
    "Peach with Bacterial Spot": {
        "crop": "Peach",
        "disease": "Bacterial Spot (Xanthomonas arboricola pv. pruni)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Apply copper-based bactericides during dormancy in late autumn and early spring."
        ],
        "chemical": [
            "Apply Oxytetracycline (Mycoshield) during the growing season according to local regulations."
        ],
        "prevention": [
            "Plant resistant cultivars (e.g., Redhaven, Challenger).",
            "Avoid excessive nitrogen fertilization, which produces highly susceptible tender growth."
        ]
    },
    "Healthy Peach Plant": {
        "crop": "Peach",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Apply rich compost around the dripline in spring."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Thin out fruits in early summer to prevent branch breakages and improve fruit size/aeration."]
    },
    "Bell Pepper with Bacterial Spot": {
        "crop": "Bell Pepper",
        "disease": "Bacterial Spot (Xanthomonas campestris pv. vesicatoria)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Apply copper-based sprays at first sign of symptoms.",
            "Remove and destroy infected plants and debris immediately."
        ],
        "chemical": [
            "Apply copper mixed with Mancozeb to increase effectiveness."
        ],
        "prevention": [
            "Use pathogen-free seeds and transplants.",
            "Avoid overhead irrigation; use drip hoses instead.",
            "Rotate crops away from solanaceous plants (tomatoes, peppers, potatoes) for at least two years."
        ]
    },
    "Healthy Bell Pepper Plant": {
        "crop": "Bell Pepper",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Ensure steady soil moisture and feed with calcium-rich organic fertilizer to prevent blossom end rot."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Mulch the soil surface to retain moisture and suppress weeds."]
    },
    "Potato with Early Blight": {
        "crop": "Potato",
        "disease": "Early Blight (Alternaria solani)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Remove and destroy infected lower leaves.",
            "Apply copper-based organic sprays or Bacillus subtilis formulations."
        ],
        "chemical": [
            "Apply protectant fungicides like Chlorothalonil or Mancozeb at 7-10 day intervals."
        ],
        "prevention": [
            "Ensure proper crop rotation (3 years without potatoes or tomatoes).",
            "Keep plants healthy with balanced nutrition to resist infection."
        ]
    },
    "Potato with Late Blight": {
        "crop": "Potato",
        "disease": "Late Blight (Phytophthora infestans)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Destroy all infected plant parts; do not compost them.",
            "Apply copper fungicides preemptively during wet, cool forecast windows."
        ],
        "chemical": [
            "Spray systemic fungicides (e.g., Mefenoxam, Cymoxanil) immediately upon discovery or high alert."
        ],
        "prevention": [
            "Always use certified disease-free seed tubers.",
            "Avoid sprinkler irrigation, especially in late afternoon.",
            "Harvest only after vines are dead to prevent tuber infection."
        ]
    },
    "Healthy Potato Plant": {
        "crop": "Potato",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Hill soil around the base of the plants to protect developing tubers from sun exposure."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Practice 3-year crop rotation and space rows properly for ventilation."]
    },
    "Healthy Raspberry Plant": {
        "crop": "Raspberry",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Provide support trellises and prune spent floricanes immediately after summer harvest."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Clear fallen leaves and old mulch to prevent overwintering pests."]
    },
    "Healthy Soybean Plant": {
        "crop": "Soybean",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["No treatment required; monitor for leaf beetle damage."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Rotate crops with corn and maintain weed control."]
    },
    "Squash with Powdery Mildew": {
        "crop": "Squash",
        "disease": "Powdery Mildew (Podosphaera xanthii)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Spray with a mixture of baking soda (1 tbsp), horticultural oil (1 tbsp), and water (1 gallon).",
            "Spray sulfur or copper soaps on the leaves."
        ],
        "chemical": [
            "Apply preventative fungicides containing Potassium Bicarbonate or Myclobutanil."
        ],
        "prevention": [
            "Plant squash in full sun and space them well.",
            "Select powdery mildew-resistant squash varieties."
        ]
    },
    "Strawberry with Leaf Scorch": {
        "crop": "Strawberry",
        "disease": "Leaf Scorch (Diplocarpon earlianum)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Rake and destroy old leaf debris post-harvest.",
            "Apply organic copper sprays before blooms appear."
        ],
        "chemical": [
            "Apply fungicides such as Captan or Thiophanate-methyl if disease is severe."
        ],
        "prevention": [
            "Plant resistant strawberry cultivars.",
            "Avoid overhead irrigation, particularly overnight.",
            "Renovate strawberry beds annually."
        ]
    },
    "Healthy Strawberry Plant": {
        "crop": "Strawberry",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Mulch with clean straw to keep berries off the damp soil, reducing rot."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Remove runners to focus plant energy on fruit production and keep beds clean."]
    },
    "Tomato with Bacterial Spot": {
        "crop": "Tomato",
        "disease": "Bacterial Spot (Xanthomonas perforans)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Apply organic copper fungicide sprays at first sign of spots.",
            "Remove lower branches to minimize soil splash."
        ],
        "chemical": [
            "Apply copper-mancozeb tank mixes for enhanced control."
        ],
        "prevention": [
            "Use certified disease-free seeds.",
            "Drip irrigate and avoid touching wet foliage.",
            "Rotate crops out of nightshades for 2 years."
        ]
    },
    "Tomato with Early Blight": {
        "crop": "Tomato",
        "disease": "Early Blight (Alternaria solani)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Prune off lower leaves up to 1-2 feet high to avoid soil splash.",
            "Mulch heavily under the plants.",
            "Apply copper fungicide or Serenade (Bacillus subtilis)."
        ],
        "chemical": [
            "Apply Chlorothalonil or Mancozeb weekly during humid, wet weather."
        ],
        "prevention": [
            "Space plants at least 2-3 feet apart.",
            "Practice crop rotation.",
            "Water at the base of the plant."
        ]
    },
    "Tomato with Late Blight": {
        "crop": "Tomato",
        "disease": "Late Blight (Phytophthora infestans)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Pull out and burn or bag the entire plant if late blight is confirmed; do not compost.",
            "Spray copper fungicides preemptively when weather forecasts show cool, damp conditions."
        ],
        "chemical": [
            "Spray systemic fungicides containing Chlorothalonil, Pyraclostrobin, or Famoxadone immediately."
        ],
        "prevention": [
            "Avoid planting near potatoes, which can harbor the same pathogen.",
            "Ensure excellent air movement and full sun."
        ]
    },
    "Tomato with Leaf Mold": {
        "crop": "Tomato",
        "disease": "Leaf Mold (Passalora fulva)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Reduce greenhouse humidity below 85% using fans and ventilation.",
            "Prune tomatoes to optimize air flow."
        ],
        "chemical": [
            "Apply fungicides like Chlorothalonil or Mancozeb if infestation is critical."
        ],
        "prevention": [
            "Plant resistant tomato cultivars.",
            "Maintain warm greenhouse temperatures and avoid evening watering."
        ]
    },
    "Tomato with Septoria Leaf Spot": {
        "crop": "Tomato",
        "disease": "Septoria Leaf Spot (Septoria lycopersici)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Remove infected lower leaves immediately.",
            "Mulch beneath plants to block spores from splashing up.",
            "Spray copper fungicide or organic bio-fungicides."
        ],
        "chemical": [
            "Use protectant fungicides like Chlorothalonil or Mancozeb on a strict schedule."
        ],
        "prevention": [
            "Rotate crops annually.",
            "Prune suckers and branches to keep canopy dry."
        ]
    },
    "Tomato with Spider Mites or Two-spotted Spider Mite": {
        "crop": "Tomato",
        "disease": "Spider Mites (Tetranychus urticae)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Spray leaves vigorously with water to wash mites off.",
            "Apply neem oil, rosemary oil, or insecticidal soap.",
            "Introduce beneficial predatory mites (e.g., Phytoseiulus persimilis)."
        ],
        "chemical": [
            "Apply miticides (e.g., Abamectin or Spiromesifen) if organic remedies fail; rotate miticide classes to avoid resistance."
        ],
        "prevention": [
            "Keep dust levels down around plants (mites thrive in dry, dusty conditions).",
            "Keep plants well-hydrated to resist stress."
        ]
    },
    "Tomato with Target Spot": {
        "crop": "Tomato",
        "disease": "Target Spot (Corynespora cassiicola)",
        "healthy": False,
        "severity": "Medium",
        "organic": [
            "Remove affected leaves to reduce spore load.",
            "Apply copper-based sprays or bio-fungicides."
        ],
        "chemical": [
            "Spray fungicides containing Strobilurin or Boscalid."
        ],
        "prevention": [
            "Avoid overhead irrigation.",
            "Keep weeds managed in and around tomato patches."
        ]
    },
    "Tomato Yellow Leaf Curl Virus": {
        "crop": "Tomato",
        "disease": "Yellow Leaf Curl Virus (TYLCV - transmitted by Whiteflies)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Cover plants with fine insect netting to exclude whiteflies.",
            "Hang yellow sticky traps around plants to catch whiteflies.",
            "Apply insecticidal soap or neem oil to control whitefly populations."
        ],
        "chemical": [
            "Use systemic insecticides (e.g., Imidacloprid, Acetamiprid) on young plants to manage whiteflies."
        ],
        "prevention": [
            "Plant TYLCV-resistant varieties.",
            "Remove infected plants immediately to prevent they serve as a virus source for healthy plants."
        ]
    },
    "Tomato Mosaic Virus": {
        "crop": "Tomato",
        "disease": "Mosaic Virus (ToMV)",
        "healthy": False,
        "severity": "High",
        "organic": [
            "Uproot and destroy infected plants; do not compost.",
            "Wash hands and tools with soap and hot water after handling plants.",
            "Soak tools in a 20% dry milk solution to deactivate the virus."
        ],
        "chemical": [
            "No chemical cure exists for viral plant diseases; management focuses strictly on prevention and eradication of infected hosts."
        ],
        "prevention": [
            "Purchase certified virus-free seeds.",
            "Do not smoke or handle tobacco near tomato plants, as the virus can be carried on tobacco products."
        ]
    },
    "Healthy Tomato Plant": {
        "crop": "Tomato",
        "disease": "None",
        "healthy": True,
        "severity": "Low",
        "organic": ["Mulch with straw, water consistently, and support with stakes or cages."],
        "chemical": ["No chemical treatment required."],
        "prevention": ["Prune lower leaves to improve ventilation and avoid planting in the same spot next year."]
    }
}
