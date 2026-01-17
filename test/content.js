// Define the getRequest function using fetch
async function getRequest(url, referer) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Referer": referer,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return { status: "error", error: error.message };
    }
}

// Fetch assignmentId dynamically from the URL or page content
const urlParams = new URLSearchParams(window.location.search);
const assignmentId = urlParams.get('assignedwork_id') || extractFromPage(); // Replace extractFromPage() with logic to retrieve from page content if needed

// Dynamically determine questionId based on user interaction or page context
const questionId = getCurrentQuestionId(); // Replace getCurrentQuestionId() with logic to determine current question

// Function to get current question ID (placeholder)
function getCurrentQuestionId() {
    // Implement logic to extract question ID dynamically, e.g., based on DOM element or user selection
    const questionElement = document.querySelector('.question.active'); // Example: CSS selector for active question
    return questionElement ? questionElement.dataset.questionId : null;
}

// Example dynamic extraction function (if assignmentId isn't in the URL)
function extractFromPage() {
    // Implement logic to extract the assignment ID dynamically from the page, e.g., using DOM
    const assignmentElement = document.querySelector('#assignmentData'); // Example element ID
    return assignmentElement ? assignmentElement.dataset.assignmentId : null;
}

// Fetch the answers dynamically
async function fetchAnswers() {
    const response = await getRequest(
        `https://vle.mathswatch.co.uk/duocms/api/answers?assignedwork_id=${assignmentId}`,
        location.href
    );

    if (response.status === "success") {
        const answers = response.data
            .filter(q => q.question_id == questionId)
            .flatMap(q => q.answer)
            .filter(a => a.marks !== 0)
            .flatMap(a => (Array.isArray(a.text) ? a.text : [a.text]))
            .filter(text => text)
            .join('\n');

        console.log(answers); // Output answers to console
        return [answers, questionId];
    } else {
        console.error("Failed to fetch answers:", response);
        return null;
    }
}

fetchAnswers(); // Call the function to execute
