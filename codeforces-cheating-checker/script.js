async function getUserInfo(handle) {
    const url = `https://codeforces.com/api/user.info?handles=${handle}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.status !== 'OK') {
            throw new Error('Error in API response: ' + data.comment);
        }
        return data.result[0];
    } catch (error) {
        console.error('Failed to fetch data from Codeforces API:', error);
        return null;
    }
}

async function getUserSubmissions(handle, start = 1, count = 1000) {
    const url = `https://codeforces.com/api/user.status?handle=${handle}&from=${start}&count=${count}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.status !== 'OK') {
            throw new Error('Error in API response: ' + data.comment);
        }
        return data.result;
    } catch (error) {
        console.error('Failed to fetch data from Codeforces API:', error);
    }
}

async function getContestSubmissions(handle, contestId) {
    const url = `https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${handle}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.status !== 'OK') {
            throw new Error('Error in API response: ' + data.comment);
        }
        return data.result;
    } catch (error) {
        console.error('Failed to fetch data from Codeforces API:', error);
    }
}

async function checkForCheating(handle) {
    const submissions = await getUserSubmissions(handle);
    if (!submissions) return false;

    const contestIds = new Set(submissions.map(submission => submission.contestId));

    for (const contestId of contestIds) {
        const contestSubmissions = await getContestSubmissions(handle, contestId);
        const allSkipped = contestSubmissions.every(submission => submission.verdict === 'SKIPPED');

        if (allSkipped) {
            return true;
        }
    }
    return false;
}

async function checkCheating() {
    const handle = document.getElementById('username').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Checking...';

    const userInfo = await getUserInfo(handle);
    if (!userInfo) {
        resultDiv.innerHTML = `<p style="color: red;">USER NOT FOUND</p>`;
        return;
    }

    const cheated = await checkForCheating(handle);

    if (cheated) {
        resultDiv.innerHTML = `
            <div class="user-profile">
                <img src="${userInfo.titlePhoto}" alt="${handle}" class="cheated">
                <h2>${handle}</h2>
                <p style="color: red;">You have been caught cheating! Your actions are disgraceful!</p>
            </div>
        `;
        setTimeout(() => {
            resultDiv.innerHTML += `<p style="color: red;">Your profile has been thrown into the virtual dustbin!</p>`;
        }, 2000);
    } else {
        resultDiv.innerHTML = `
            <div class="user-profile">
                <img src="${userInfo.titlePhoto}" alt="${handle}">
                <h2>${handle}</h2>
                <p style="color: green;">No evidence of cheating found. Keep up the good work!</p>
            </div>
        `;
    }
}
