/* eslint-disable no-undef */

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // eslint-disable-next-line no-undef
  const webview = acquireVsCodeApi();
  const localState = webview.getState();
  let localNotes = localState.notes || []; // get cached state
  updateNotesList(localNotes);
  webview.postMessage({ type: 'getState' }); // fetch the exetension saved state

  document.querySelector('.add-note-button').addEventListener('click', () => {
    addNote();
  });

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case 'stateUpdated':
        {
          updateNotesList(message.newState);
          break;
        }
      case 'addNote':
        {
          addNote(message.note);
          break;
        }
      case 'deleteNote':
        {
          deleteNote(message.index);
          break;
        }
      case 'clearNotes':
        {
          updateNotesList([]);
          break;
        }
    }
  });

  /**
   * @param {Array<{ value: string }>} notes
   */
  function updateNotesList(notes) {
    const ul = document.querySelector('.notes-list');
    ul.textContent = '';
    for (const note of notes) {
      const li = document.createElement('li');
      li.className = 'note-entry';

      const notePreview = document.createElement('div');
      notePreview.className = 'note-preview';
      notePreview.style.backgroundColor = `#${note.value}`;
      notePreview.addEventListener('click', () => {
        onNoteClicked(note.value);
      });
      li.appendChild(notePreview);

      const input = document.createElement('input');
      input.className = 'note-input';
      input.type = 'text';
      input.value = note.value;
      input.addEventListener('change', (e) => {
        const value = e.target.value;
        if (!value) {
          // Treat empty value as delete
          notes.splice(notes.indexOf(note), 1);
        } else {
          note.value = value;
        }
        webview.postMessage({ type: 'updateState', newState: localNotes });
      });
      li.appendChild(input);
      ul.appendChild(li);
    }

    localNotes = notes;
    webview.setState({ notes: notes }); // cached state
  }

  /** 
   * @param {string} note 
   */
  function onNoteClicked(note) {
    webview.postMessage({ type: 'noteSelected', value: note });
  }

  /**
   * @returns string
   */
  function getNewColor() {
    const colors = ['020202', 'f1eeee', 'a85b20', 'daab70', 'efcb99'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function addNote(note) {
    localNotes.push(note);
    webview.postMessage({ type: 'updateState', newState: localNotes });
  }

  function deleteNote(index) {
    localNotes.splice(index, 1);
    webview.postMessage({ type: 'updateState', newState: localNotes });
  }
}());


