import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Image, ScrollView,
  TextInput, ActivityIndicator, Modal, Alert, Dimensions,
  SafeAreaView, StatusBar as RNStatusBar, KeyboardAvoidingView,
  Platform, Linking, FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface RemedyReport {
  crop: string; disease: string; healthy: boolean; severity: string;
  organic: string[]; chemical: string[]; prevention: string[];
}
interface PredictionResponse {
  is_agricultural_leaf: boolean; leaf_ratio: number; confidence: number;
  label: string; crop: string; disease_name: string; message: string;
  report?: RemedyReport;
}
interface ChatMessage {
  id: string; role: 'user' | 'ai'; text: string; timestamp: Date;
}

// ─── App ─────────────────────────────────────────────────────────────────────

type AppTab = 'scanner' | 'manual' | 'chat';

export default function App() {
  // Server config
  const getApiBaseUrl = () => `https://chloroguard-backend.onrender.com`;
  const [connectionStatus, setConnectionStatus] = useState<'idle'|'checking'|'connected'|'failed'>('idle');

  // Scanner
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [forceProceed, setForceProceed] = useState(false);

  // Manual
  const [metadata, setMetadata] = useState<{ crops: string[]; crop_diseases: Record<string, string[]> } | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [manualReport, setManualReport] = useState<RemedyReport | null>(null);
  const [fetchingManual, setFetchingManual] = useState(false);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [diseaseModalVisible, setDiseaseModalVisible] = useState(false);

  // Remedy tabs
  const [activeTab, setActiveTab] = useState<'organic'|'chemical'|'prevention'>('organic');

  // AI Chat
  const [activeAppTab, setActiveAppTab] = useState<AppTab>('scanner');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'ai', text: '🌿 Hello! I\'m ChloroGuard AI. Ask me anything about plant diseases, treatments, or crop health. I can also help you find YouTube tutorials!', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<FlatList>(null);

  // Duplicate removed
  // Get scan context to send to AI
  const getScanContext = () => {
    if (prediction) return `${prediction.crop} — ${prediction.disease_name} detected at ${(prediction.confidence * 100).toFixed(1)}% confidence`;
    if (manualReport) return `${manualReport.crop} — ${manualReport.disease} (manually selected)`;
    return null;
  };

  const fetchMetadata = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/metadata`);
      if (res.ok) {
        setMetadata(await res.json());
      }
    } catch {}
  };

  useEffect(() => { 
    // Fetch metadata on startup. This silently wakes up the Render server in the background!
    fetchMetadata(); 
  }, []);

  // ── Image picker helpers ─────────────────────────────────────────
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access required.'); return; }
    const r = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4,4], quality: 0.8 });
    if (!r.canceled && r.assets?.length) { setSelectedImage(r.assets[0].uri); setPrediction(null); setForceProceed(false); }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Gallery access required.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4,4], quality: 0.8 });
    if (!r.canceled && r.assets?.length) { setSelectedImage(r.assets[0].uri); setPrediction(null); setForceProceed(false); }
  };

  // ── Diagnosis ────────────────────────────────────────────────────
  const startDiagnosis = async () => {
    if (!selectedImage) return;
    setDiagnosing(true);
    try {
      const fd = new FormData();
      fd.append('file', { uri: selectedImage, name: 'leaf.jpg', type: 'image/jpeg' } as any);
      const res = await fetch(`${getApiBaseUrl()}/predict`, { method: 'POST', headers: { Accept: 'application/json' }, body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data: PredictionResponse = await res.json();
      setPrediction(data); setActiveTab('organic');
    } catch (e: any) { Alert.alert('Diagnosis Failed', `${e.message}`); }
    finally { setDiagnosing(false); }
  };

  const fetchManualDiagnosis = async () => {
    if (!selectedCrop || !selectedDisease) return;
    setFetchingManual(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/manual-diagnose`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop: selectedCrop, disease: selectedDisease }),
      });
      if (!res.ok) throw new Error('Not found');
      setManualReport(await res.json()); setActiveTab('organic');
    } catch { Alert.alert('Error', 'Failed to fetch remedy data.'); }
    finally { setFetchingManual(false); }
  };

  // ── AI Chat ──────────────────────────────────────────────────────
  const sendChat = async (messageText?: string) => {
    const text = (messageText || chatInput).trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Sliding window memory: send only the last 4 messages to save bandwidth
      const historyWindow = chatMessages.slice(-4).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch(`${getApiBaseUrl()}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          context: getScanContext(),
          history: historyWindow
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const aiMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'ai', text: data.reply, timestamp: new Date() };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      const errMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'ai', text: `⚠️ Error: ${e.message}`, timestamp: new Date() };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatScrollRef.current?.scrollToEnd?.({ animated: true }), 200);
    }
  };

  const searchYouTube = (query: string) => {
    const q = encodeURIComponent(query);
    Linking.openURL(`https://www.youtube.com/results?search_query=${q}`);
  };

  const quickSearchYouTube = () => {
    if (prediction) {
      const cleanDisease = prediction.disease_name.replace(/ \([^)]+\)/g, '').replace(/_/g, ' ');
      const cleanCrop = prediction.crop.replace(/_/g, ' ');
      searchYouTube(`Treatment for ${cleanDisease} on ${cleanCrop}`);
    }
    else if (manualReport) {
      const cleanDisease = manualReport.disease.replace(/ \([^)]+\)/g, '').replace(/_/g, ' ');
      const cleanCrop = manualReport.crop.replace(/_/g, ' ');
      searchYouTube(`Treatment for ${cleanDisease} on ${cleanCrop}`);
    }
    else searchYouTube('Plant disease treatment methods');
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const getSeverityColor = (s: string) => {
    const l = s.toLowerCase();
    if (l === 'high') return '#ef4444';
    if (l === 'medium') return '#f59e0b';
    if (l === 'low') return '#3b82f6';
    return '#22c55e';
  };

  const renderRemedyReport = (report: RemedyReport) => {
    const items = activeTab === 'organic' ? report.organic : activeTab === 'chemical' ? report.chemical : report.prevention;
    return (
      <View style={s.remedyContainer}>
        <View style={s.tabBar}>
          {(['organic','chemical','prevention'] as const).map(tab => (
            <TouchableOpacity key={tab} style={[s.tabItem, activeTab === tab && { borderBottomColor: getSeverityColor(report.severity), borderBottomWidth: 2 }]} onPress={() => setActiveTab(tab)}>
              <Text style={[s.tabText, activeTab === tab && { color: getSeverityColor(report.severity) }]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.tabContentCard}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
            {items?.length > 0 ? items.map((item, i) => (
              <View key={i} style={s.remedyRow}>
                <Text style={[s.bullet, { color: getSeverityColor(report.severity) }]}>🌱</Text>
                <Text style={s.remedyText}>{item}</Text>
              </View>
            )) : <Text style={s.emptyText}>No recommendations available.</Text>}
          </ScrollView>
        </View>
        {/* YouTube Search Button */}
        <TouchableOpacity style={s.ytBtn} onPress={() => {
          const cleanDisease = report.disease.replace(/ \([^)]+\)/g, '').replace(/_/g, ' ');
          const cleanCrop = report.crop.replace(/_/g, ' ');
          searchYouTube(`How to treat ${cleanDisease} on ${cleanCrop}`);
        }}>
          <Text style={s.ytBtnText}>▶ Watch Treatment on YouTube</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar style="light" backgroundColor="#0e1a0f" />
      <View style={s.container}>

        {/* ── Header ─────────────────────────────────────────── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>CHLOROGUARD</Text>
            <Text style={s.headerSub}>Plant Disease Intelligence System</Text>
          </View>
        </View>

        {/* ── Tab Bar ────────────────────────────────────────── */}
        <View style={s.appTabBar}>
          {([['scanner','📷 Scanner'],['manual','📝 Manual'],['chat','🤖 AI Chat']] as [AppTab, string][]).map(([tab, label]) => (
            <TouchableOpacity key={tab} style={[s.appTab, activeAppTab === tab && s.activeAppTab]} onPress={() => setActiveAppTab(tab)}>
              <Text style={[s.appTabText, activeAppTab === tab && s.activeAppTabText]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══════════════════════════════════════════════════════
            SCANNER TAB
        ══════════════════════════════════════════════════════ */}
        {activeAppTab === 'scanner' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            {!selectedImage ? (
              <View style={s.dropzone}>
                <LinearGradient colors={['rgba(20,83,45,0.3)','rgba(10,18,9,0.1)']} style={s.dropzoneGrad}>
                  <Text style={{ fontSize: 60, marginBottom: 14 }}>🌿</Text>
                  <Text style={s.dropzoneTitle}>Scan a Leaf</Text>
                  <Text style={s.dropzoneSub}>Capture or select a crop leaf to detect diseases instantly</Text>
                  <View style={s.btnRow}>
                    <TouchableOpacity style={[s.actionBtn, s.cameraBtn]} onPress={takePhoto}><Text style={s.actionBtnText}>📷 Camera</Text></TouchableOpacity>
                    <TouchableOpacity style={[s.actionBtn, s.galleryBtn]} onPress={pickImage}><Text style={s.actionBtnText}>🖼️ Gallery</Text></TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ) : (
              <View style={s.previewCard}>
                <View style={s.imageWrap}>
                  <Image source={{ uri: selectedImage }} style={s.previewImg} />
                  <TouchableOpacity style={s.clearBtn} onPress={() => setSelectedImage(null)}>
                    <Text style={{ color: '#86efac', fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>
                </View>
                {!prediction && (
                  <TouchableOpacity style={[s.primaryBtn, diagnosing && s.disabledBtn]} onPress={startDiagnosis} disabled={diagnosing}>
                    {diagnosing
                      ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><ActivityIndicator size="small" color="#86efac" /><Text style={s.primaryBtnText}>Analyzing Leaf...</Text></View>
                      : <Text style={s.primaryBtnText}>🔍 Run Diagnosis</Text>}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {prediction && (
              <View style={s.resultCard}>
                {!prediction.is_agricultural_leaf && !forceProceed ? (
                  <View style={{ alignItems: 'center', padding: 8 }}>
                    <Text style={{ fontSize: 44, marginBottom: 10 }}>⚠️</Text>
                    <Text style={s.warnTitle}>Not a Recognized Leaf</Text>
                    <Text style={s.warnText}>Leaf pixels: {(prediction.leaf_ratio*100).toFixed(0)}% · Confidence: {(prediction.confidence*100).toFixed(0)}%</Text>
                    <Text style={s.warnHint}>Try a clear close-up photo of a single leaf on a plain background.</Text>
                    <View style={{ width: '100%', gap: 10 }}>
                      <TouchableOpacity style={s.proceedBtn} onPress={() => setForceProceed(true)}><Text style={s.proceedBtnText}>Show Guess Anyway</Text></TouchableOpacity>
                      <TouchableOpacity style={s.fallbackBtn} onPress={() => { setActiveAppTab('manual'); setPrediction(null); setSelectedImage(null); }}><Text style={s.fallbackBtnText}>Switch to Manual Entry</Text></TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={[s.leafBadge, !prediction.is_agricultural_leaf && { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: '#ef4444' }]}>
                      <Text style={[s.leafBadgeText, !prediction.is_agricultural_leaf && { color: '#fca5a5' }]}>
                        {prediction.is_agricultural_leaf ? `✓ Verified Leaf — ${(prediction.leaf_ratio*100).toFixed(0)}% green pixels` : '⚠ Low-confidence estimate'}
                      </Text>
                    </View>
                    <View style={s.diagHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.cropLabel}>{prediction.crop}</Text>
                        <Text style={s.diseaseName}>{prediction.disease_name}</Text>
                      </View>
                      {prediction.report && (
                        <View style={[s.severityBadge, { backgroundColor: getSeverityColor(prediction.report.severity)+'22', borderColor: getSeverityColor(prediction.report.severity) }]}>
                          <Text style={[s.severityText, { color: getSeverityColor(prediction.report.severity) }]}>{prediction.report.severity}</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={s.confLabel}>Confidence</Text>
                        <Text style={s.confValue}>{(prediction.confidence*100).toFixed(1)}%</Text>
                      </View>
                      <View style={s.progressBg}>
                        <View style={[s.progressFill, { width: `${prediction.confidence*100}%`, backgroundColor: prediction.report ? getSeverityColor(prediction.report.severity) : '#22c55e' }]} />
                      </View>
                    </View>
                    {prediction.report && renderRemedyReport(prediction.report)}
                    {/* Ask AI Button */}
                    <TouchableOpacity style={s.askAiBtn} onPress={() => { setActiveAppTab('chat'); setTimeout(() => sendChat(`Tell me more about ${prediction.disease_name} in ${prediction.crop} and how to treat it`), 300); }}>
                      <Text style={s.askAiBtnText}>🤖 Ask AI about this disease</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.resetBtn} onPress={() => { setSelectedImage(null); setPrediction(null); setForceProceed(false); }}>
                      <Text style={s.resetBtnText}>Diagnose Another Leaf</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}

        {/* ══════════════════════════════════════════════════════
            MANUAL TAB
        ══════════════════════════════════════════════════════ */}
        {activeAppTab === 'manual' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            <View style={s.manualCard}>
              <Text style={s.manualTitle}>Manual Crop Selector</Text>
              <Text style={s.manualSub}>Select crop type and visible symptoms to get offline remedy data.</Text>
              <Text style={s.label}>1. Crop Type</Text>
              <TouchableOpacity style={s.dropBtn} onPress={() => setCropModalVisible(true)}>
                <Text style={[s.dropBtnText, !selectedCrop && s.placeholder]}>{selectedCrop || 'Tap to select crop...'}</Text>
                <Text style={s.dropArrow}>▼</Text>
              </TouchableOpacity>
              <Text style={s.label}>2. Disease / Symptoms</Text>
              <TouchableOpacity style={[s.dropBtn, !selectedCrop && s.dropBtnDisabled]} onPress={() => { if (selectedCrop) setDiseaseModalVisible(true); else Alert.alert('Select crop first'); }} disabled={!selectedCrop}>
                <Text style={[s.dropBtnText, !selectedDisease && s.placeholder]}>{selectedDisease || (selectedCrop ? 'Tap to select...' : 'Select crop first')}</Text>
                <Text style={s.dropArrow}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.primaryBtn, (!selectedCrop || !selectedDisease || fetchingManual) && s.disabledBtn]} onPress={fetchManualDiagnosis} disabled={!selectedCrop || !selectedDisease || fetchingManual}>
                {fetchingManual ? <ActivityIndicator size="small" color="#86efac" /> : <Text style={s.primaryBtnText}>📖 Fetch Remedy Protocol</Text>}
              </TouchableOpacity>
            </View>

            {manualReport && (
              <View style={s.resultCard}>
                <View style={s.diagHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cropLabel}>{manualReport.crop}</Text>
                    <Text style={s.diseaseName}>{manualReport.disease}</Text>
                  </View>
                  <View style={[s.severityBadge, { backgroundColor: getSeverityColor(manualReport.severity)+'22', borderColor: getSeverityColor(manualReport.severity) }]}>
                    <Text style={[s.severityText, { color: getSeverityColor(manualReport.severity) }]}>{manualReport.severity}</Text>
                  </View>
                </View>
                <View style={{ height: 12 }} />
                {renderRemedyReport(manualReport)}
                <TouchableOpacity style={s.askAiBtn} onPress={() => { setActiveAppTab('chat'); setTimeout(() => sendChat(`Tell me more about ${manualReport.disease} in ${manualReport.crop} and how to treat it`), 300); }}>
                  <Text style={s.askAiBtnText}>🤖 Ask AI about this disease</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.resetBtn} onPress={() => { setSelectedCrop(null); setSelectedDisease(null); setManualReport(null); }}>
                  <Text style={s.resetBtnText}>Clear Selection</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* ══════════════════════════════════════════════════════
            AI CHAT TAB
        ══════════════════════════════════════════════════════ */}
        {activeAppTab === 'chat' && (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}>
            {/* Context Banner */}
            {getScanContext() && (
              <View style={s.contextBanner}>
                <Text style={s.contextText}>📋 Context: {getScanContext()}</Text>
              </View>
            )}

            {/* Quick Action Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.quickBtnsScroll} contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}>
              <TouchableOpacity style={s.quickBtn} onPress={quickSearchYouTube}>
                <Text style={s.quickBtnText}>▶ YouTube Treatment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.quickBtn} onPress={() => sendChat('What are the early symptoms I should watch for?')}>
                <Text style={s.quickBtnText}>🔍 Early Symptoms</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.quickBtn} onPress={() => sendChat('What treatments can I use at home?')}>
                <Text style={s.quickBtnText}>🌱 Remedy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.quickBtn} onPress={() => sendChat('How can I prevent this disease next season?')}>
                <Text style={s.quickBtnText}>🛡️ Prevention Tips</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Chat Messages */}
            <FlatList
              ref={chatScrollRef}
              data={chatMessages}
              keyExtractor={m => m.id}
              contentContainerStyle={{ padding: 12, paddingBottom: 8 }}
              onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => {
                let displayText = item.text;
                let ytSearchQuery = null;
                const ytMatch = displayText.match(/\[YOUTUBE:\s*(.*?)\]/i);
                if (ytMatch) {
                  ytSearchQuery = ytMatch[1].trim();
                  displayText = displayText.replace(ytMatch[0], '').trim();
                }

                return (
                  <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.aiBubble]}>
                    {item.role === 'ai' && <Text style={s.aiBubbleLabel}>🤖 ChloroGuard AI</Text>}
                    <Text style={[s.bubbleText, item.role === 'user' && s.userBubbleText]}>{displayText}</Text>
                    {/* YouTube search button for AI messages */}
                    {ytSearchQuery ? (
                      <TouchableOpacity style={s.inlineYtBtn} onPress={() => searchYouTube(ytSearchQuery)}>
                        <Text style={s.inlineYtBtnText}>▶ Search YouTube</Text>
                      </TouchableOpacity>
                    ) : (item.role === 'ai' && displayText.toLowerCase().includes('youtube') && (
                      <TouchableOpacity style={s.inlineYtBtn} onPress={quickSearchYouTube}>
                        <Text style={s.inlineYtBtnText}>▶ Search YouTube</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              }}
              ListFooterComponent={chatLoading ? (
                <View style={[s.bubble, s.aiBubble]}>
                  <Text style={s.aiBubbleLabel}>🤖 ChloroGuard AI</Text>
                  <ActivityIndicator size="small" color="#86efac" style={{ marginTop: 4 }} />
                </View>
              ) : null}
            />

            {/* Input Bar */}
            <View style={s.chatInputRow}>
              <TextInput
                style={s.chatInput}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Ask about plant diseases..."
                placeholderTextColor="#2d4d33"
                multiline
                maxLength={500}
                onSubmitEditing={() => sendChat()}
              />
              <TouchableOpacity style={[s.sendBtn, (!chatInput.trim() || chatLoading) && s.disabledBtn]} onPress={() => sendChat()} disabled={!chatInput.trim() || chatLoading}>
                <Text style={s.sendBtnText}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

      </View>

      {/* ── Modals ──────────────────────────────────────────── */}
      <Modal visible={cropModalVisible} transparent animationType="slide" onRequestClose={() => setCropModalVisible(false)}>
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Crop</Text>
              <TouchableOpacity onPress={() => setCropModalVisible(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {metadata ? metadata.crops.map(crop => (
                <TouchableOpacity key={crop} style={[s.modalItem, selectedCrop === crop && s.activeModalItem]} onPress={() => { setSelectedCrop(crop); setSelectedDisease(null); setManualReport(null); setCropModalVisible(false); }}>
                  <Text style={[s.modalItemText, selectedCrop === crop && s.activeModalItemText]}>{crop}</Text>
                  {selectedCrop === crop && <Text style={{ color: '#86efac', fontWeight: '800' }}>✓</Text>}
                </TouchableOpacity>
              )) : <Text style={s.modalEmpty}>Loading crops from cloud server... (This may take up to 60s if the server is waking up)</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={diseaseModalVisible} transparent animationType="slide" onRequestClose={() => setDiseaseModalVisible(false)}>
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Disease / Symptoms</Text>
              <TouchableOpacity onPress={() => setDiseaseModalVisible(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {metadata && selectedCrop && metadata.crop_diseases[selectedCrop] ? (
                metadata.crop_diseases[selectedCrop].map(disease => (
                  <TouchableOpacity key={disease} style={[s.modalItem, selectedDisease === disease && s.activeModalItem]} onPress={() => { setSelectedDisease(disease); setManualReport(null); setDiseaseModalVisible(false); }}>
                    <Text style={[s.modalItemText, selectedDisease === disease && s.activeModalItemText]}>{disease}</Text>
                    {selectedDisease === disease && <Text style={{ color: '#86efac', fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                ))
              ) : <Text style={s.modalEmpty}>No data available.</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0e1a0f', paddingTop: RNStatusBar.currentHeight || 40 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1c3320' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#86efac', letterSpacing: 3 },
  headerSub: { fontSize: 11, color: '#4d7a56', fontWeight: '600', letterSpacing: 0.5 },
  settingsBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#152218', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1c3320' },

  settingsCard: { backgroundColor: '#111e13', borderRadius: 14, padding: 16, marginTop: 10, borderWidth: 1, borderColor: '#1c3320' },
  settingsTitle: { color: '#d1fae5', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  inputRow: { flexDirection: 'row', marginBottom: 12 },
  label: { color: '#4d7a56', fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  input: { backgroundColor: '#0a1209', color: '#d1fae5', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1c3320', fontSize: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  testBtn: { backgroundColor: '#166534', paddingVertical: 9, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#22c55e' },
  testBtnText: { color: '#86efac', fontSize: 12, fontWeight: '700' },

  appTabBar: { flexDirection: 'row', backgroundColor: '#111e13', borderRadius: 12, padding: 4, marginVertical: 12, borderWidth: 1, borderColor: '#1c3320' },
  appTab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  activeAppTab: { backgroundColor: '#166534', borderWidth: 1, borderColor: '#22c55e' },
  appTabText: { color: '#4d7a56', fontSize: 12, fontWeight: '700' },
  activeAppTabText: { color: '#86efac' },

  dropzone: { borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#1c3320', borderStyle: 'dashed' },
  dropzoneGrad: { alignItems: 'center', padding: 44 },
  dropzoneTitle: { color: '#d1fae5', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  dropzoneSub: { color: '#4d7a56', fontSize: 13, textAlign: 'center', paddingHorizontal: 20, marginBottom: 30, lineHeight: 18 },
  btnRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cameraBtn: { backgroundColor: '#14532d', borderWidth: 1, borderColor: '#22c55e' },
  galleryBtn: { backgroundColor: '#1a2e1c', borderWidth: 1, borderColor: '#1c3320' },
  actionBtnText: { color: '#d1fae5', fontSize: 14, fontWeight: '700' },

  previewCard: { backgroundColor: '#111e13', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1c3320' },
  imageWrap: { width: '100%', aspectRatio: 1, borderRadius: 14, overflow: 'hidden', position: 'relative', marginBottom: 16, backgroundColor: '#0a1209', borderWidth: 1, borderColor: '#1c3320' },
  previewImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  clearBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(14,26,15,0.85)', width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1c3320' },
  primaryBtn: { backgroundColor: '#14532d', width: '100%', paddingVertical: 15, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#22c55e' },
  primaryBtnText: { color: '#86efac', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  disabledBtn: { backgroundColor: '#152218', borderColor: '#1c3320', opacity: 0.5 },

  resultCard: { backgroundColor: '#111e13', borderRadius: 20, padding: 18, marginTop: 14, borderWidth: 1, borderColor: '#1c3320' },
  warnTitle: { color: '#fca5a5', fontSize: 17, fontWeight: '800', marginBottom: 8 },
  warnText: { color: '#a3b8a7', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 6 },
  warnHint: { color: '#4d7a56', fontSize: 11, textAlign: 'center', fontStyle: 'italic', marginBottom: 20 },
  proceedBtn: { backgroundColor: '#1a2e1c', borderWidth: 1, borderColor: '#1c3320', paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  proceedBtnText: { color: '#a3b8a7', fontSize: 13, fontWeight: '700' },
  fallbackBtn: { backgroundColor: '#7f1d1d', paddingVertical: 13, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  fallbackBtnText: { color: '#fca5a5', fontSize: 13, fontWeight: '800' },
  leafBadge: { backgroundColor: 'rgba(134,239,172,0.08)', borderWidth: 1, borderColor: '#166534', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 14 },
  leafBadgeText: { color: '#86efac', fontSize: 11, fontWeight: '700' },
  diagHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cropLabel: { fontSize: 11, color: '#4d7a56', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  diseaseName: { fontSize: 21, color: '#d1fae5', fontWeight: '900', lineHeight: 26 },
  severityBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  severityText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  confLabel: { color: '#4d7a56', fontSize: 12, fontWeight: '600' },
  confValue: { color: '#86efac', fontSize: 12, fontWeight: '800' },
  progressBg: { height: 6, backgroundColor: '#0a1209', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  askAiBtn: { backgroundColor: 'rgba(134,239,172,0.08)', borderWidth: 1, borderColor: '#166534', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 14 },
  askAiBtnText: { color: '#86efac', fontSize: 13, fontWeight: '700' },
  resetBtn: { backgroundColor: '#0a1209', borderWidth: 1, borderColor: '#1c3320', width: '100%', paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  resetBtnText: { color: '#4d7a56', fontSize: 13, fontWeight: '700' },

  remedyContainer: { marginTop: 10 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1c3320', marginBottom: 12 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { color: '#4d7a56', fontSize: 13, fontWeight: '700' },
  tabContentCard: { backgroundColor: '#0a1209', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1c3320' },
  remedyRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bullet: { fontSize: 12, marginRight: 8, marginTop: 2 },
  remedyText: { color: '#a3b8a7', fontSize: 13, lineHeight: 20, flex: 1 },
  emptyText: { color: '#4d7a56', fontSize: 12, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
  ytBtn: { backgroundColor: '#7f1d1d', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#ef4444' },
  ytBtnText: { color: '#fca5a5', fontSize: 13, fontWeight: '800' },

  manualCard: { backgroundColor: '#111e13', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#1c3320' },
  manualTitle: { color: '#d1fae5', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  manualSub: { color: '#4d7a56', fontSize: 12, lineHeight: 18, marginBottom: 4 },
  dropBtn: { backgroundColor: '#0a1209', borderWidth: 1, borderColor: '#1c3320', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dropBtnDisabled: { opacity: 0.4 },
  dropBtnText: { color: '#a3b8a7', fontSize: 13, fontWeight: '600' },
  placeholder: { color: '#2d4d33' },
  dropArrow: { color: '#2d4d33', fontSize: 10 },

  // Chat styles
  contextBanner: { backgroundColor: 'rgba(134,239,172,0.06)', borderWidth: 1, borderColor: '#1c3320', borderRadius: 10, padding: 10, marginBottom: 8 },
  contextText: { color: '#4d7a56', fontSize: 11, fontStyle: 'italic' },
  quickBtnsScroll: { marginBottom: 12, minHeight: 44, flexShrink: 0, flexGrow: 0 },
  quickBtn: { backgroundColor: '#111e13', borderWidth: 1, borderColor: '#1c3320', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  quickBtnText: { color: '#86efac', fontSize: 12, fontWeight: '700' },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12, marginBottom: 10 },
  aiBubble: { backgroundColor: '#111e13', borderWidth: 1, borderColor: '#1c3320', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#14532d', borderWidth: 1, borderColor: '#22c55e', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubbleLabel: { color: '#4d7a56', fontSize: 10, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  bubbleText: { color: '#a3b8a7', fontSize: 14, lineHeight: 21 },
  userBubbleText: { color: '#d1fae5' },
  inlineYtBtn: { backgroundColor: '#7f1d1d', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8, borderWidth: 1, borderColor: '#ef4444' },
  inlineYtBtnText: { color: '#fca5a5', fontSize: 11, fontWeight: '700' },
  chatInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1c3320', backgroundColor: '#0e1a0f' },
  chatInput: { flex: 1, backgroundColor: '#111e13', color: '#d1fae5', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#1c3320', fontSize: 14, maxHeight: 100 },
  sendBtn: { backgroundColor: '#14532d', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#22c55e' },
  sendBtnText: { color: '#86efac', fontSize: 18, fontWeight: '800' },

  modalBg: { flex: 1, backgroundColor: 'rgba(10,18,9,0.92)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#111e13', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, borderWidth: 1, borderColor: '#1c3320' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1c3320', paddingBottom: 14, marginBottom: 10 },
  modalTitle: { color: '#d1fae5', fontSize: 16, fontWeight: '800' },
  modalClose: { color: '#4d7a56', fontSize: 20, fontWeight: '700', padding: 4 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(28,51,32,0.6)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeModalItem: { backgroundColor: 'rgba(134,239,172,0.05)', paddingHorizontal: 8, borderRadius: 8 },
  modalItemText: { color: '#a3b8a7', fontSize: 14, fontWeight: '500' },
  activeModalItemText: { color: '#86efac', fontWeight: '700' },
  modalEmpty: { color: '#4d7a56', fontSize: 12, fontStyle: 'italic', textAlign: 'center', paddingVertical: 24 },
});
