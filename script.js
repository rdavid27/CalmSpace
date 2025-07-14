// Firebase Configuration - Using CDN imports (compatible with your HTML)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    limit, 
    getDocs, 
    where 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCWS9fllI89PH43LwF-M2OgwEZ3TRzvgiA",
    authDomain: "calmspace-5bee5.firebaseapp.com",
    databaseURL: "https://calmspace-5bee5-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "calmspace-5bee5",
    storageBucket: "calmspace-5bee5.firebasestorage.app",
    messagingSenderId: "682446933114",
    appId: "1:682446933114:web:633dfa31d77dc5340f7fc3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyC97zovDTZlRkdsmpwLAmO0FVmXSdSnt8w';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const journalForm = document.getElementById('journalForm');
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const dashboardSection = document.getElementById('dashboardSection');
const journalEntry = document.getElementById('journalEntry');
const analysisResult = document.getElementById('analysisResult');
const recentEntries = document.getElementById('recentEntries');
const userGreeting = document.getElementById('userGreeting');
const logoutBtn = document.getElementById('logoutBtn');

// Navigation buttons
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const submitJournalBtn = document.getElementById('submitJournal');

// Application State
let currentUser = null;

// Authentication Functions
async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User registered:', userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in:', userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function logoutUser() {
    try {
        await signOut(auth);
        console.log('User logged out');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Gemini API Functions
async function analyzeJournalEntry(entry) {
    const prompt = `
    You are a supportive mental health assistant for college students. 
    Please analyze this journal entry and provide:
    1. A brief, empathetic summary of the student's emotional state
    2. One practical coping strategy or tip
    3. A positive, encouraging message
    
    Keep your response supportive, non-judgmental, and appropriate for a college student.
    If the entry suggests serious mental health concerns, gently suggest seeking professional help.
    
    Journal entry: "${entry}"
    
    Please format your response as:
    **Emotional Summary:** [brief summary]
    **Coping Tip:** [practical suggestion]
    **Encouragement:** [positive message]
    `;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to analyze journal entry');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API error:', error);
        return 'I understand you\'re sharing your feelings with me. Remember that it\'s okay to feel what you\'re feeling, and seeking support is a sign of strength. Consider talking to a counselor or trusted friend if you need additional support.';
    }
}

// Firestore Functions
async function saveJournalEntry(entry, analysis) {
    try {
        const docRef = await addDoc(collection(db, 'journal_entries'), {
            userId: currentUser.uid,
            entry: entry,
            analysis: analysis,
            timestamp: new Date(),
            date: new Date().toISOString().split('T')[0]
        });
        console.log('Journal entry saved with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error saving journal entry:', error);
        throw error;
    }
}

async function getRecentEntries() {
    try {
        const q = query(
            collection(db, 'journal_entries'),
            where('userId', '==', currentUser.uid),
            orderBy('timestamp', 'desc'),
            limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        const entries = [];
        
        querySnapshot.forEach((doc) => {
            entries.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return entries;
    } catch (error) {
        console.error('Error fetching recent entries:', error);
        return [];
    }
}

// UI Functions
function showSection(sectionToShow) {
    const sections = [loginSection, registerSection, dashboardSection];
    sections.forEach(section => {
        if (section) {
            section.style.display = 'none';
        }
    });
    
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
    }
}

function showError(message, formId) {
    const existingError = document.querySelector(`#${formId} .error-message`);
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'red';
    errorDiv.style.marginTop = '10px';
    errorDiv.textContent = message;
    
    const form = document.getElementById(formId);
    form.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message, elementId) {
    const element = document.getElementById(elementId);
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.color = 'green';
    successDiv.style.marginTop = '10px';
    successDiv.textContent = message;
    
    element.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

async function displayRecentEntries() {
    if (!recentEntries) return;
    
    const entries = await getRecentEntries();
    
    if (entries.length === 0) {
        recentEntries.innerHTML = '<p>No recent entries. Start journaling to see your entries here!</p>';
        return;
    }
    
    recentEntries.innerHTML = '<h3>Recent Entries</h3>';
    
    entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-card';
        entryDiv.style.cssText = `
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            background-color: #f9f9f9;
        `;
        
        const date = new Date(entry.timestamp.seconds * 1000).toLocaleDateString();
        entryDiv.innerHTML = `
            <div style="font-weight: bold; color: #666; margin-bottom: 5px;">${date}</div>
            <div style="margin-bottom: 10px;">${entry.entry.substring(0, 100)}${entry.entry.length > 100 ? '...' : ''}</div>
            <div style="font-size: 0.9em; color: #888;">${entry.analysis.substring(0, 150)}${entry.analysis.length > 150 ? '...' : ''}</div>
        `;
        
        recentEntries.appendChild(entryDiv);
    });
}

// Event Listeners
if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', () => {
        showSection(registerSection);
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', () => {
        showSection(loginSection);
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showError('Passwords do not match', 'registerForm');
            return;
        }
        
        try {
            await registerUser(email, password);
            showSuccess('Registration successful! Welcome to CalmSpace!', 'registerForm');
        } catch (error) {
            showError(error.message, 'registerForm');
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await loginUser(email, password);
        } catch (error) {
            showError(error.message, 'loginForm');
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await logoutUser();
    });
}

if (journalForm) {
    journalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const entry = journalEntry.value.trim();
        
        if (!entry) {
            showError('Please write something in your journal entry', 'journalForm');
            return;
        }
        
        // Show loading state
        submitJournalBtn.disabled = true;
        submitJournalBtn.textContent = 'Analyzing...';
        analysisResult.innerHTML = '<p>Analyzing your entry...</p>';
        
        try {
            // Get analysis from Gemini API
            const analysis = await analyzeJournalEntry(entry);
            
            // Save to Firestore
            await saveJournalEntry(entry, analysis);
            
            // Display analysis
            analysisResult.innerHTML = `
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <h4>Your Analysis</h4>
                    <div style="white-space: pre-line;">${analysis}</div>
                </div>
            `;
            
            // Clear form
            journalEntry.value = '';
            
            // Refresh recent entries
            await displayRecentEntries();
            
            showSuccess('Journal entry saved successfully!', 'journalForm');
            
        } catch (error) {
            console.error('Error processing journal entry:', error);
            showError('Error processing your entry. Please try again.', 'journalForm');
        } finally {
            // Reset button
            submitJournalBtn.disabled = false;
            submitJournalBtn.textContent = 'Submit Entry';
        }
    });
}

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        console.log('User is signed in:', user.email);
        
        // Update UI
        if (userGreeting) {
            userGreeting.textContent = `Welcome back, ${user.email}!`;
        }
        
        showSection(dashboardSection);
        
        // Load recent entries
        await displayRecentEntries();
        
    } else {
        currentUser = null;
        console.log('User is signed out');
        showSection(loginSection);
        
        // Clear any user-specific data
        if (analysisResult) {
            analysisResult.innerHTML = '';
        }
        if (recentEntries) {
            recentEntries.innerHTML = '';
        }
    }
});

// Additional Helper Functions
function formatDate(timestamp) {
    if (timestamp && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    return new Date().toLocaleDateString();
}

// Mental Health Resources
const mentalHealthResources = {
    crisis: {
        title: "Crisis Support",
        resources: [
            "National Suicide Prevention Lifeline: 988",
            "Crisis Text Line: Text HOME to 741741",
            "Campus Emergency Services: Check your school's emergency contact"
        ]
    },
    general: {
        title: "General Mental Health",
        resources: [
            "Campus Counseling Center",
            "Student Health Services",
            "National Alliance on Mental Illness (NAMI): nami.org",
            "Mental Health America: mhanational.org"
        ]
    }
};

function displayMentalHealthResources() {
    const resourcesDiv = document.getElementById('resources');
    if (!resourcesDiv) return;
    
    let html = '<h3>Mental Health Resources</h3>';
    
    Object.values(mentalHealthResources).forEach(category => {
        html += `<div style="margin-bottom: 20px;">
            <h4>${category.title}</h4>
            <ul>`;
        
        category.resources.forEach(resource => {
            html += `<li style="margin: 5px 0;">${resource}</li>`;
        });
        
        html += `</ul></div>`;
    });
    
    resourcesDiv.innerHTML = html;
}

// Initialize resources and feather icons when page loads
document.addEventListener('DOMContentLoaded', () => {
    displayMentalHealthResources();
    
    // Initialize feather icons if available
    if (window.feather) {
        feather.replace();
    }
});

// Export functions for testing (optional)
export {
    registerUser,
    loginUser,
    logoutUser,
    analyzeJournalEntry,
    saveJournalEntry,
    getRecentEntries
};