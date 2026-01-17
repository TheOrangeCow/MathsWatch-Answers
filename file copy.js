function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function getRequest(url, referrer) {
    const response = await fetch(url, {
        headers: {
            accept: "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "cache-control": "no-cache",
            "x-csrf-token": getCookie('_csrf')
        },
        referrer,
        method: "GET",
        credentials: "include"
    });
    return response.json();
}

async function getAnswers() {
    const progressBar = document.querySelector("progressbar");
    const [_, , , , section, assignmentId, questionId] = location.href.split('/');

    if (
        progressBar?.getAttribute('value') == 100 &&
        section === "assignment"
    ) {
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

            return [answers, questionId];
        }
    }
    return null;
}

let currentPage = location.href;
setInterval(async () => {
    if (currentPage !== location.href) {
        currentPage = location.href;
        const [answers, questionId] = await getAnswers();

        if (answers) {
            const theBox = document.querySelector("#studentmodal .row > div");
            theBox.innerHTML = '';

            //const questionImage = document.createElement('img');
            //questionImage.src = `https://vle.mathswatch.co.uk/images/questions/question${questionId}.png`;
            //questionImage.className = "col-sm-offset-3 col-sm-6 col-xs-12";
            //theBox.appendChild(questionImage);

            const answerText = document.createElement('p');
            answerText.innerText = answers;
            answerText.className = "col-sm-offset-3 col-sm-6 col-xs-12";
            answerText.style.fontWeight = "700";
            answerText.style.fontSize = "x-large";
            theBox.appendChild(answerText);
        }
    }
}, 500);

console.log("Answer Viewer ready: ✅");
alert("Answer Viewer ready: ✅\nReloading the page will remove the script.");
b