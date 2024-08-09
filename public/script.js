
// Retrieve notes from localStorage or initialize an empty array
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// DOM elements
const noteInput = document.getElementById('noteInput');
const saveNoteBtn = document.getElementById('saveNote');
const notesList = document.getElementById('notesList');
const questionInput = document.getElementById('questionInput');
const askQuestionBtn = document.getElementById('askQuestion');
const answerText = document.getElementById('answerText');

// Save or edit note
saveNoteBtn.addEventListener('click', () => {
    const noteContent = noteInput.value.trim();
    if (noteContent) {
        const existingNoteIndex = notes.findIndex(note => note.id === selectedNoteId);
        if (existingNoteIndex !== -1) {
            // Edit existing note
            notes[existingNoteIndex].content = noteContent;
        } else {
            // Add new note
            const newNote = {
                id: Date.now(),
                content: noteContent
            };
            notes.push(newNote);
        }
        // Save notes to localStorage and display
        localStorage.setItem('notes', JSON.stringify(notes));
        displayNotes();
        clearNoteInput();
    }
});

// Display notes
function displayNotes() {
    notesList.innerHTML = '';
    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.textContent = note.content;
        
        // Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-btn');
        editButton.addEventListener('click', () => editNoteHandler(note.id));
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => deleteNoteHandler(note.id));

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        
        notesList.appendChild(li);
    });
}

// Edit note handler
let selectedNoteId = null;

function editNoteHandler(id) {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
        noteInput.value = noteToEdit.content;
        selectedNoteId = noteToEdit.id;
        saveNoteBtn.textContent = 'Update Note'; // Change button text to indicate editing
    }
}

// Delete note handler
function deleteNoteHandler(id) {
    notes = notes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    clearNoteInput();
}

// Clear note input
function clearNoteInput() {
    noteInput.value = '';
    selectedNoteId = null;
    saveNoteBtn.textContent = 'Save Note'; // Reset button text after saving or clearing input
}

// Ask question
askQuestionBtn.addEventListener('click', async () => {
    const question = questionInput.value.trim();
    if (question && notes.length > 0) {
        try {
            const answer = await askOpenAI(question, notes);
            answerText.textContent = answer;
        } catch (error) {
            console.error('Error:', error);
            answerText.textContent = 'An error occurred while processing your question.';
        }
    } else {
        answerText.textContent = 'Please enter a question and make sure you have saved some notes.';
    }
});

// Function to interact with OpenAI API
async function askOpenAI(question, notes) {
    try {
        const formattedNotes = notes.map((note, index) => `Note ${index + 1}: ${note.content}`).join('\n');
        const response = await fetch('/api/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, formattedNotes })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.answer;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
// Initial display of notes
displayNotes();
