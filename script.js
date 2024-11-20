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

// Fonction pour permettre à l'utilisateur de modifier le texte
function enableEditing() {
    const textDisplay = document.getElementById("textDisplay");
    textDisplay.contentEditable = "true"; // Rendre la zone modifiable
    textDisplay.style.border = "1px solid #f1c40f"; // Ajouter une indication visuelle
    alert("Vous pouvez maintenant modifier le texte directement. Cliquez sur le bouton Télécharger pour enregistrer vos modifications.");
}

// Fonction pour télécharger le texte modifié
function downloadModifiedText() {
    const textDisplay = document.getElementById("textDisplay");
    const modifiedText = textDisplay.innerText; // Récupérer le texte modifié
    const blob = new Blob([modifiedText], { type: "text/plain" }); // Créer un fichier texte
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "texte_modifie.txt"; // Nom par défaut du fichier
    link.click(); // Simuler un clic pour télécharger
}

let canvas, ctx; // Variables globales pour le canvas et son contexte
let isDrawing = false; // État du stylo pour dessiner

// Fonction pour importer une image
function importImage(event) {
    const file = event.target.files[0];

    if (!file) {
        alert("Aucun fichier sélectionné.");
        return;
    }

    // Vérifie si le fichier est une image
    if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg") {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                displayImageOnCanvas(img); // Affiche l'image sur le canvas
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        alert("Format non pris en charge. Veuillez importer une image au format PNG, JPG ou JPEG.");
    }
}

// Fonction pour afficher l'image sur un canvas
function displayImageOnCanvas(img) {
    const container = document.getElementById("imageContainer");
    container.innerHTML = ""; // Réinitialise le conteneur

    // Crée un canvas pour dessiner sur l'image
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;

    // Dessine l'image sur le canvas
    ctx.drawImage(img, 0, 0);
    container.appendChild(canvas);

    // Ajoute les événements pour dessiner
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
}

// Fonction pour commencer à dessiner
function startDrawing(event) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
}

// Fonction pour dessiner sur le canvas
function draw(event) {
    if (isDrawing) {
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.strokeStyle = "black"; // Couleur du stylo
        ctx.lineWidth = 2; // Épaisseur du stylo
        ctx.stroke();
    }
}

// Fonction pour arrêter de dessiner
function stopDrawing() {
    isDrawing = false;
    ctx.closePath();
}


// Fonction pour télécharger l'image modifiée
function downloadImage() {
    if (canvas) {
        const link = document.createElement("a");
        link.download = "image_modifiee.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    } else {
        alert("Aucune image à télécharger !");
    }
}

// Fonction pour gérer l'importation de fichiers texte et images
function handleFileImport(event) {
    const file = event.target.files[0];

    if (!file) {
        alert("Aucun fichier sélectionné.");
        return;
    }

    // Vérifie le type de fichier
    const fileType = file.type;

    if (fileType === "text/plain" || fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Si c'est un fichier texte ou Word
        importFile(event);
    } else if (fileType === "image/png" || fileType === "image/jpeg" || fileType === "image/jpg") {
        // Si c'est une image
        importImage(event);
    } else {
        alert("Format non pris en charge. Veuillez importer un fichier texte (.txt, .docx) ou une image (.png, .jpg, .jpeg).");
    }
}

// Fonction pour télécharger l'image modifiée
function downloadImage() {
    if (canvas) {
        const link = document.createElement("a");
        link.download = "image_modifiee.png"; // Nom du fichier téléchargé
        link.href = canvas.toDataURL("image/png");
        link.click();
    } else {
        alert("Aucune image à télécharger !");
    }
}
