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

    // Actions du livre
    const bookActions = document.createElement('div');
    bookActions.className = 'book-actions';

    const editButton = document.createElement('button');
    editButton.className = 'btn btn-edit';
    editButton.innerHTML = '✏️';
    editButton.setAttribute('aria-label', `Modifier ${book.title}`);
    editButton.setAttribute('title', 'Modifier');
    editButton.addEventListener('click', () => openEditModal(book));
    bookActions.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-delete';
    deleteButton.innerHTML = '🗑️';
    deleteButton.setAttribute('aria-label', `Supprimer ${book.title}`);
    deleteButton.setAttribute('title', 'Supprimer');
    deleteButton.addEventListener('click', () => openDeleteConfirmModal(book.id));
    bookActions.appendChild(deleteButton);

    bookContent.appendChild(bookActions);
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

    // Afficher chaque livre avec animation décalée
    books.forEach((book, index) => {
        const bookElement = createBookElement(book);
        bookElement.style.animationDelay = `${index * 0.1}s`;
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

    // Formulaire de modification
    const editBookForm = document.getElementById('edit-book-form');
    if (editBookForm) {
        editBookForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const bookIdInput = document.getElementById('edit-book-id');
            const titleInput = document.getElementById('edit-book-title');
            const authorInput = document.getElementById('edit-book-author');
            const coverInput = document.getElementById('edit-book-cover');
            
            if (!bookIdInput || !titleInput || !authorInput || !coverInput) {
                return;
            }

            const bookId = bookIdInput.value;
            const title = titleInput.value || '';
            const author = authorInput.value || '';
            const imageFile = coverInput.files && coverInput.files[0] ? coverInput.files[0] : null;
            
            // Valider les champs
            const titleValidation = validateBookTitle(title);
            const authorValidation = validateBookAuthor(author);
            
            let isValid = true;
            if (!titleValidation.valid) {
                showError('edit-title-error', titleValidation.error);
                isValid = false;
            } else {
                clearError('edit-title-error');
            }
            
            if (!authorValidation.valid) {
                showError('edit-author-error', authorValidation.error);
                isValid = false;
            } else {
                clearError('edit-author-error');
            }
            
            if (!isValid) {
                return;
            }
            
            // Gérer l'image : nouvelle image ou image existante
            let coverImageDataURL = '';
            const previewContainer = document.getElementById('edit-cover-preview');
            
            if (imageFile) {
                // Nouvelle image sélectionnée
                const imageValidation = validateImageFile(imageFile);
                if (!imageValidation.valid) {
                    showError('edit-cover-error', imageValidation.error);
                    return;
                }
                try {
                    coverImageDataURL = await fileToDataURL(imageFile);
                } catch (error) {
                    showError('edit-cover-error', 'Erreur lors du chargement de l\'image');
                    return;
                }
            } else if (previewContainer && previewContainer.dataset.existingImage) {
                // Utiliser l'image existante
                coverImageDataURL = previewContainer.dataset.existingImage;
            } else {
                // Pas d'image - erreur car l'image est obligatoire
                showError('edit-cover-error', 'L\'image de couverture est requise');
                return;
            }
            
            clearError('edit-cover-error');
            await updateBook(bookId, title, author, coverImageDataURL);
        });
    }

    // Gestion de l'upload d'image dans le modal d'édition
    const editCoverInput = document.getElementById('edit-book-cover');
    if (editCoverInput) {
        editCoverInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                await showEditImagePreview(file);
            } else {
                removeEditImagePreview();
            }
        });
    }

    // Bouton pour supprimer la prévisualisation dans le modal d'édition
    const removeEditPreviewBtn = document.getElementById('remove-edit-preview');
    if (removeEditPreviewBtn) {
        removeEditPreviewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            removeEditImagePreview();
        });
    }

    // Fermer le modal en cliquant sur le fond
    const editModal = document.getElementById('edit-book-modal');
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }

    // Fermer le modal avec le bouton de fermeture
    const closeEditModalBtn = document.querySelector('.modal-close');
    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeEditModal();
        });
    }

    // Fermer le modal avec le bouton Annuler
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeEditModal();
        });
    }

    // Fermer le modal avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEditModal();
            closeDeleteConfirmModal();
        }
    });

    // Gestion du modal de confirmation de suppression
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    if (deleteConfirmModal) {
        // Fermer en cliquant sur le fond
        deleteConfirmModal.addEventListener('click', function(e) {
            if (e.target === deleteConfirmModal) {
                closeDeleteConfirmModal();
            }
        });

        // Bouton de confirmation
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const bookId = deleteConfirmModal.dataset.bookId;
                if (bookId) {
                    deleteBook(bookId);
                }
            });
        }

        // Bouton d'annulation
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', function(e) {
                e.preventDefault();
                closeDeleteConfirmModal();
            });
        }

        // Fermer avec le bouton X
        const closeDeleteModalBtn = deleteConfirmModal.querySelector('.modal-close');
        if (closeDeleteModalBtn) {
            closeDeleteModalBtn.addEventListener('click', function(e) {
                e.preventDefault();
                closeDeleteConfirmModal();
            });
        }
    }
}

/**
 * Affiche la prévisualisation de l'image dans le modal d'édition
 * @param {File} file - Fichier image à prévisualiser
 */
async function showEditImagePreview(file) {
    const previewContainer = document.getElementById('edit-cover-preview');
    const previewImage = document.getElementById('edit-preview-image');
    const fileLabel = document.querySelector('#edit-book-form .file-label');
    
    if (!previewContainer || !previewImage) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
        showError('edit-cover-error', validation.error);
        return;
    }

    try {
        const dataURL = await fileToDataURL(file);
        previewImage.src = dataURL;
        previewContainer.style.display = 'block';
        if (fileLabel) fileLabel.style.display = 'none';
        // Supprimer la référence à l'image existante car on a une nouvelle image
        delete previewContainer.dataset.existingImage;
        clearError('edit-cover-error');
    } catch (error) {
        showError('edit-cover-error', 'Erreur lors du chargement de l\'image');
    }
}

/**
 * Supprime la prévisualisation de l'image dans le modal d'édition
 */
function removeEditImagePreview() {
    const previewContainer = document.getElementById('edit-cover-preview');
    const fileInput = document.getElementById('edit-book-cover');
    const fileLabel = document.querySelector('#edit-book-form .file-label');
    
    if (previewContainer) {
        previewContainer.style.display = 'none';
        delete previewContainer.dataset.existingImage;
    }
    if (fileInput) {
        fileInput.value = '';
    }
    if (fileLabel) {
        fileLabel.style.display = 'flex';
    }
    clearError('edit-cover-error');
}

/**
 * Ouvre le modal de modification d'un livre
 * @param {Book} book - Livre à modifier
 */
function openEditModal(book) {
    const modal = document.getElementById('edit-book-modal');
    if (!modal) return;

    // Pré-remplir les champs avec les données du livre
    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('edit-book-title').value = book.title;
    document.getElementById('edit-book-author').value = book.author || '';

    // Gérer l'image existante
    const previewContainer = document.getElementById('edit-cover-preview');
    const previewImage = document.getElementById('edit-preview-image');
    const fileLabel = document.querySelector('#edit-book-form .file-label');
    const fileInput = document.getElementById('edit-book-cover');

    if (book.coverImage) {
        previewImage.src = book.coverImage;
        previewContainer.style.display = 'block';
        if (fileLabel) fileLabel.style.display = 'none';
        // Stocker l'image existante dans un attribut data
        previewContainer.dataset.existingImage = book.coverImage;
    } else {
        previewContainer.style.display = 'none';
        if (fileLabel) fileLabel.style.display = 'flex';
        delete previewContainer.dataset.existingImage;
    }

    // Réinitialiser le champ fichier
    if (fileInput) {
        fileInput.value = '';
    }

    // Effacer les erreurs
    clearError('edit-title-error');
    clearError('edit-author-error');
    clearError('edit-cover-error');

    // Afficher le modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Ferme le modal de modification
 */
function closeEditModal() {
    const modal = document.getElementById('edit-book-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * Met à jour un livre existant
 * @param {string} bookId - ID du livre à modifier
 * @param {string} title - Nouveau titre
 * @param {string} author - Nouveau nom d'auteur
 * @param {string} coverImageDataURL - Nouvelle image (ou DataURL existant)
 * @returns {Promise<boolean>} true si la modification a réussi
 */
async function updateBook(bookId, title, author, coverImageDataURL = '') {
    // Validation du titre
    const titleValidation = validateBookTitle(title);
    if (!titleValidation.valid) {
        showError('edit-title-error', titleValidation.error);
        return false;
    }

    // Validation de l'auteur
    const authorValidation = validateBookAuthor(author);
    if (!authorValidation.valid) {
        showError('edit-author-error', authorValidation.error);
        return false;
    }

    // Récupérer les livres
    const books = getBooks();
    const bookIndex = books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) {
        showError('edit-cover-error', 'Livre introuvable');
        return false;
    }

    // Mettre à jour le livre
    books[bookIndex] = {
        ...books[bookIndex],
        title: title.trim(),
        author: author.trim(),
        coverImage: coverImageDataURL || books[bookIndex].coverImage,
        updatedAt: Date.now()
    };

    // Sauvegarder
    saveBooks(books);

    // Rafraîchir l'affichage
    displayBooks();

    // Fermer le modal
    closeEditModal();

    return true;
}

/**
 * Ouvre le modal de confirmation de suppression
 * @param {string} bookId - ID du livre à supprimer
 */
function openDeleteConfirmModal(bookId) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    
    if (!book) {
        console.error('Livre introuvable');
        return;
    }

    const modal = document.getElementById('delete-confirm-modal');
    const confirmText = document.getElementById('delete-confirm-text');
    
    if (!modal || !confirmText) return;

    // Afficher le message de confirmation
    confirmText.textContent = `Êtes-vous sûr de vouloir supprimer "${book.title}" de votre librairie ?`;
    
    // Stocker l'ID du livre à supprimer dans le modal
    modal.dataset.bookId = bookId;
    
    // Afficher le modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Ferme le modal de confirmation de suppression
 */
function closeDeleteConfirmModal() {
    const modal = document.getElementById('delete-confirm-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        delete modal.dataset.bookId;
    }
}

/**
 * Supprime un livre de la librairie
 * @param {string} bookId - ID du livre à supprimer
 */
function deleteBook(bookId) {
    const books = getBooks();
    
    // Supprimer le livre
    const updatedBooks = books.filter(b => b.id !== bookId);
    
    // Sauvegarder
    saveBooks(updatedBooks);
    
    // Rafraîchir l'affichage
    displayBooks();
    
    // Fermer le modal
    closeDeleteConfirmModal();
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

