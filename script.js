console.log('=== Script.js is loading ===');

// Fix for iOS Safari viewport height with address bar
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set on load
setViewportHeight();
console.log('Viewport height set');

// Update on resize and orientation change
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

// Smooth scroll effect for scroll indicator
console.log('Adding DOMContentLoaded listener...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM Content Loaded - Starting initialization ===');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const churchSection = document.querySelector('.church-section');
            churchSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Add fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.info-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });

    // RSVP Form Functionality
    initRSVPForm();

    // Gift Form Functionality
    initGiftForm();
});

// RSVP Form Functions
function initRSVPForm() {
    console.log('=== RSVP Form Initialization Started ===');

    // Replace with your Google Apps Script Web App URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_rOMP1x-Z4bEkScAcTKrgdRy34zhK497gKGUTZc-L_RfgAdnbfRHuPQyjYEkcT0cjSQ/exec';

    const searchBtn = document.getElementById('searchBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const guestSearch = document.getElementById('guestSearch');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const confirmLoadingIndicator = document.getElementById('confirmLoadingIndicator');
    const guestGroup = document.getElementById('guestGroup');
    const messageBox = document.getElementById('messageBox');

    console.log('Form elements found:', {
        searchBtn: searchBtn ? 'YES' : 'NO',
        confirmBtn: confirmBtn ? 'YES' : 'NO',
        guestSearch: guestSearch ? 'YES' : 'NO',
        loadingIndicator: loadingIndicator ? 'YES' : 'NO',
        confirmLoadingIndicator: confirmLoadingIndicator ? 'YES' : 'NO',
        guestGroup: guestGroup ? 'YES' : 'NO',
        messageBox: messageBox ? 'YES' : 'NO'
    });

    if (!searchBtn) {
        console.error('ERROR: Search button not found! Check if HTML has id="searchBtn"');
        return;
    }

    if (!guestSearch) {
        console.error('ERROR: Search input not found! Check if HTML has id="guestSearch"');
        return;
    }

    let currentGuests = [];

    // Search button click handler
    console.log('Attaching click event to search button...');
    searchBtn.addEventListener('click', function() {
        console.log('=== Search button clicked! ===');
        const searchTerm = guestSearch.value.trim();
        console.log('Search term:', searchTerm);
        if (!searchTerm) {
            showMessage('Inserisci un nome per cercare', 'error');
            return;
        }
        searchGuest(searchTerm);
    });
    console.log('Search button click event attached successfully');

    // Allow Enter key to search
    if (guestSearch) {
        guestSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('Enter key pressed in search field');
                searchBtn.click();
            }
        });
        console.log('Enter key event attached to search input');
    }

    // Confirm button click handler
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            console.log('=== Confirm button clicked! ===');
            confirmAttendance();
        });
        console.log('Confirm button click event attached');
    }

    console.log('=== RSVP Form Initialization Completed ===');

    // Test button functionality - you can click this in console
    window.testRSVP = function() {
        console.log('Test function called');
        console.log('Search button exists:', !!searchBtn);
        console.log('Search button is visible:', searchBtn && searchBtn.offsetParent !== null);
        if (searchBtn) {
            searchBtn.click();
        }
    };
    console.log('Type "testRSVP()" in console to test the button');

    // Search for guest
    function searchGuest(searchTerm) {
        console.log('Searching for guest:', searchTerm);
        showLoading();
        hideMessage();
        hideGuestGroup();

        const payload = {
            action: 'search',
            searchTerm: searchTerm
        };

        console.log('Sending request to:', SCRIPT_URL);
        console.log('Payload:', payload);

        fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            return response.text();
        })
        .then(text => {
            console.log('Raw response:', text);
            try {
                const data = JSON.parse(text);
                console.log('Parsed data:', data);
                hideLoading();
                if (data.success) {
                    displayGuestGroup(data.data);
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (e) {
                console.error('JSON parse error:', e);
                hideLoading();
                showMessage('Errore nel formato della risposta', 'error');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            hideLoading();
            showMessage('Errore durante la ricerca. Controlla la console per dettagli.', 'error');
        });
    }

    // Display guest group
    function displayGuestGroup(data) {
        currentGuests = data.guests;
        document.getElementById('groupName').textContent = data.groupName;

        const guestList = document.getElementById('guestList');
        guestList.innerHTML = '';

        data.guests.forEach((guest, index) => {
            const guestItem = document.createElement('div');
            guestItem.className = 'guest-item';

            const guestName = document.createElement('span');
            guestName.className = 'guest-name';
            guestName.textContent = guest.name;

            const guestCheckbox = document.createElement('div');
            guestCheckbox.className = 'guest-checkbox';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `guest-${index}`;
            checkbox.checked = guest.attending;
            checkbox.dataset.row = guest.row;

            const label = document.createElement('label');
            label.htmlFor = `guest-${index}`;
            label.textContent = 'Presente';

            guestCheckbox.appendChild(checkbox);
            guestCheckbox.appendChild(label);

            guestItem.appendChild(guestName);
            guestItem.appendChild(guestCheckbox);

            guestList.appendChild(guestItem);
        });

        // Populate food intolerance field if it exists
        const foodIntoleranceInput = document.getElementById('foodIntolerance');
        if (foodIntoleranceInput && data.foodIntolerance) {
            foodIntoleranceInput.value = data.foodIntolerance;
        }

        showGuestGroup();
    }

    // Confirm attendance
    function confirmAttendance() {
        const checkboxes = document.querySelectorAll('.guest-checkbox input[type="checkbox"]');
        const guests = Array.from(checkboxes).map(cb => ({
            row: parseInt(cb.dataset.row),
            attending: cb.checked
        }));

        const foodIntoleranceInput = document.getElementById('foodIntolerance');
        const foodIntolerance = foodIntoleranceInput ? foodIntoleranceInput.value.trim() : '';

        console.log('Confirming attendance for guests:', guests);
        console.log('Food intolerance:', foodIntolerance);
        showConfirmLoading();
        hideMessage();

        const payload = {
            action: 'confirm',
            guests: guests,
            foodIntolerance: foodIntolerance
        };

        console.log('Sending confirmation to:', SCRIPT_URL);
        console.log('Payload:', payload);

        fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            console.log('Confirmation response status:', response.status);
            return response.text();
        })
        .then(text => {
            console.log('Confirmation raw response:', text);
            try {
                const data = JSON.parse(text);
                console.log('Confirmation parsed data:', data);
                hideConfirmLoading();
                if (data.success) {
                    showMessage(data.message, 'success');
                    // Reset form after successful submission
                    setTimeout(() => {
                        hideGuestGroup();
                        guestSearch.value = '';
                        const foodIntoleranceInput = document.getElementById('foodIntolerance');
                        if (foodIntoleranceInput) foodIntoleranceInput.value = '';
                        hideMessage();
                    }, 3000);
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (e) {
                console.error('JSON parse error:', e);
                hideConfirmLoading();
                showMessage('Errore nel formato della risposta', 'error');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            hideConfirmLoading();
            showMessage('Errore durante la conferma. Controlla la console per dettagli.', 'error');
        });
    }

    // UI Helper functions
    function showLoading() {
        loadingIndicator.style.display = 'block';
        searchBtn.disabled = true;
    }

    function hideLoading() {
        loadingIndicator.style.display = 'none';
        searchBtn.disabled = false;
    }

    function showConfirmLoading() {
        confirmLoadingIndicator.style.display = 'block';
        confirmBtn.disabled = true;
    }

    function hideConfirmLoading() {
        confirmLoadingIndicator.style.display = 'none';
        confirmBtn.disabled = false;
    }

    function showGuestGroup() {
        guestGroup.style.display = 'block';
    }

    function hideGuestGroup() {
        guestGroup.style.display = 'none';
    }

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = 'message-box ' + type;
        messageBox.style.display = 'block';
    }

    function hideMessage() {
        messageBox.style.display = 'none';
    }
}

// Gift Form Functions
function initGiftForm() {
    console.log('=== Gift Form Initialization Started ===');

    // Replace with your Google Apps Script Web App URL (same as RSVP)
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_rOMP1x-Z4bEkScAcTKrgdRy34zhK497gKGUTZc-L_RfgAdnbfRHuPQyjYEkcT0cjSQ/exec';

    const submitGiftBtn = document.getElementById('submitGiftBtn');
    const giftFrom = document.getElementById('giftFrom');
    const giftMessage = document.getElementById('giftMessage');
    const giftLoadingIndicator = document.getElementById('giftLoadingIndicator');
    const giftMessageBox = document.getElementById('giftMessageBox');

    console.log('Gift form elements found:', {
        submitGiftBtn: submitGiftBtn ? 'YES' : 'NO',
        giftFrom: giftFrom ? 'YES' : 'NO',
        giftMessage: giftMessage ? 'YES' : 'NO',
        giftLoadingIndicator: giftLoadingIndicator ? 'YES' : 'NO',
        giftMessageBox: giftMessageBox ? 'YES' : 'NO'
    });

    if (!submitGiftBtn) {
        console.error('ERROR: Submit gift button not found!');
        return;
    }

    // Submit button click handler
    submitGiftBtn.addEventListener('click', function() {
        console.log('=== Submit gift button clicked! ===');
        submitGiftMessage();
    });

    // Submit gift message
    function submitGiftMessage() {
        const from = giftFrom.value.trim();
        const message = giftMessage.value.trim();

        if (!from) {
            showGiftMessage('Inserisci il tuo nome', 'error');
            return;
        }

        if (!message) {
            showGiftMessage('Inserisci un messaggio per gli sposi', 'error');
            return;
        }

        console.log('Submitting gift message from:', from);
        showGiftLoading();
        hideGiftMessage();

        const payload = {
            action: 'gift',
            from: from,
            to: 'Lorenzo ed Alessia',
            message: message
        };

        console.log('Sending gift message to:', SCRIPT_URL);
        console.log('Payload:', payload);

        fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            console.log('Gift response status:', response.status);
            return response.text();
        })
        .then(text => {
            console.log('Gift raw response:', text);
            try {
                const data = JSON.parse(text);
                console.log('Gift parsed data:', data);
                hideGiftLoading();
                if (data.success) {
                    showGiftMessage(data.message, 'success');
                    // Reset form after successful submission
                    setTimeout(() => {
                        giftFrom.value = '';
                        giftMessage.value = '';
                        hideGiftMessage();
                    }, 3000);
                } else {
                    showGiftMessage(data.message, 'error');
                }
            } catch (e) {
                console.error('JSON parse error:', e);
                hideGiftLoading();
                showGiftMessage('Errore nel formato della risposta', 'error');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            hideGiftLoading();
            showGiftMessage('Errore durante l\'invio. Riprova più tardi.', 'error');
        });
    }

    // UI Helper functions
    function showGiftLoading() {
        giftLoadingIndicator.style.display = 'block';
        submitGiftBtn.disabled = true;
    }

    function hideGiftLoading() {
        giftLoadingIndicator.style.display = 'none';
        submitGiftBtn.disabled = false;
    }

    function showGiftMessage(message, type) {
        giftMessageBox.textContent = message;
        giftMessageBox.className = 'message-box ' + type;
        giftMessageBox.style.display = 'block';
    }

    function hideGiftMessage() {
        giftMessageBox.style.display = 'none';
    }

    console.log('=== Gift Form Initialization Completed ===');
}

// IBAN Copy Function
function copyIban() {
    const ibanNumber = document.getElementById('ibanNumber').textContent;
    const popup = document.getElementById('ibanCopiedPopup');

    // Copy to clipboard
    navigator.clipboard.writeText(ibanNumber).then(function() {
        // Show popup
        popup.classList.add('show');

        // Hide popup after 2 seconds
        setTimeout(function() {
            popup.classList.remove('show');
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy IBAN:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = ibanNumber;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            // Show popup
            popup.classList.add('show');
            setTimeout(function() {
                popup.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
    });
}

// Gallery Slideshow Functions
let currentSlideIndex = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    // Remove active class from current slide and dot
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex].classList.remove('active');

    // Update index
    currentSlideIndex += direction;

    // Loop around if at the end or beginning
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }

    // Add active class to new slide and dot
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    // Remove active class from current slide and dot
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex].classList.remove('active');

    // Update index
    currentSlideIndex = index;

    // Add active class to new slide and dot
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

// Add keyboard navigation for slideshow
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

// Add touch swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('DOMContentLoaded', function() {
    const slideshowContainer = document.querySelector('.slideshow-container');

    if (slideshowContainer) {
        slideshowContainer.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });

        slideshowContainer.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swiped left, go to next slide
                changeSlide(1);
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // Swiped right, go to previous slide
                changeSlide(-1);
            }
        }
    }
});
