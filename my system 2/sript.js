document.addEventListener("DOMContentLoaded", function () {
    const button = document.querySelector("button");
    const input = document.querySelector("input");
    const container = document.getElementById("linksContainer");

    button.addEventListener("click", function () {
        const value = input.value.trim();
        if (value) {
            firebase.database().ref("confirms").push({
                text: value,
                timestamp: Date.now()
            });
            input.value = "";
        } else {
            alert("لطفاً کانفرم را وارد کنید.");
        }
    });

    const sentLinks = new Set();

    firebase.database().ref("confirms").on("value", function(snapshot) {
        container.innerHTML = "";
        sentLinks.clear();

        let openedLinks = JSON.parse(localStorage.getItem("openedLinksTime") || "{}");
        const now = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000;

        for (let key in openedLinks) {
            if (now - openedLinks[key] > twelveHours) {
                delete openedLinks[key];
            }
        }
        localStorage.setItem("openedLinksTime", JSON.stringify(openedLinks));

        snapshot.forEach(function(childSnapshot) {
            const data = childSnapshot.val();
            const linkText = data.text;

            if (!sentLinks.has(linkText)) {
                sentLinks.add(linkText);

                const linkBox = document.createElement("div");
                linkBox.textContent = linkText;
                linkBox.style.border = "1px solid gray";
                linkBox.style.padding = "20px";
                linkBox.style.margin = "10px auto";
                linkBox.style.width = "530px";
                linkBox.style.textAlign = "center";
                linkBox.style.borderRadius = "10px";
                linkBox.style.backgroundColor = "#f1f1f1";
                container.appendChild(linkBox);

                if (!openedLinks[linkText]) {
                    openedLinks[linkText] = now;
                    localStorage.setItem("openedLinksTime", JSON.stringify(openedLinks));
                }
            }
        });
    });

    chrome.runtime?.onMessage?.addListener((message, sender, sendResponse) => {
        if (message.type === "confirm-link") {
            const input = document.querySelector('input[placeholder="کانفرم خود را وارد کنید"]');
            const button = document.querySelector("button");
            if (input && button) {
                input.value = message.link;
                setTimeout(() => {
                    button.click();
                    console.log("دکمه ارسال زده شد با مقدار:", message.link);
                }, 300);
            }
        }
    });
});

function deleteConfrom() {
    firebase.database().ref("confirms").remove()
        .then(() => console.log("تمام کانفرم‌ها حذف شدند"))
        .catch(e => console.error(e));

    localStorage.removeItem("openedLinksTime");
}
