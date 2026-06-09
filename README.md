# ChloroGuard - Mobile Application

This repository contains the frontend React Native (Expo) code for ChloroGuard, an AI-powered agricultural leaf disease prediction tool.

## Building the Standalone Android APK

To compile this project into a native `.apk` file that can be installed on any Android phone (without needing Expo Go), follow these requirements and steps:

### Requirements
1. **Node.js** installed on your computer.
2. An **Expo account** (free at [expo.dev](https://expo.dev)).
3. **EAS CLI** (Expo Application Services) installed globally.

### Step-by-Step Build Instructions

1. **Install EAS CLI:**
   Open your terminal and run:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   Authenticate your terminal with your Expo account:
   ```bash
   eas login
   ```

3. **Navigate to the Mobile App Folder:**
   ```bash
   cd mobile_app
   ```

4. **Start the Build Process:**
   Run the following command to tell Expo to build an Android APK in the cloud:
   ```bash
   eas build -p android --profile preview
   ```
   *Note: Expo will ask you if you want to generate a new Android Keystore. Press **Yes (Y)***.

5. **Download the APK:**
   The build process takes roughly 10 to 15 minutes on Expo's free tier. Once it finishes, the terminal will provide a direct download link to your `.apk` file.

6. **Install on Phone:**
   Download the APK file to your Android phone, tap it, and select "Install". (You may need to allow "Install from Unknown Sources" in your Android settings).

---

*Note: The backend machine learning API (the "potato disease" model) is hosted in a separate repository and runs on Render.*
