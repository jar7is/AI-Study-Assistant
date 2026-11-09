
const notes = document.getElementById("notes");
const generateBtn = document.getElementById("generateBtn");
const charCount = document.getElementById("charCount");
const status = document.getElementById("status");

const summary = document.getElementById("summary");
const quiz = document.getElementById("quiz");
const flashcards = document.getElementById("flashcards");

const tabs = document.querySelectorAll(".tab");

let currentResult = "";
let studyHistory = [];

// Update the character count.
notes.addEventListener("input", function () {
    charCount.textContent = notes.value.length + " / 12000 characters";
});

// Switch between the three result tabs.
tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        tabs.forEach(function (item) {
            item.classList.remove("active");
        });

        tab.classList.add("active");

        document.querySelectorAll(".tab-content").forEach(function (content) {
            content.classList.add("hidden");
        });

        document.getElementById(tab.dataset.tab).classList.remove("hidden");
    });
});

async function generateMaterial() {
    let text = notes.value.trim();

    if (text === "") {
        status.innerText = "Please enter your notes first!";
        return;
    }

    generateBtn.disabled = true;
    generateBtn.innerText = "Generating...";
    status.innerText = "Gemini AI is preparing your study material...";

    try {
        let response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                notes: text,
                style: document.getElementById("answerStyle").value
            })
        });

        let data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Generation failed");
        }

        // Show summary
        document.getElementById("summary").innerHTML = "";

        let summaryText = document.createElement("p");
        summaryText.innerText = data.summary;
        document.getElementById("summary").appendChild(summaryText);

        // Show quiz
        let quiz = document.getElementById("quiz");
        quiz.innerHTML = "";

        data.quiz.forEach((item, index) => {
            let div = document.createElement("div");
            div.className = "quiz-question";

            let question = document.createElement("h3");
            question.innerText = (index + 1) + ". " + item.question;
            div.appendChild(question);

            let feedback = document.createElement("p");

            item.options.forEach((option, i) => {
                let button = document.createElement("button");
                button.className = "quiz-option";
                button.innerText = option;

                button.addEventListener("click", function () {
                    if (div.dataset.answered) return;

                    div.dataset.answered = "true";

                    if (i === item.answerIndex) {
                        button.classList.add("correct");
                        feedback.innerText = "Correct! " + item.explanation;
                    } else {
                        button.classList.add("wrong");
                        feedback.innerText = "Incorrect. " +
                            item.explanation;
                    }
                });

                div.appendChild(button);
            });

            div.appendChild(feedback);
            quiz.appendChild(div);
        });

        // Show flashcards
        let flashcards = document.getElementById("flashcards");
        flashcards.innerHTML = "";

        data.flashcards.forEach(item => {
            let button = document.createElement("button");
            button.className = "flashcard";
            button.innerText = item.question;

            button.addEventListener("click", function () {
                button.innerText =
                    button.dataset.showAnswer === "true"
                    ? item.question
                    : item.answer;

                button.dataset.showAnswer =
                    button.dataset.showAnswer === "true"
                    ? "false"
                    : "true";
            });

            flashcards.appendChild(button);
        });

        currentResult = data.summary;

        saveHistory(text);

        status.innerText = "Study material generated successfully!";

        showSection("summary");

    } catch (error) {
        status.innerText = error.message;
    }

    generateBtn.disabled = false;
    generateBtn.innerText = "✦ Generate study material";
}


// Save recent study sessions in memory for now.
function saveHistory(text) {
    studyHistory.unshift(text);

    if (studyHistory.length > 5) {
        studyHistory.pop();
    }

    showHistory();
}

// Display saved sessions.
function showHistory() {
    const history = document.getElementById("history");
    history.innerHTML = "";

    if (studyHistory.length === 0) {
        history.textContent = "No study sessions yet.";
        return;
    }

    studyHistory.forEach(function (item, index) {
        const entry = document.createElement("div");
        entry.className = "history-item";

        const title = document.createElement("p");
        title.textContent = item.substring(0, 70);

        const openBtn = document.createElement("button");
        openBtn.className = "secondary-btn";
        openBtn.textContent = "View";

        openBtn.addEventListener("click", function () {
            notes.value = item;
            charCount.textContent = item.length + " / 12000 characters";
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "secondary-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", function () {
            studyHistory.splice(index, 1);
            showHistory();
        });

        entry.appendChild(title);
        entry.appendChild(openBtn);
        entry.appendChild(deleteBtn);
        history.appendChild(entry);
    });
}

// Clear all current history.
document.getElementById("clearHistoryBtn").addEventListener("click", function () {
    studyHistory = [];
    showHistory();
});

// Clear the notes and output.
document.getElementById("clearBtn").addEventListener("click", function () {
    notes.value = "";
    charCount.textContent = "0 / 12000 characters";
    currentResult = "";

    summary.innerHTML = '<p class="empty-message">Your summary will appear here.</p>';
    quiz.innerHTML = '<p class="empty-message">Your quiz will appear here.</p>';
    flashcards.innerHTML = '<p class="empty-message">Your flashcards will appear here.</p>';

    status.textContent = "";
});

// Copy the current result.
document.getElementById("copyBtn").addEventListener("click", async function () {
    if (currentResult === "") {
        status.textContent = "Generate study material first.";
        return;
    }

    try {
        await navigator.clipboard.writeText(currentResult);
        status.textContent = "Copied to clipboard!";
    } catch (error) {
        status.textContent = "Copy failed. Try downloading the result.";
    }
});

// Download the current result as a text file.
document.getElementById("downloadBtn").addEventListener("click", function () {
    if (currentResult === "") {
        status.textContent = "Generate study material first.";
        return;
    }

    const file = new Blob([currentResult], { type: "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(file);
    link.download = "study-notes.txt";
    link.click();

    URL.revokeObjectURL(link.href);
});

// Switch between dark and light themes.
document.getElementById("themeBtn").addEventListener("click", function () {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        this.textContent = "☀️ Theme";
    } else {
        this.textContent = "🌙 Theme";
    }
});

// Basic settings message for the first version.
document.getElementById("settingsBtn").addEventListener("click", function () {
    alert("AI API settings will be added in the next version.");
});
