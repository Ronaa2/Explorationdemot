let mots = []; // Liste principale des mots
let selectedWords = []; // Liste des mots sélectionnés

const apiKey = "AIzaSyAldiWzXvsvnEmSWZQq-r5pBIEvbdxbU5Y"; // Remplace par ta clé API Google
const cx = "37eef689061d54356"; // Ton CX (ID du moteur)

// Fonction pour importer un fichier texte ou Word
function importFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        if (file.name.endsWith(".txt")) {
            reader.onload = function (event) {
                mots = event.target.result.split(/\s+/).map(word => word.trim());
                displayText(mots);
                alert("Fichier texte importé avec succès !");
            };
            reader.readAsText(file);
        } else if (file.name.endsWith(".docx")) {
            reader.onload = function (event) {
                const arrayBuffer = event.target.result;
                mammoth.extractRawText({ arrayBuffer: arrayBuffer }).then(function (result) {
                    mots = result.value.split(/\s+/).map(word => word.trim());
                    displayText(mots);
                    alert("Fichier Word importé avec succès !");
                });
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert("Type de fichier non pris en charge.");
        }
    } else {
        alert("Aucun fichier sélectionné.");
    }
}

// Fonction pour afficher le texte complet
function displayText(words) {
    const textDisplay = document.getElementById("textDisplay");
    textDisplay.innerHTML = "";

    words.forEach(word => {
        const span = document.createElement("span");
        span.textContent = word + " ";
        span.onclick = () => selectWord(word);
        textDisplay.appendChild(span);
    });
}

// Fonction pour surligner les mots correspondant à la recherche
function highlightWords() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const textDisplay = document.getElementById("textDisplay");

    Array.from(textDisplay.children).forEach(span => {
        if (span.textContent.toLowerCase().startsWith(input)) {
            span.classList.add("highlight");
        } else {
            span.classList.remove("highlight");
        }
    });
}

// Fonction pour sélectionner un mot
function selectWord(word) {
    if (!selectedWords.includes(word)) {
        selectedWords.push(word);
        updateSelectedWords();
        fetchGoogleResults(word);
    }
}

// Fonction pour mettre à jour la liste des mots sélectionnés
function updateSelectedWords() {
    const wordList = document.getElementById("wordList");
    wordList.innerHTML = "";

    selectedWords.forEach(word => {
        const li = document.createElement("li");
        li.textContent = word;
        wordList.appendChild(li);
    });
}

// Fonction pour récupérer les résultats Google
function fetchGoogleResults(query) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const googleResultsDiv = document.getElementById("googleResults");
            googleResultsDiv.innerHTML = "<h3>Résultats Google :</h3>";

            if (data.items) {
                data.items.slice(0, 2).forEach(item => {
                    const result = document.createElement("div");
                    result.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a><p>${item.snippet}</p>`;
                    googleResultsDiv.appendChild(result);
                });
            } else {
                googleResultsDiv.innerHTML = "<p>Aucun résultat trouvé.</p>";
            }
        })
        .catch(error => console.error("Erreur lors de la récupération des résultats Google :", error));
}

