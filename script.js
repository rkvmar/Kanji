document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // DOM Elements
    const kanjielment = document.getElementById('kanji');
    const input = document.getElementById('kanjiinput');
    const result = document.getElementById('result');
    const topbar = document.getElementById('topbar');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const startButton = document.getElementById('start-button');
    const scoreElement = document.getElementById('score');
    const winScreen = document.getElementById('win-screen');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // Add these debug lines
    console.log('Start button element:', startButton);
    console.log('Start screen element:', startScreen);
    console.log('Game screen element:', gameScreen);

    // Kanji Library
    

    // Game Variables
    let randomKanji;
    let mode = ['reading', 'meaning'];
    let randomMode;
    let remainingReadingKanji = [];
    let remainingMeaningKanji = [];
    let score = 0;
    let mistakeMade = false;
    let filteredKanji = [];

    // Hiragana conversion map
    const hiraganaMap = {
        'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
        'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
        'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
        'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
        'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
        'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
        'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
        'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
        'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
        'wa': 'わ', 'wo': 'を', 'nn': 'ん',
        'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
        'za': 'ざ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
        'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
        'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
        'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': '',
        'ltsu': 'っ',
        'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
        'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
        'jya': '', 'jyu': 'じゅ', 'jyo': 'じょ',
        'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
        'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
        'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
        'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
        'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
        'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
        'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
        'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
        'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
        '~': '〜'
    };

    // First, declare the variables
    let difficultKanji;
    let reviewMode = false;

    // Then define all functions
    function loadDifficultKanji() {
        const saved = localStorage.getItem('difficultKanji');
        const loadedKanji = saved ? JSON.parse(saved) : [];
        console.log('Loaded difficult kanji:', loadedKanji);
        return loadedKanji;
    }

    function saveDifficultKanji() {
        const kanjiArray = Array.from(difficultKanji);
        console.log('Saving difficult kanji:', kanjiArray);
        localStorage.setItem('difficultKanji', JSON.stringify(kanjiArray));
    }

    function updateStartScreenReviewButton() {
        const startReviewButton = document.getElementById('start-review-button');
        const difficultCount = difficultKanji.size;
        console.log('Updating review button. Difficult count:', difficultCount);
        console.log('Current difficult kanji:', Array.from(difficultKanji));
        
        if (difficultCount > 0) {
            startReviewButton.classList.remove('hidden');
            startReviewButton.textContent = `Review Difficult Kanji (${difficultCount})`;
            console.log('Review button shown');
        } else {
            startReviewButton.classList.add('hidden');
            console.log('Review button hidden');
        }
    }

    // Initialize the Set after functions are defined
    difficultKanji = new Set(loadDifficultKanji());

    function chooseKanji() {
        console.log('Choosing kanji');
        console.log('Review mode:', reviewMode);
        
        mistakeMade = false;
        
        if (reviewMode) {
            const difficultKanjiArray = Array.from(difficultKanji).map(k => JSON.parse(k));
            console.log('Difficult kanji array:', difficultKanjiArray);
            
            if (difficultKanjiArray.length === 0) {
                console.log('Review complete - showing win screen');
                gameScreen.classList.add('hidden');
                winScreen.classList.remove('hidden');
                finalScoreElement.textContent = score;
                document.getElementById('difficult-count').textContent = '0';
                document.getElementById('review-button').classList.add('hidden');
                return;
            }

            const randomIndex = Math.floor(Math.random() * difficultKanjiArray.length);
            randomKanji = difficultKanjiArray[randomIndex];
            randomMode = mode[Math.floor(Math.random() * mode.length)];
            console.log('Selected review kanji:', randomKanji);
            console.log('Selected mode:', randomMode);
        } else {
            // Calculate total remaining (each kanji needs to be done twice - once for reading, once for meaning)
            const totalRemaining = remainingReadingKanji.length + remainingMeaningKanji.length;
            
            // Debug logs
            console.log('Current total remaining:', totalRemaining);
            console.log('Reading list length:', remainingReadingKanji.length);
            console.log('Meaning list length:', remainingMeaningKanji.length);
            
            // Select initial mode
            randomMode = mode[Math.floor(Math.random() * mode.length)];
            
            // If reading mode is selected but reading list is empty, force meaning mode
            if (randomMode === 'reading' && remainingReadingKanji.length === 0) {
                randomMode = 'meaning';
            }
            // If meaning mode is selected but meaning list is empty, force reading mode
            else if (randomMode === 'meaning' && remainingMeaningKanji.length === 0) {
                randomMode = 'reading';
            }
            
            // Only show win screen if both lists are completely empty
            if (remainingReadingKanji.length === 0 && remainingMeaningKanji.length === 0) {
                checkWinCondition();
                return;
            }
            
            if (randomMode === 'reading') {
                const randomIndex = Math.floor(Math.random() * remainingReadingKanji.length);
                randomKanji = remainingReadingKanji[randomIndex];
                remainingReadingKanji.splice(randomIndex, 1);
                console.log('Selected reading kanji:', randomKanji);
                console.log('Remaining reading list:', remainingReadingKanji);
            } else if (randomMode === 'meaning') {
                const randomIndex = Math.floor(Math.random() * remainingMeaningKanji.length);
                randomKanji = remainingMeaningKanji[randomIndex];
                remainingMeaningKanji.splice(randomIndex, 1);
                console.log('Selected meaning kanji:', randomKanji);
                console.log('Remaining meaning list:', remainingMeaningKanji);
            }
        }
        
        // Update display
        kanjielment.innerHTML = randomKanji.kanji;
        if (randomMode === 'reading') {
            input.placeholder = 'kanji reading';
            topbar.className = 'reading';
        } else if (randomMode === 'meaning') {
            input.placeholder = 'kanji meaning';
            topbar.className = 'meaning';
        }
        result.innerHTML = '';
        input.value = '';
    }

    function convertToHiragana(input) {
        let result = '';
        let i = 0;
        
        while (i < input.length) {
            let found = false;
            
            if (i < input.length - 1) {
                let pair = input.slice(i, i+2).toLowerCase();
                let triple = input.slice(i, i+3).toLowerCase();
                let quad = input.slice(i, i+4).toLowerCase();
                
                if (hiraganaMap[quad]) {
                    result += hiraganaMap[quad];
                    i += 4;
                    found = true;
                    continue;
                }
                
                if (hiraganaMap[triple]) {
                    result += hiraganaMap[triple];
                    i += 3;
                    found = true;
                    continue;
                }
                
                if (hiraganaMap[pair]) {
                    result += hiraganaMap[pair];
                    i += 2;
                    found = true;
                    continue;
                }
            }
            
            let single = input[i].toLowerCase();
            if (hiraganaMap[single]) {
                result += hiraganaMap[single];
                found = true;
            }
            
            if (!found) {
                result += input[i];
            }
            i++;
        }
        return result;
    }

    function checkAnswer() {
        console.log('Checking answer:', input.value);
        console.log('Current mode:', randomMode);
        console.log('Current kanji:', randomKanji);
        console.log('Review mode:', reviewMode);

        if (randomMode === 'reading') {
            if (input.value.toLowerCase() === randomKanji.reading.toLowerCase()) {
                console.log('Correct reading answer');
                if (!mistakeMade) {
                    score++;
                    scoreElement.innerHTML = score;
                }
                if (reviewMode) {
                    console.log('Removing from difficult kanji:', randomKanji);
                    difficultKanji.delete(JSON.stringify(randomKanji));
                    saveDifficultKanji();
                    updateStartScreenReviewButton();
                }
                
                // Update progress before checking win condition
                updateProgress();
                
                // Check win condition before choosing next kanji
                if (remainingReadingKanji.length === 0 && remainingMeaningKanji.length === 0) {
                    checkWinCondition();
                } else {
                    chooseKanji();
                }
                
            } else {
                console.log('Incorrect reading answer');
                mistakeMade = true;
                input.value = '';
                result.innerHTML = randomKanji.reading;
                console.log('Adding to difficult kanji:', randomKanji);
                difficultKanji.add(JSON.stringify(randomKanji));
                saveDifficultKanji();
                updateStartScreenReviewButton();
            }
        } else if (randomMode === 'meaning') {
            if (input.value.toLowerCase() === randomKanji.meaning.toLowerCase()) {
                console.log('Correct meaning answer');
                if (!mistakeMade) {
                    score++;
                    scoreElement.innerHTML = score;
                }
                if (reviewMode) {
                    console.log('Removing from difficult kanji:', randomKanji);
                    difficultKanji.delete(JSON.stringify(randomKanji));
                    saveDifficultKanji();
                    updateStartScreenReviewButton();
                }
                
                // Update progress before checking win condition
                updateProgress();
                
                // Check win condition before choosing next kanji
                if (remainingReadingKanji.length === 0 && remainingMeaningKanji.length === 0) {
                    checkWinCondition();
                } else {
                    chooseKanji();
                }
                
            } else {
                console.log('Incorrect meaning answer');
                mistakeMade = true;
                input.value = '';
                result.innerHTML = randomKanji.meaning;
                console.log('Adding to difficult kanji:', randomKanji);
                difficultKanji.add(JSON.stringify(randomKanji));
                saveDifficultKanji();
                updateStartScreenReviewButton();
            }
        }
    }

    function checkWinCondition() {
        if (remainingReadingKanji.length === 0 && remainingMeaningKanji.length === 0) {
            gameScreen.classList.add('hidden');
            winScreen.classList.remove('hidden');
            finalScoreElement.textContent = score;
            
            // Update difficult kanji count
            const difficultCount = difficultKanji.size;
            document.getElementById('difficult-count').textContent = difficultCount;
            
            // Show/hide review button based on difficult kanji
            const reviewButton = document.getElementById('review-button');
            if (difficultCount > 0) {
                reviewButton.classList.remove('hidden');
            } else {
                reviewButton.classList.add('hidden');
            }
        }
    }

    function resetGame() {
        console.log('Resetting game');
        reviewMode = false;
        score = 0;
        scoreElement.innerHTML = score;
        startScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
        winScreen.classList.add('hidden');
        updateStartScreenReviewButton();
    }

    // Update the getSelectedChapters function
    function getSelectedChapters() {
        const subchapterCheckboxes = document.querySelectorAll('#chapter-select .subchapter-group input[type="checkbox"]:checked');
        return Array.from(subchapterCheckboxes).map(cb => {
            const [chapter, subchapter] = cb.value.split('-');
            return { chapter, subchapter };
        });
    }

    // Event Listeners
    startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        
        const selectedSubchapters = getSelectedChapters();
        if (selectedSubchapters.length === 0) {
            alert('Please select at least one subchapter');
            return;
        }
        
        // Filter kanji based on selected subchapters
        filteredKanji = kanjiLib.filter(k => 
            selectedSubchapters.some(s => 
                s.chapter === k.chapter && s.subchapter === k.subchapter
            )
        );
        
        remainingReadingKanji = [...filteredKanji];
        remainingMeaningKanji = [...filteredKanji];
        
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        updateProgress();
        chooseKanji();
    });

    input.addEventListener('input', () => {
        if (randomMode === 'reading') {
            input.value = convertToHiragana(input.value);
        }
    });

    input.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            if (reviewMode) {
                checkAnswer();
                input.value = '';
            } else {
                checkAnswer();
                input.value = '';
            }
        }
    });

    restartButton.addEventListener('click', () => {
        resetGame();
    });

    // Initial displays
    scoreElement.innerHTML = score;

    // Add chapter checkbox functionality
    document.querySelectorAll('.chapter-label input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const chapter = e.target.value;
            const subchapters = e.target.closest('.chapter-group')
                .querySelectorAll('.subchapter-group input[type="checkbox"]');
            
            subchapters.forEach(sub => {
                sub.checked = e.target.checked;
            });
        });
    });

    // Add new function to start review mode
    function startReviewMode() {
        reviewMode = true;
        score = 0;
        scoreElement.innerHTML = score;
        winScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        chooseKanji();
    }

    // Update review button on start screen
    updateStartScreenReviewButton();

    // Add event listener for start screen review button
    const startReviewButton = document.getElementById('start-review-button');
    console.log('Start review button element:', startReviewButton);
    
    startReviewButton.addEventListener('click', () => {
        console.log('Review button clicked');
        console.log('Current difficult kanji:', Array.from(difficultKanji));
        
        reviewMode = true;
        score = 0;
        scoreElement.innerHTML = score;
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Convert difficult kanji Set to array for review
        const difficultKanjiArray = Array.from(difficultKanji).map(k => JSON.parse(k));
        console.log('Difficult kanji array for review:', difficultKanjiArray);
        
        remainingReadingKanji = [...difficultKanjiArray];
        remainingMeaningKanji = [...difficultKanjiArray];
        console.log('Initialized remaining reading kanji:', remainingReadingKanji);
        console.log('Initialized remaining meaning kanji:', remainingMeaningKanji);
        
        chooseKanji();
    });

    // Initial update of review button
    console.log('Initial update of review button');
    updateStartScreenReviewButton();

    function updateProgress() {
        const totalQuestions = reviewMode ? 
            difficultKanji.size * 2 : 
            (remainingReadingKanji.length + remainingMeaningKanji.length);
        
        const initialTotal = reviewMode ?
            difficultKanji.size * 2 :
            filteredKanji.length * 2;
        
        const completed = initialTotal - totalQuestions;
        const percentage = (completed / initialTotal) * 100;
        
        // Update circular progress
        const circle = document.querySelector('.progress-ring__circle');
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100 * circumference);
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }

    function updateScore() {
        score++;
        document.getElementById('score').textContent = score;
    }
});