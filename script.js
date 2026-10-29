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

// Generate sample study material.
// We will connect the real AI API in a later step.
generateBtn.addEventListener("click", function () {
    const text = notes.value.trim();

    if (text === "") {
        status.textContent = "Please enter your notes first.";
        return;
    }

    generateBtn.disabled = true;
    status.textContent = "Preparing your study material...";

    setTimeout(function () {
        const style = document.getElementById("answerStyle").value;

        currentResult =
            "Study Notes\n\n" +
            "Topic:\n" + text + "\n\n" +
            "Study style: " + style + "\n\n" +
            "This is a sample result. Real AI generation will be added next.";

        summary.innerHTML = "";
        const heading = document.createElement("h3");
        heading.textContent = "Your Summary";

        const paragraph = document.createElement("p");
        paragraph.textContent =
            "Sample summary: " + text.substring(0, 250) +
            (text.length > 250 ? "..." : "");

        summary.appendChild(heading);
        summary.appendChild(paragraph);

        quiz.innerHTML = "";
        const quizHeading = document.createElement("h3");
        quizHeading.textContent = "Practice Quiz";

        const quizMessage = document.createElement("p");
        quizMessage.textContent =
            "Your sample quiz will be replaced with AI-generated questions.";

        quiz.appendChild(quizHeading);
        quiz.appendChild(quizMessage);

        flashcards.innerHTML = "";

        const card = document.createElement("button");
        card.className = "flashcard";
        card.textContent = "Click to reveal a sample answer";

        card.addEventListener("click", function () {
            if (card.dataset.flipped === "true") {
                card.textContent = "Click to reveal a sample answer";
                card.dataset.flipped = "false";
            } else {
                card.textContent = text.substring(0, 150);
                card.dataset.flipped = "true";
            }
        });

        flashcards.appendChild(card);

        saveHistory(text);
        status.textContent = "Sample study material is ready!";
        generateBtn.disabled = false;
    }, 300);
});

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
