// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, set, push, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqDV9QQBpOI4OonBUrwEsW8zljcilJxhw",
    authDomain: "harvest-5a8a4.firebaseapp.com",
    projectId: "harvest-5a8a4",
    storageBucket: "harvest-5a8a4.firebasestorage.app",
    messagingSenderId: "275171472738",
    appId: "1:275171472738:web:58df298d4da06572dfa83b",
    measurementId: "G-D8VKZQ00SF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global variables
let currentUser = null;
let currentLang = 'en';

// District mapping for Bangladesh
const districtMap = {
    "Dhaka": ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Manikganj", "Munshiganj", "Narsingdi", "Rajbari", "Madaripur", "Gopalganj", "Shariatpur", "Faridpur", "Kishoreganj"],
    "Chittagong": ["Chittagong", "Cox's Bazar", "Comilla", "Feni", "Noakhali", "Lakshmipur", "Chandpur", "Brahmanbaria", "Rangamati", "Bandarban", "Khagrachhari"],
    "Rajshahi": ["Rajshahi", "Bogra", "Pabna", "Natore", "Sirajganj", "Naogaon", "Joypurhat", "Chapainawabganj"],
    "Khulna": ["Khulna", "Jessore", "Satkhira", "Bagerhat", "Kushtia", "Chuadanga", "Meherpur", "Narail", "Magura", "Jhenaidah"],
    "Barisal": ["Barisal", "Patuakhali", "Bhola", "Barguna", "Jhalokati", "Pirojpur"],
    "Sylhet": ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
    "Rangpur": ["Rangpur", "Dinajpur", "Thakurgaon", "Panchagarh", "Kurigram", "Lalmonirhat", "Nilphamari", "Gaibandha"],
    "Mymensingh": ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"]
};

// Translations object
const i18n = {
    en: {
        regTitle: "Farmer Registration",
        btnRegister: "Register",
        haveAccount: "Already have an account?",
        btnLogin: "Login",
        loginTitle: "Login",
        noAccount: "No account?",
        lblPhone: "Phone Number",
        lblName: "Full Name",
        lblPass: "Password",
        lblEmail: "Email",
        lblBatches: "Batches",
        lblTotalWeight: "Total Weight",
        btnAddBatch: "+ Add Crop Batch",
        btnExport: "Download Data (CSV)",
        lblHistory: "History",
        lblDate: "Date",
        lblCrop: "Crop",
        lblWeight: "Weight",
        lblStorage: "Storage",
        btnSave: "Save Batch",
        btnCancel: "Cancel",
        titleAddBatch: "Add Crop Batch",
        lblDivision: "Division",
        lblDistrict: "District",
        btnLogout: "Logout",
        lblBadges: "Achievements",
        connecting: "Connecting to Firebase...",
        connected: "✓ Connected to Firebase",
        disconnected: "✗ Not connected to Firebase"
    },
    bn: {
        regTitle: "কৃষক নিবন্ধন",
        btnRegister: "নিবন্ধন করুন",
        haveAccount: "অ্যাকাউন্ট আছে?",
        btnLogin: "লগইন",
        loginTitle: "লগইন",
        noAccount: "অ্যাকাউন্ট নেই?",
        lblPhone: "ফোন নম্বর",
        lblName: "নাম",
        lblPass: "পাসওয়ার্ড",
        lblEmail: "ইমেইল",
        lblBatches: "ব্যাচ সংখ্যা",
        lblTotalWeight: "মোট ওজন",
        btnAddBatch: "+ নতুন ব্যাচ",
        btnExport: "তথ্য ডাউনলোড",
        lblHistory: "ইতিহাস",
        lblDate: "তারিখ",
        lblCrop: "ফসল",
        lblWeight: "ওজন",
        lblStorage: "সংরক্ষণ",
        btnSave: "সংরক্ষণ",
        btnCancel: "বাতিল",
        titleAddBatch: "ফসল ব্যাচ যোগ করুন",
        lblDivision: "বিভাগ",
        lblDistrict: "জেলা",
        btnLogout: "লগআউট",
        lblBadges: "অর্জন",
        connecting: "ফায়ারবেসে সংযুক্ত হচ্ছে...",
        connected: "✓ ফায়ারবেসে সংযুক্ত",
        disconnected: "✗ ফায়ারবেসে সংযুক্ত নয়"
    }
};

// Check Firebase connection
const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, (snap) => {
    const statusEl = document.getElementById('connection-status');
    if (snap.val() === true) {
        statusEl.className = 'connection-status connected';
        statusEl.innerHTML = '<span data-i18n="connected">✓ Connected to Firebase</span>';
        console.log("%cConnected to Firebase!", "color:lime;font-size:18px;font-weight:bold");
    } else {
        statusEl.className = 'connection-status disconnected';
        statusEl.innerHTML = '<span data-i18n="disconnected">✗ Not connected to Firebase</span>';
        console.log("%cNot connected to Firebase", "color:red;font-size:18px");
    }
    updateUIText();
});

// Update UI text based on selected language
function updateUIText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang] && i18n[currentLang][key]) {
            el.textContent = i18n[currentLang][key];
        }
    });
}

// Show specific view (card)
window.showView = function(viewId) {
    document.querySelectorAll('.card').forEach(el => el.classList.remove('active'));
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }
}

// Language change handler
window.updateLanguage = function() {
    const selectEl = document.getElementById('languageSelect');
    currentLang = selectEl.value;
    updateUIText();
}

// Update districts dropdown based on selected division
window.updateDistricts = function() {
    const divisionValue = document.getElementById('batch-division').value;
    const districtSelect = document.getElementById('batch-district');

    districtSelect.innerHTML = '<option value="">Select...</option>';

    if (divisionValue && districtMap[divisionValue]) {
        districtMap[divisionValue].forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
    } else {
        districtSelect.disabled = true;
    }
}

// Registration handler
window.handleRegister = async function(e) {
    e.preventDefault();

    const phone = document.getElementById('reg-phone').value.trim();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-pass').value;

    // Validate phone number
    if (!/^[0-9]{11}$/.test(phone)) {
        alert('Please enter a valid 11-digit phone number');
        return;
    }

    try {
        // Check if user already exists
        const userRef = ref(db, 'users/' + phone);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            alert('Phone number already registered! Please login.');
            return;
        }

        // Create new user
        await set(userRef, {
            phone: phone,
            name: name,
            email: email,
            password: password,
            badges: [],
            registeredAt: new Date().toISOString()
        });

        alert('Registration successful! Please login.');
        showView('view-login');
        document.getElementById('form-register').reset();
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
}

// Login handler
window.handleLogin = async function(e) {
    e.preventDefault();

    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-pass').value;

    // Validate phone number format
    if (!/^[0-9]{11}$/.test(phone)) {
        alert('Please enter a valid 11-digit phone number (numbers only)');
        return;
    }

    try {
        const userRef = ref(db, 'users/' + phone);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            alert('User not found! Please register first.');
            return;
        }

        const userData = snapshot.val();

        if (userData.password !== password) {
            alert('Incorrect password! Please try again.');
            return;
        }

        // Set current user
        currentUser = {
            phone: phone,
            name: userData.name,
            email: userData.email,
            badges: userData.badges || []
        };

        // Load dashboard
        loadDashboard();
        document.getElementById('form-login').reset();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

// Logout handler
window.handleLogout = function() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        showView('view-login');
    }
}

// Load dashboard with user data
async function loadDashboard() {
    showView('view-dashboard');

    // Update welcome message
    document.getElementById('user-welcome').textContent = `Welcome, ${currentUser.name}`;

    try {
        // Fetch user's batches
        const batchesRef = ref(db, 'batches/' + currentUser.phone);
        const snapshot = await get(batchesRef);

        let batches = [];
        if (snapshot.exists()) {
            const batchData = snapshot.val();
            batches = Object.entries(batchData).map(([id, batch]) => ({
                id: id,
                ...batch
            }));
        }

        // Update statistics
        document.getElementById('stat-count').textContent = batches.length;
        const totalWeight = batches.reduce((sum, batch) => sum + Number(batch.weight || 0), 0);
        document.getElementById('stat-weight').textContent = totalWeight.toFixed(1) + " kg";

        // Update history table
        const tbody = document.querySelector('#table-batches tbody');
        tbody.innerHTML = '';

        if (batches.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#999;">No batches yet</td></tr>';
        } else {
            batches.forEach(batch => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${batch.date || 'N/A'}</td>
                    <td>${batch.cropType || 'N/A'}</td>
                    <td>${batch.weight || 0} kg</td>
                    <td>${batch.storage || 'N/A'}</td>
                `;
                tbody.appendChild(row);
            });
        }

        // Update badges
        const badgeContainer = document.getElementById('badge-container');
        badgeContainer.innerHTML = '';

        if (currentUser.badges && currentUser.badges.length > 0) {
            currentUser.badges.forEach(badge => {
                const badgeEl = document.createElement('span');
                badgeEl.className = 'badge';
                badgeEl.textContent = badge;
                badgeContainer.appendChild(badgeEl);
            });
        } else {
            badgeContainer.innerHTML = '<span style="color:#999; font-size:12px">No badges yet</span>';
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
        alert('Failed to load dashboard data');
    }
}

// Add batch handler
window.handleAddBatch = async function(e) {
    e.preventDefault();

    const batchData = {
        date: document.getElementById('batch-date').value,
        cropType: document.getElementById('batch-crop').value,
        weight: document.getElementById('batch-weight').value,
        division: document.getElementById('batch-division').value,
        district: document.getElementById('batch-district').value,
        storage: document.getElementById('batch-storage').value,
        createdAt: new Date().toISOString()
    };

    try {
        const batchesRef = ref(db, 'batches/' + currentUser.phone);
        const newBatchRef = push(batchesRef);
        await set(newBatchRef, batchData);

        alert('Batch added successfully!');
        document.getElementById('form-add-batch').reset();
        document.getElementById('batch-district').disabled = true;

        // Reload dashboard
        loadDashboard();
    } catch (error) {
        console.error('Add batch error:', error);
        alert('Failed to add batch: ' + error.message);
    }
}

// Export data as CSV
window.exportCSV = async function() {
    try {
        const batchesRef = ref(db, 'batches/' + currentUser.phone);
        const snapshot = await get(batchesRef);

        if (!snapshot.exists()) {
            alert('No data to export');
            return;
        }

        const batchData = snapshot.val();
        const batches = Object.values(batchData);

        // Create CSV content
        let csv = "Date,Crop,Weight (kg),Division,District,Storage\n";
        batches.forEach(batch => {
            csv += `${batch.date},${batch.cropType},${batch.weight},${batch.division},${batch.district},${batch.storage}\n`;
        });

        // Download CSV file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `harvest_data_${currentUser.phone}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export data');
    }
}

// Initialize app on page load
window.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default for batch date input
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('batch-date');
    if (dateInput) {
        dateInput.value = today;
        dateInput.max = today; // Prevent future dates
    }

    // Show registration page by default
    showView('view-register');

    // Initialize UI text
    updateUIText();
});