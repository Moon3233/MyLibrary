/**
 * Gestionnaire de librairie personnelle
 * Système de stockage basé sur localStorage
 */

// Clé pour le stockage dans localStorage
const STORAGE_KEY = 'myLibrary_books';

/**
 * Structure de données d'un livre
 * @typedef {Object} Book
 * @property {string} id - Identifiant unique du livre
 * @property {string} title - Titre du livre
 * @property {string} author - Nom de l'auteur
 * @property {string} coverImage - URL de l'image de couverture
 * @property {number} createdAt - Timestamp de création
 * @property {number} updatedAt - Timestamp de dernière modification
 */

/**
 * Récupère tous les livres depuis le localStorage
 * @returns {Book[]} Tableau de livres
 */
function getBooks() {
    const booksJson = localStorage.getItem(STORAGE_KEY);
    if (!booksJson) {
        return [];
    }
    try {
        return JSON.parse(booksJson);
    } catch (error) {
        console.error('Erreur lors de la lecture des livres:', error);
        return [];
    }
}

/**
 * Sauvegarde tous les livres dans le localStorage
 * @param {Book[]} books - Tableau de livres à sauvegarder
 */
function saveBooks(books) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des livres:', error);
        alert('Erreur lors de la sauvegarde. Vérifiez que le localStorage est disponible.');
    }
}

/**
 * Génère un identifiant unique pour un livre
 * @returns {string} Identifiant unique
 */
function generateBookId() {
    return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Crée l'élément HTML pour un livre
 * @param {Book} book - Objet livre à afficher
 * @returns {HTMLElement} Élément HTML représentant le livre
 */
function createBookElement(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.dataset.bookId = book.id;

    // Image de couverture
    if (book.coverImage) {
        const bookCover = document.createElement('img');
        bookCover.className = 'book-cover';
        bookCover.src = book.coverImage;
        bookCover.alt = `Couverture de ${book.title}`;
        bookCover.onerror = function() {
            this.style.display = 'none';
        };
        bookCard.appendChild(bookCover);
    }

    // Contenu du livre
    const bookContent = document.createElement('div');
    bookContent.className = 'book-content';

    const bookTitle = document.createElement('h3');
    bookTitle.className = 'book-title';
    bookTitle.textContent = book.title;
    bookContent.appendChild(bookTitle);

    if (book.author) {
        const bookAuthor = document.createElement('p');
        bookAuthor.className = 'book-author';
        bookAuthor.textContent = `Par ${book.author}`;
        bookContent.appendChild(bookAuthor);
    }

    bookCard.appendChild(bookContent);

    return bookCard;
}

/**
 * Affiche tous les livres dans la liste
 */
function displayBooks() {
    const booksListContainer = document.getElementById('books-list');
    if (!booksListContainer) {
        console.error('Élément books-list introuvable');
        return;
    }

    const books = getBooks();

    // Vider le conteneur
    booksListContainer.innerHTML = '';

    // Afficher l'état vide si aucun livre
    if (books.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'Aucun livre dans votre librairie. Ajoutez-en un pour commencer !';
        booksListContainer.appendChild(emptyState);
        return;
    }

    // Afficher chaque livre
    books.forEach(book => {
        const bookElement = createBookElement(book);
        booksListContainer.appendChild(bookElement);
    });
}

/**
 * Valide le titre d'un livre
 * @param {string} title - Titre à valider
 * @returns {Object} {valid: boolean, error: string}
 */
function validateBookTitle(title) {
    if (!title || typeof title !== 'string') {
        return { valid: false, error: 'Le titre est requis' };
    }

    const trimmedTitle = title.trim();
    
    if (trimmedTitle.length === 0) {
        return { valid: false, error: 'Le titre ne peut pas être vide' };
    }

    if (trimmedTitle.length > 200) {
        return { valid: false, error: 'Le titre ne peut pas dépasser 200 caractères' };
    }

    return { valid: true, error: '' };
}

/**
 * Valide le nom de l'auteur
 * @param {string} author - Nom de l'auteur à valider
 * @returns {Object} {valid: boolean, error: string}
 */
function validateBookAuthor(author) {
    if (!author || typeof author !== 'string') {
        return { valid: false, error: 'Le nom de l\'auteur est requis' };
    }

    const trimmedAuthor = author.trim();
    
    if (trimmedAuthor.length === 0) {
        return { valid: false, error: 'Le nom de l\'auteur ne peut pas être vide' };
    }

    if (trimmedAuthor.length > 100) {
        return { valid: false, error: 'Le nom de l\'auteur ne peut pas dépasser 100 caractères' };
    }

    return { valid: true, error: '' };
}

/**
 * Valide le fichier image
 * @param {File|null} file - Fichier à valider
 * @returns {Object} {valid: boolean, error: string}
 */
function validateImageFile(file) {
    // L'image est obligatoire
    if (!file) {
        return { valid: false, error: 'L\'image de couverture est requise' };
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'Le fichier doit être une image' };
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { valid: false, error: 'L\'image ne doit pas dépasser 5MB' };
    }

    return { valid: true, error: '' };
}

/**
 * Convertit un fichier image en DataURL (base64)
 * @param {File} file - Fichier image à convertir
 * @returns {Promise<string>} Promise qui résout avec le DataURL
 */
function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Erreur lors de la lecture du fichier'));
        reader.readAsDataURL(file);
    });
}

/**
 * Affiche la prévisualisation de l'image
 * @param {File} file - Fichier image à prévisualiser
 */
async function showImagePreview(file) {
    const previewContainer = document.getElementById('cover-preview');
    const previewImage = document.getElementById('preview-image');
    const fileLabel = document.querySelector('.file-label');
    
    if (!previewContainer || !previewImage) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
        showError('cover-error', validation.error);
        return;
    }

    try {
        const dataURL = await fileToDataURL(file);
        previewImage.src = dataURL;
        previewContainer.style.display = 'block';
        fileLabel.style.display = 'none';
        clearError('cover-error');
    } catch (error) {
        showError('cover-error', 'Erreur lors du chargement de l\'image');
    }
}

/**
 * Supprime la prévisualisation de l'image
 */
function removeImagePreview() {
    const previewContainer = document.getElementById('cover-preview');
    const fileInput = document.getElementById('book-cover');
    const fileLabel = document.querySelector('.file-label');
    
    if (previewContainer) {
        previewContainer.style.display = 'none';
    }
    if (fileInput) {
        fileInput.value = '';
    }
    if (fileLabel) {
        fileLabel.style.display = 'flex';
    }
    clearError('cover-error');
}

/**
 * Ajoute un nouveau livre à la librairie
 * @param {string} title - Titre du livre à ajouter
 * @param {string} author - Nom de l'auteur
 * @param {string} coverImageDataURL - DataURL de l'image de couverture (optionnel)
 * @returns {Promise<boolean>} Promise qui résout avec true si l'ajout a réussi, false sinon
 */
async function addBook(title, author, coverImageDataURL = '') {
    // Les validations sont déjà faites avant l'appel à cette fonction
    // Récupérer les livres existants
    const books = getBooks();

    // Créer le nouveau livre
    const newBook = {
        id: generateBookId(),
        title: title.trim(),
        author: author.trim(),
        coverImage: coverImageDataURL || '',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    // Ajouter le livre à la liste
    books.push(newBook);

    // Sauvegarder
    saveBooks(books);

    // Rafraîchir l'affichage
    displayBooks();

    // Réinitialiser le formulaire
    resetAddBookForm();

    return true;
}

/**
 * Réinitialise le formulaire d'ajout de livre
 */
function resetAddBookForm() {
    const form = document.getElementById('add-book-form');
    if (form) {
        form.reset();
    }
    removeImagePreview();
    clearError('title-error');
    clearError('author-error');
    clearError('cover-error');
}

/**
 * Affiche un message d'erreur
 * @param {string} errorId - ID de l'élément d'erreur
 * @param {string} message - Message d'erreur
 */
function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Ajouter une classe d'erreur au groupe de formulaire parent
        const formGroup = errorElement.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('has-error');
            const input = formGroup.querySelector('input, .file-label');
            if (input) {
                input.classList.add('error');
            }
        }
    }
}

/**
 * Efface un message d'erreur
 * @param {string} errorId - ID de l'élément d'erreur
 */
function clearError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        
        // Retirer la classe d'erreur du groupe de formulaire parent
        const formGroup = errorElement.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('has-error');
            const input = formGroup.querySelector('input, .file-label');
            if (input) {
                input.classList.remove('error');
            }
        }
    }
}

/**
 * Valide tous les champs du formulaire
 * @param {string} title - Titre du livre
 * @param {string} author - Nom de l'auteur
 * @param {File|null} imageFile - Fichier image (optionnel)
 * @returns {boolean} true si tous les champs sont valides
 */
async function validateFormFields(title, author, imageFile) {
    let isValid = true;

    // Valider le titre
    const titleValidation = validateBookTitle(title);
    if (!titleValidation.valid) {
        showError('title-error', titleValidation.error);
        isValid = false;
    } else {
        clearError('title-error');
    }

    // Valider l'auteur
    const authorValidation = validateBookAuthor(author);
    if (!authorValidation.valid) {
        showError('author-error', authorValidation.error);
        isValid = false;
    } else {
        clearError('author-error');
    }

    // Valider l'image (obligatoire)
    const imageValidation = validateImageFile(imageFile);
    if (!imageValidation.valid) {
        showError('cover-error', imageValidation.error);
        isValid = false;
    } else {
        clearError('cover-error');
    }

    return isValid;
}

/**
 * Initialise les écouteurs d'événements
 */
function initEventListeners() {
    const addBookForm = document.getElementById('add-book-form');
    if (addBookForm) {
        addBookForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const titleInput = document.getElementById('book-title');
            const authorInput = document.getElementById('book-author');
            const coverInput = document.getElementById('book-cover');
            
            if (!titleInput || !authorInput || !coverInput) {
                return;
            }

            const title = titleInput.value || '';
            const author = authorInput.value || '';
            const imageFile = coverInput.files && coverInput.files[0] ? coverInput.files[0] : null;
            
            // Valider tous les champs avant de continuer
            const isValid = await validateFormFields(title, author, imageFile);
            if (!isValid) {
                return;
            }
            
            // Récupérer l'image si elle existe
            let coverImageDataURL = '';
            if (imageFile) {
                try {
                    coverImageDataURL = await fileToDataURL(imageFile);
                } catch (error) {
                    showError('cover-error', 'Erreur lors du chargement de l\'image');
                    return;
                }
            }
            
            await addBook(title, author, coverImageDataURL);
        });
    }

    // Effacer les erreurs lors de la saisie
    const titleInput = document.getElementById('book-title');
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            clearError('title-error');
        });
    }

    const authorInput = document.getElementById('book-author');
    if (authorInput) {
        authorInput.addEventListener('input', function() {
            clearError('author-error');
        });
    }

    // Gestion de l'upload d'image
    const coverInput = document.getElementById('book-cover');
    if (coverInput) {
        coverInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                showImagePreview(file);
            } else {
                removeImagePreview();
            }
        });
    }

    // Bouton pour supprimer la prévisualisation
    const removePreviewBtn = document.getElementById('remove-preview');
    if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            removeImagePreview();
        });
    }
}

/**
 * Initialise l'application au chargement de la page
 */
function init() {
    console.log('Application de librairie initialisée');
    displayBooks();
    initEventListeners();
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', init);

