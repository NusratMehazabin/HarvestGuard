const apiKey = "83d0172bfdd2a9497f8dfefeeda4a6a6"; // Your OpenWeatherMap API key
let currentLanguage = "en"; // Default language is English

// Mapping Bangla and English Upazila names to English city names
const upazilaMapping = {
    "ঢাকা": "Dhaka",
    "Dhaka": "Dhaka", // For when the user selects the English version
    "চট্টগ্রাম": "Chittagong",
    "Chittagong": "Chittagong", // For the English version
    "রাজশাহী": "Rajshahi",
    "Rajshahi": "Rajshahi", // For the English version
    // Add more mappings as needed
};

// Function to set the language based on user selection
function setLanguage() {
    currentLanguage = document.getElementById('language').value;
    
    // Update the labels and text based on the selected language
    if (currentLanguage === "bn") {
        document.getElementById('weather-heading').innerText = "আবহাওয়া পূর্বাভাস";
        document.getElementById('languageLabel').innerText = "ভাষা নির্বাচন করুন:";
        document.getElementById('upazilaLabel').innerText = "আপনার উপজেলা নির্বাচন করুন:";
    } else {
        document.getElementById('weather-heading').innerText = "Weather Forecast";
        document.getElementById('languageLabel').innerText = "Choose Language:";
        document.getElementById('upazilaLabel').innerText = "Select Your Upazila:";
        updateGoHomeButton();
    }
}
const i18n = {
    en: {
        goHome: "Go Back to Home 🏡"
    },
    bn: {
        goHome: "হোমে ফিরে যান 🏡"
    }
};
function updateGoHomeButton() {
    const btn = document.getElementById("go-home");
    if (btn) {
        btn.innerText = i18n[currentLanguage].goHome;
    }
}

// Function to get weather data
function getWeatherData() {
    const selectedUpazila = document.getElementById('upazila').value;
    const upazilaEnglishName = upazilaMapping[selectedUpazila]; // Get the English name for API call

    if (!upazilaEnglishName) {
        alert("Invalid Upazila selected!");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(upazilaEnglishName)},BD&units=metric&cnt=5&appid=${apiKey}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.cod && data.cod !== "200" && data.cod !== 200) {
                throw new Error(`API error: ${data.message || JSON.stringify(data)}`);
            }
            displayWeather(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Weather fetch error: ' + error.message);
        });
}

// Function to display weather data and advisories in the selected language
function displayWeather(data) {
    const temp = data.list[0].main.temp;
    const humidity = data.list[0].main.humidity;
    const rain = data.list[0].rain ? data.list[0].rain["3h"] : 0;

    // Convert numbers to Bangla if language is Bangla
    const tempBangla = currentLanguage === "bn" ? convertToBanglaNumbers(temp) : temp;
    const humidityBangla = currentLanguage === "bn" ? convertToBanglaNumbers(humidity) : humidity;
    const rainBangla = currentLanguage === "bn" ? convertToBanglaNumbers(rain) : rain;

    document.getElementById('temp').innerText = formatText(currentLanguage, "Temperature: ") + tempBangla + "°C";
    document.getElementById('humidity').innerText = formatText(currentLanguage, "Humidity: ") + humidityBangla + "%";
    document.getElementById('rain').innerText = formatText(currentLanguage, "Rain (next 3 hours): ") + rainBangla + "mm";

    // Generate weather advisory in Bangla or English
    let advisory = "";
    if (rain > 0) {
        advisory = getAdvisory(currentLanguage, "Rain is expected in the next 3 hours. Prepare to harvest!");
    } else if (temp > 35) {
        advisory = getAdvisory(currentLanguage, "The temperature is very high. Ensure proper ventilation for crops.");
    } else {
        advisory = getAdvisory(currentLanguage, "Weather conditions are normal. Take care of your crops.");
    }

    document.getElementById('advisory').innerText = advisory;
}

// Function to convert numbers to Bangla
function convertToBanglaNumbers(num) {
    const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit => banglaNumbers[parseInt(digit)] || digit).join('');
}

// Function to format the text for English and Bangla
function formatText(language, text) {
    if (language === "bn") {
        if (text === "Temperature: ") return "তাপমাত্রা: ";
        if (text === "Humidity: ") return "আর্দ্রতা: ";
        if (text === "Rain (next 3 hours): ") return "বৃষ্টি (পরবর্তী ৩ ঘণ্টা): ";
    }
    return text;
}

// Function to get advisory text in both languages
function getAdvisory(language, englishAdvisory) {
    if (language === "bn") {
        if (englishAdvisory === "Rain is expected in the next 3 hours. Prepare to harvest!") {
            return "আগামী ৩ ঘণ্টায় বৃষ্টি হতে পারে। ধান কাটার জন্য প্রস্তুত হোন!";
        }
        if (englishAdvisory === "The temperature is very high. Ensure proper ventilation for crops.") {
            return "তাপমাত্রা অনেক বেশি। ফসলের সুরক্ষার জন্য হাওয়া চলাচল বাড়ান!";
        }
        if (englishAdvisory === "Weather conditions are normal. Take care of your crops.") {
            return "আবহাওয়া সহনীয়। আপনার ফসলের যত্ন নিন!";
        }
    }
    return englishAdvisory;
}
document.addEventListener("DOMContentLoaded", () => {
    const homeBtn = document.getElementById("go-home");
    homeBtn.addEventListener("click", () => {
        window.location.href = "https://nusratmehazabin.github.io/HarvestGuard/";
    });

    updateGoHomeButton(); // Default language text set on page load
});


