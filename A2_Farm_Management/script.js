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
let currentLang = localStorage.getItem('HG_LANG') || 'en';
let isConnected = false; // firebase connection flag

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
        disconnected: "✗ Not connected to Firebase",
        goHome: "Go Back to Home 🏡",
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
        disconnected: "✗ ফায়ারবেসে সংযুক্ত নয়",
        goHome: "হোমে ফিরে যান 🏡",
    }
};

// Check Firebase connection
const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, (snap) => {
    const statusEl = document.getElementById('connection-status');
    if (snap.val() === true) {
        isConnected = true;
        statusEl.className = 'connection-status connected';
        statusEl.innerHTML = '<span data-i18n="connected">✓ Connected to Firebase</span>';
        console.log("%cConnected to Firebase!", "color:lime;font-size:18px;font-weight:bold");
    } else {
        isConnected = false;
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
    localStorage.setItem('HG_LANG', currentLang);
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

        if (isConnected) {
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

            // ==== PATCH: export user to localStorage so B1 can read it ====
            try {
              localStorage.setItem('HG_ACTIVE_USER', JSON.stringify(currentUser));
            } catch(e) {
              console.warn('Could not set HG_ACTIVE_USER in localStorage', e);
            }
            // ============================================================

            // Load dashboard from Firebase (preferred)
            await loadDashboard();
            document.getElementById('form-login').reset();
        } else {
            // offline: try localStorage
            const raw = localStorage.getItem('HG_ACTIVE_USER');
            if(raw){
                const u = JSON.parse(raw);
                if(u.phone === phone){
                    // NOTE: cannot verify password offline (demo fallback)
                    currentUser = u;
                    alert('Offline mode: loaded local profile (password not verified).');
                    await loadDashboard(true); // indicate local fallback
                    document.getElementById('form-login').reset();
                } else {
                    alert('Offline and no matching local user found. Please connect to internet or register earlier.');
                }
            } else {
                alert('Offline and no local data. Connect to internet to login.');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

// Logout handler
window.handleLogout = function() {
    if (confirm((currentLang==='bn'? 'নিশ্চিত কি আপনি লগআউট করতে চান?':'Are you sure you want to logout?'))) {
        currentUser = null;
        // ==== PATCH: remove exported local keys on logout ====
        try {
          localStorage.removeItem('HG_ACTIVE_USER');
          localStorage.removeItem('HG_ACTIVE_BATCHES');
        } catch(e){
          console.warn('Could not clear HG_ACTIVE_* keys', e);
        }
        // =====================================================
        showView('view-login');
    }
}

// Load dashboard with user data
async function loadDashboard(localFallback=false) {
    showView('view-dashboard');

    // Update welcome message
    document.getElementById('user-welcome').textContent = currentUser ? `${(currentLang==='bn'?'স্বাগতম':'Welcome')}, ${currentUser.name}` : (currentLang==='bn'?'স্বাগতম':'Welcome');

    try {
        let batches = [];

        if(isConnected && !localFallback) {
            // try firebase
            const batchesRef = ref(db, 'batches/' + currentUser.phone);
            const snapshot = await get(batchesRef);

            if (snapshot.exists()) {
                const batchData = snapshot.val();
                batches = Object.entries(batchData).map(([id, batch]) => ({
                    id: id,
                    ...batch
                }));

                // mirror to localStorage
                try {
                  localStorage.setItem('HG_ACTIVE_BATCHES', JSON.stringify(batches));
                } catch(e){ console.warn('could not mirror batches', e); }
            } else {
                // no batches on Firebase -> clear local mirror for this user
                try {
                  localStorage.setItem('HG_ACTIVE_BATCHES', JSON.stringify([]));
                } catch(e){}
            }
        } else {
            // offline or localFallback -> read from localStorage if present
            const raw = localStorage.getItem('HG_ACTIVE_BATCHES');
            if(raw) batches = JSON.parse(raw);
            else batches = []; // nothing
        }

        // Update stats
        document.getElementById('stat-count').textContent = batches.length;
        const totalWeight = batches.reduce((sum, batch) => sum + Number(batch.weight || 0), 0);
        document.getElementById('stat-weight').textContent = totalWeight.toFixed(1) + " kg";

        // Update history table
        const tbody = document.querySelector('#table-batches tbody');
        tbody.innerHTML = '';

        if (batches.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999;">${currentLang==='bn'?'কোনো ব্যাচ নেই':'No batches yet'}</td></tr>`;
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
            badgeContainer.innerHTML = `<span style="color:#999; font-size:12px">${currentLang==='bn'?'কোনো অবদানের নেই':'No badges yet'}</span>`;
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
        alert((currentLang==='bn'?'ড্যাশবোর্ড লোড ব্যর্থ':'Failed to load dashboard data'));
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
        if(isConnected) {
            const batchesRef = ref(db, 'batches/' + currentUser.phone);
            const newBatchRef = push(batchesRef);
            await set(newBatchRef, batchData);

            // mirror to localStorage after successful write
            try {
              // get existing mirror
              const raw = localStorage.getItem('HG_ACTIVE_BATCHES');
              const arr = raw ? JSON.parse(raw) : [];
              arr.push({ id: newBatchRef.key || ('b_' + Date.now()), ...batchData });
              localStorage.setItem('HG_ACTIVE_BATCHES', JSON.stringify(arr));
            } catch(e) { console.warn('mirror after add failed', e); }

            alert(currentLang==='bn' ? 'ব্যাচ সফলভাবে যোগ করা হয়েছে!' : 'Batch added successfully!');
            document.getElementById('form-add-batch').reset();
            document.getElementById('batch-district').disabled = true;

            // Reload dashboard
            await loadDashboard();
        } else {
            // offline: store locally (push with client id)
            const clientId = 'local_' + Date.now();
            try {
              const raw = localStorage.getItem('HG_ACTIVE_BATCHES');
              const arr = raw ? JSON.parse(raw) : [];
              arr.push({ id: clientId, ...batchData });
              localStorage.setItem('HG_ACTIVE_BATCHES', JSON.stringify(arr));
            } catch(e) { console.warn('local save failed', e); }

            alert(currentLang==='bn' ? 'অফলাইন: ব্যাচ লোকালি সেভ হয়েছে।' : 'Offline: batch saved locally.');
            document.getElementById('form-add-batch').reset();
            document.getElementById('batch-district').disabled = true;

            // reload UI from local
            await loadDashboard(true);
        }
    } catch (error) {
        console.error('Add batch error:', error);
        alert((currentLang==='bn'?'ব্যাচ যোগ করতে ব্যর্থ':'Failed to add batch') + ': ' + error.message);
    }
}

// Export data as CSV
window.exportCSV = async function() {
    try {
        let batches = [];
        if(isConnected){
            const batchesRef = ref(db, 'batches/' + currentUser.phone);
            const snapshot = await get(batchesRef);
            if (snapshot.exists()) batches = Object.values(snapshot.val());
            else batches = [];
        } else {
            const raw = localStorage.getItem('HG_ACTIVE_BATCHES');
            batches = raw ? JSON.parse(raw) : [];
        }

        if (!batches || batches.length===0) {
            alert(currentLang==='bn' ? 'এক্সপোর্ট করার জন্য ডেটা নেই' : 'No data to export');
            return;
        }

        // Create CSV content
        let csv = "Date,Crop,Weight (kg),Division,District,Storage\n";
        batches.forEach(batch => {
            csv += `${batch.date || ''},${batch.cropType || ''},${batch.weight || ''},${batch.division || ''},${batch.district || ''},${batch.storage || ''}\n`;
        });

        // Download CSV file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `harvest_data_${currentUser ? currentUser.phone : 'export'}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Export error:', error);
        alert((currentLang==='bn'?'এক্সপোর্ট ব্যর্থ':'Failed to export data'));
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

    // Set language UI
    const sel = document.getElementById('languageSelect');
    sel.value = currentLang;
    updateUIText();

    // If localStorage has HG_ACTIVE_USER (previous login), we can offer quick login/demo load
    const rawUser = localStorage.getItem('HG_ACTIVE_USER');
    if(rawUser) {
      // don't auto-login; user still must login via form for security, but UI will have mirror for offline workflows
      console.log('Local HG user exists (mirror).');
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const homeBtn = document.getElementById("go-home");

    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "https://nusratmehazabin.github.io/HarvestGuard/";
        });
    }
});

