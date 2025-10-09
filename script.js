document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");
  // DOM Elements
  const kanjielment = document.getElementById("kanji");
  const input = document.getElementById("kanjiinput");
  const result = document.getElementById("result");
  const topbar = document.getElementById("topbar");
  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");
  const startButton = document.getElementById("start-button");
  const scoreElement = document.getElementById("score");
  const winScreen = document.getElementById("win-screen");
  const finalScoreElement = document.getElementById("final-score");
  const restartButton = document.getElementById("restart-button");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const maxQuestionsSlider = document.getElementById("max-questions");
  const maxQuestionsValue = document.getElementById("max-questions-value");

  // Game state variables
  let score = 0;
  let remainingKanji = [];
  let remainingReadingKanji = [];
  let remainingMeaningKanji = [];
  let remainingChoiceKanji = [];
  let randomKanji;
  let randomMode;
  let difficultKanji = [];
  let isReadingMode = false;
  let isChoiceMode = false;
  const inputField = document.getElementById("kanjiinput");
  const multipleChoice = document.getElementById("multiple-choice");
  const choiceOptions = document.querySelectorAll(".choice-option");
  let compositionText = "";
  let maxQuestions = 25;
  let totalQuestions = 0;
  let questionsAnswered = 0;
  let questionPool = [];

  let waitingForNext = false;
  let waitingForCorrect = false;
  let currentCorrectAnswer = "";
  let currentChoiceAnswer = null;

  // Function to generate the chapter structure
  function generateChapterStructure() {
    const chapterSelect = document.getElementById("chapter-select");

    // Group kanji by chapter and subchapter
    const chapters = {};
    kanjiLib.forEach((kanji) => {
      if (!chapters[kanji.chapter]) {
        chapters[kanji.chapter] = {};
      }
      if (!chapters[kanji.chapter][kanji.subchapter]) {
        chapters[kanji.chapter][kanji.subchapter] = [];
      }
      chapters[kanji.chapter][kanji.subchapter].push(kanji);
    });

    // Generate HTML for each chapter
    Object.keys(chapters)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((chapterNum) => {
        const chapterGroup = document.createElement("div");
        chapterGroup.className = "chapter-group";

        const isLastChapter =
          chapterNum ===
          Math.max(...Object.keys(chapters).map(Number)).toString();
        chapterGroup.innerHTML = `
                <div class="chapter-label">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" value="${chapterNum}" ${isLastChapter ? "checked" : ""}>
                    </div>
                    <span class="chapter-text">Chapter ${chapterNum}</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="subchapter-group">
                    ${generateSubchapters(chapters[chapterNum], chapterNum, isLastChapter)}
                </div>
            `;

        chapterSelect.appendChild(chapterGroup);
      });
  }

  // Function to generate subchapters
  function generateSubchapters(subchapters, chapterNum, isLastChapter) {
    return Object.keys(subchapters)
      .sort((a, b) => Number(a) - Number(b))
      .map((subNum) => {
        const kanjiList = subchapters[subNum];
        // Filter for single-character kanji only
        const singleKanji = kanjiList
          .map((k) => k.kanji)
          .filter((k) => k.length === 1)
          .join(" ");

        return `
                    <div class="subchapter">
                        <div class="subchapter-label">
                            <div class="checkbox-wrapper">
                                <input type="checkbox" value="${chapterNum}-${subNum}" ${isLastChapter ? "checked" : ""}>
                            </div>
                            <span class="subchapter-text">${singleKanji}</span>
                            <span class="arrow">▼</span>
                        </div>
                        <div class="kanji-group">
                            ${generateKanjiCheckboxes(kanjiList, chapterNum, subNum, isLastChapter)}
                        </div>
                    </div>
                `;
      })
      .join("");
  }

  // Function to generate individual kanji checkboxes
  function generateKanjiCheckboxes(
    kanjiList,
    chapterNum,
    subNum,
    isLastChapter,
  ) {
    return kanjiList
      .map(
        (kanji, index) => `
            <label>
                <input type="checkbox"
                       value="${chapterNum}-${subNum}-${index}"
                       data-kanji="${kanji.kanji}"
                       ${isLastChapter ? "checked" : ""}>
                ${kanji.kanji}
            </label>
        `,
      )
      .join("");
  }

  // Initialize chapter structure
  generateChapterStructure();

  // Initialize max questions slider
  maxQuestions = parseInt(maxQuestionsSlider.value);
  maxQuestionsValue.textContent = maxQuestions;

  maxQuestionsSlider.addEventListener("input", (e) => {
    maxQuestions = parseInt(e.target.value);
    maxQuestionsValue.textContent = maxQuestions;
  });

  // Event Listeners for chapter structure
  document.querySelectorAll(".chapter-label .arrow").forEach((arrow) => {
    arrow.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const chapterGroup = arrow.closest(".chapter-group");
      chapterGroup.classList.toggle("open");
    });
  });

  document.querySelectorAll(".subchapter-label .arrow").forEach((arrow) => {
    arrow.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const subchapter = arrow.closest(".subchapter");
      subchapter.classList.toggle("open");
    });
  });

  // Handle chapter checkboxes
  document
    .querySelectorAll('.chapter-label input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const subchapters = e.target
          .closest(".chapter-group")
          .querySelectorAll(
            '.subchapter-label input[type="checkbox"], .kanji-group input[type="checkbox"]',
          );
        subchapters.forEach((sub) => {
          sub.checked = e.target.checked;
        });
      });
    });

  // Handle subchapter checkboxes
  document
    .querySelectorAll('.subchapter-label input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const kanjiBoxes = e.target
          .closest(".subchapter")
          .querySelectorAll('.kanji-group input[type="checkbox"]');
        kanjiBoxes.forEach((box) => {
          box.checked = e.target.checked;
        });
      });
    });

  // Function to get selected kanji
  function getSelectedKanji() {
    const selectedKanji = [];
    document
      .querySelectorAll('.kanji-group input[type="checkbox"]:checked')
      .forEach((checkbox) => {
        const kanjiChar = checkbox.getAttribute("data-kanji");
        const kanji = kanjiLib.find((k) => k.kanji === kanjiChar);
        if (kanji) selectedKanji.push(kanji);
      });
    return selectedKanji;
  }

  // Game functionality
  function startGame() {
    score = 0;
    remainingKanji = getSelectedKanji();
    difficultKanji = [];
    questionsAnswered = 0;

    if (remainingKanji.length === 0) {
      alert("Please select at least one kanji to practice!");
      return;
    }

    // Create a pool of all possible questions
    questionPool = [];
    remainingKanji.forEach((kanji) => {
      questionPool.push({ kanji: kanji, mode: "reading" });
      questionPool.push({ kanji: kanji, mode: "meaning" });
      questionPool.push({ kanji: kanji, mode: "choice" });
    });

    // Shuffle and limit to maxQuestions
    questionPool = questionPool
      .sort(() => Math.random() - 0.5)
      .slice(0, maxQuestions);

    totalQuestions = questionPool.length;

    // Create separate arrays for each mode from the question pool
    remainingReadingKanji = questionPool
      .filter((q) => q.mode === "reading")
      .map((q) => q.kanji);
    remainingMeaningKanji = questionPool
      .filter((q) => q.mode === "meaning")
      .map((q) => q.kanji);
    remainingChoiceKanji = questionPool
      .filter((q) => q.mode === "choice")
      .map((q) => q.kanji);

    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    updateProgress();
    nextKanji();
  }

  function handleReadingInput(event) {
    if (!isReadingMode) return;

    const value = event.target.value;
    // Use IME-style conversion
    event.target.value = wanakana.toKana(value, {
      IMEMode: true,
      useObsoleteKana: false,
    });
  }

  function nextKanji() {
    if (
      remainingReadingKanji.length === 0 &&
      remainingMeaningKanji.length === 0 &&
      remainingChoiceKanji.length === 0
    ) {
      endGame();
      return;
    }

    // Clear previous choice selections
    choiceOptions.forEach((option) => {
      option.classList.remove("correct", "incorrect");
    });

    // Determine mode randomly between the three modes
    const availableModes = [];
    if (remainingReadingKanji.length > 0) availableModes.push("reading");
    if (remainingMeaningKanji.length > 0) availableModes.push("meaning");
    if (remainingChoiceKanji.length > 0) availableModes.push("choice");

    randomMode =
      availableModes[Math.floor(Math.random() * availableModes.length)];

    if (randomMode === "reading") {
      isReadingMode = true;
      isChoiceMode = false;
      const randomIndex = Math.floor(
        Math.random() * remainingReadingKanji.length,
      );
      randomKanji = remainingReadingKanji[randomIndex];
      remainingReadingKanji.splice(randomIndex, 1);

      kanjielment.innerHTML = randomKanji.kanji;
      input.placeholder = "kanji reading";
      input.classList.remove("hidden");
      multipleChoice.classList.add("hidden");
    } else if (randomMode === "meaning") {
      isReadingMode = false;
      isChoiceMode = false;
      const randomIndex = Math.floor(
        Math.random() * remainingMeaningKanji.length,
      );
      randomKanji = remainingMeaningKanji[randomIndex];
      remainingMeaningKanji.splice(randomIndex, 1);

      kanjielment.innerHTML = randomKanji.kanji;
      input.placeholder = "kanji meaning";
      input.classList.remove("hidden");
      multipleChoice.classList.add("hidden");
    } else {
      // Choice mode - show reading, pick kanji
      isReadingMode = false;
      isChoiceMode = true;
      const randomIndex = Math.floor(
        Math.random() * remainingChoiceKanji.length,
      );
      randomKanji = remainingChoiceKanji[randomIndex];
      remainingChoiceKanji.splice(randomIndex, 1);

      kanjielment.innerHTML = randomKanji.reading;
      input.classList.add("hidden");
      multipleChoice.classList.remove("hidden");
      setupMultipleChoice();
    }

    topbar.className = randomMode;
    result.innerHTML = "";
    input.value = "";
    compositionText = "";
    updateProgress();
  }

  function animateNumber(element, start, end, duration = 500) {
    const startTime = performance.now();
    const difference = end - start;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + difference * easeOutQuart);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function animateScore(element, start, end) {
    const duration = 500;
    const startTime = performance.now();
    element.classList.add("score-animate");

    function updateNumber(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        element.classList.remove("score-animate");
      }
    }

    requestAnimationFrame(updateNumber);
  }

  function setupMultipleChoice() {
    // Get all unique kanji from the original selected kanji for choices
    const allSelectedKanji = getSelectedKanji();

    // Get kanji from the same chapter as the correct answer
    const sameChapterKanji = allSelectedKanji.filter(
      (k) => k.chapter === randomKanji.chapter && k.kanji !== randomKanji.kanji,
    );

    // If not enough kanji in same chapter, use any available kanji
    const allAvailableKanji =
      sameChapterKanji.length >= 2
        ? sameChapterKanji
        : allSelectedKanji.filter((k) => k.kanji !== randomKanji.kanji);

    // Create array of wrong choices
    const wrongChoices = [];
    const shuffled = [...allAvailableKanji].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(2, shuffled.length); i++) {
      wrongChoices.push(shuffled[i]);
    }

    // Create array of all choices (correct + wrong)
    const allChoices = [randomKanji, ...wrongChoices];

    // Shuffle the choices
    const shuffledChoices = allChoices.sort(() => Math.random() - 0.5);

    // Set up the choice options
    choiceOptions.forEach((option, index) => {
      if (index < shuffledChoices.length) {
        option.textContent = shuffledChoices[index].kanji;
        option.dataset.correct =
          shuffledChoices[index].kanji === randomKanji.kanji;
        option.style.display = "block";
      } else {
        option.style.display = "none";
      }
    });
  }

  function handleChoiceClick(event) {
    if (!isChoiceMode) return;

    const clickedOption = event.target;
    const isCorrect = clickedOption.dataset.correct === "true";

    // Disable all options temporarily
    choiceOptions.forEach((option) => {
      option.style.pointerEvents = "none";
    });

    if (isCorrect) {
      clickedOption.classList.add("correct");
      result.innerHTML = "Correct!";
      result.className = "correct";

      // Update score and trigger animation
      score++;
      scoreElement.textContent = score;
      scoreElement.classList.add("score-animate");

      setTimeout(() => {
        choiceOptions.forEach((option) => {
          option.style.pointerEvents = "auto";
        });
        questionsAnswered++;
        nextKanji();
      }, 1000);
    } else {
      clickedOption.classList.add("incorrect");

      // Highlight the correct answer
      choiceOptions.forEach((option) => {
        if (option.dataset.correct === "true") {
          option.classList.add("correct");
        }
      });

      result.innerHTML = `Incorrect. The correct answer is: ${randomKanji.kanji}`;
      result.className = "incorrect";
      difficultKanji.push(randomKanji);

      setTimeout(() => {
        choiceOptions.forEach((option) => {
          option.style.pointerEvents = "auto";
        });
        questionsAnswered++;
        nextKanji();
      }, 2000);
    }
  }

  function checkAnswer() {
    let userAnswer = input.value.trim();

    if (waitingForCorrect) {
      if (randomMode === "reading") {
        userAnswer = wanakana.toHiragana(userAnswer);
      } else {
        userAnswer = userAnswer.toLowerCase();
      }

      if (userAnswer === currentCorrectAnswer) {
        waitingForCorrect = false;
        currentCorrectAnswer = "";
        nextKanji();
        result.innerHTML = "";
        input.value = "";
      } else {
        result.innerHTML = `Incorrect. The correct answer is: ${currentCorrectAnswer}. Please type it to continue.`;
        input.value = "";
      }
      return;
    }
    const correctAnswer =
      randomMode === "reading"
        ? randomKanji.reading
        : randomKanji.meaning.toLowerCase();

    if (randomMode === "reading") {
      userAnswer = wanakana.toHiragana(userAnswer);
    } else {
      userAnswer = userAnswer.toLowerCase();
    }

    if (userAnswer === correctAnswer) {
      result.innerHTML = "Correct!";
      result.className = "correct";

      // Remove any existing animation class
      scoreElement.classList.remove("score-animate");

      // Update score and trigger animation
      score++;
      scoreElement.textContent = score;

      // Force browser to process the DOM update
      void scoreElement.offsetWidth;

      // Add animation class
      scoreElement.classList.add("score-animate");

      questionsAnswered++;
      nextKanji();
      input.value = "";
    } else {
      result.innerHTML = `Incorrect. The correct answer is: ${correctAnswer}. Please type it to continue.`;
      result.className = "incorrect";
      difficultKanji.push(randomKanji);
      waitingForCorrect = true;
      currentCorrectAnswer = correctAnswer;
      questionsAnswered++;
      input.value = "";
    }
  }

  function updateProgress() {
    const percentage = (questionsAnswered / totalQuestions) * 100;

    const circle = document.querySelector(".progress-ring__circle");
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset =
      circumference - (percentage / 100) * circumference;

    scoreElement.textContent = score;
  }

  function endGame() {
    gameScreen.classList.add("hidden");
    winScreen.classList.remove("hidden");
    finalScoreElement.textContent = score;

    const difficultCount = document.getElementById("difficult-count");
    if (difficultCount) {
      difficultCount.textContent = difficultKanji.length;
    }

    const reviewButton = document.getElementById("review-button");
    const startReviewButton = document.getElementById("start-review-button");

    if (reviewButton) {
      if (difficultKanji.length > 0) {
        reviewButton.classList.remove("hidden");
      } else {
        reviewButton.classList.add("hidden");
      }
    }

    // Show start screen review button if there are difficult kanji
    if (startReviewButton) {
      if (difficultKanji.length > 0) {
        startReviewButton.classList.remove("hidden");
      } else {
        startReviewButton.classList.add("hidden");
      }
    }
  }

  // Event listeners
  startButton.addEventListener("click", startGame);

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  });

  restartButton.addEventListener("click", () => {
    winScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });

  const reviewButton = document.getElementById("review-button");
  if (reviewButton) {
    reviewButton.addEventListener("click", () => {
      remainingKanji = [...difficultKanji];
      score = 0;
      questionsAnswered = 0;

      // Create a pool of all possible questions from difficult kanji
      questionPool = [];
      remainingKanji.forEach((kanji) => {
        questionPool.push({ kanji: kanji, mode: "reading" });
        questionPool.push({ kanji: kanji, mode: "meaning" });
        questionPool.push({ kanji: kanji, mode: "choice" });
      });

      // Shuffle and limit to maxQuestions
      questionPool = questionPool
        .sort(() => Math.random() - 0.5)
        .slice(0, maxQuestions);

      totalQuestions = questionPool.length;

      // Create separate arrays for each mode from the question pool
      remainingReadingKanji = questionPool
        .filter((q) => q.mode === "reading")
        .map((q) => q.kanji);
      remainingMeaningKanji = questionPool
        .filter((q) => q.mode === "meaning")
        .map((q) => q.kanji);
      remainingChoiceKanji = questionPool
        .filter((q) => q.mode === "choice")
        .map((q) => q.kanji);

      difficultKanji = [];
      winScreen.classList.add("hidden");
      gameScreen.classList.remove("hidden");
      nextKanji();
    });
  }

  // Add event listeners for multiple choice options
  choiceOptions.forEach((option) => {
    option.addEventListener("click", handleChoiceClick);
  });

  // Add functionality for start screen review button
  const startReviewButton = document.getElementById("start-review-button");
  if (startReviewButton) {
    startReviewButton.addEventListener("click", () => {
      remainingKanji = [...difficultKanji];
      score = 0;
      questionsAnswered = 0;

      // Create a pool of all possible questions from difficult kanji
      questionPool = [];
      remainingKanji.forEach((kanji) => {
        questionPool.push({ kanji: kanji, mode: "reading" });
        questionPool.push({ kanji: kanji, mode: "meaning" });
        questionPool.push({ kanji: kanji, mode: "choice" });
      });

      // Shuffle and limit to maxQuestions
      questionPool = questionPool
        .sort(() => Math.random() - 0.5)
        .slice(0, maxQuestions);

      totalQuestions = questionPool.length;

      // Create separate arrays for each mode from the question pool
      remainingReadingKanji = questionPool
        .filter((q) => q.mode === "reading")
        .map((q) => q.kanji);
      remainingMeaningKanji = questionPool
        .filter((q) => q.mode === "meaning")
        .map((q) => q.kanji);
      remainingChoiceKanji = questionPool
        .filter((q) => q.mode === "choice")
        .map((q) => q.kanji);

      startScreen.classList.add("hidden");
      gameScreen.classList.remove("hidden");
      nextKanji();
    });
  }

  // Add input event listener for real-time conversion
  inputField.addEventListener("input", handleReadingInput);
});
