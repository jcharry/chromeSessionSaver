// let renameInput = {
//     init: {
//         this.box = document.createElement('input');
//         this.submit = document.createElement('button');
//     }
// }
window.addEventListener('load', function() {
    document.getElementById('clear-storage').addEventListener('click', () => {
        chrome.storage.sync.clear();
        window.location.reload();
    });
    let renameInputFactory = function() {
        let container = document.createElement('div');
        let box = document.createElement('input');
        box.setAttribute('placeholder', 'Save Name');
        let submit = document.createElement('button');
        submit.innerHTML = 'Submit';
        container.appendChild(box);
        container.appendChild(submit);

        box.addEventListener('focus', () => {
            console.log('box focused');
        });

        submit.addEventListener('click', (e) => {
            console.log(e);
        });

        return {
            container,
            box,
            submit
        }
    }
    let renameInput = renameInputFactory();

    chrome.windows.getAll(openWindows => {
        let container = document.getElementById('list-container');
        openWindows.forEach(w => {
            let list = document.createElement('ol');
            let id = `id: ${w.id}`;
            let listHeader = document.createElement('span');
            listHeader.setAttribute('class', 'list-header');
            listHeader.innerHTML = id;
            list.appendChild(listHeader);
            let saveButton = document.createElement('button');
            saveButton.innerHTML = 'Save Window Session';
            list.appendChild(saveButton);

            container.appendChild(list);

            // Get all tabs
            let windowTabs = [];
            chrome.tabs.query({windowId: w.id}, (tabs) => {
                tabs.forEach(tab => {
                    windowTabs.push({
                        title: tab.title,
                        url: tab.url
                    });
                    let item = document.createElement('li');
                    item.setAttribute('class', 'session-url-item');
                    item.innerHTML = tab.title;
                    list.appendChild(item);
                });
            });

            // Save window session to storage
            saveButton.addEventListener('click', () => {
                // Inject rename box into list
                list.insertBefore(renameInput.container, list.childNodes[2]);
                renameInput.submit.addEventListener('click', function(e) {
                    console.log(renameInput.box.value);
                    chrome.storage.sync.set({[renameInput.box.value]: windowTabs}, function(res) {
                        window.location.reload();
                    });
                });
            });
        });
    });

    // Show any saved sessions
    chrome.storage.sync.get((all) => {
        console.log(all);
        // Create html element
        let sessList = document.createElement('ol');
        document.getElementById('saved-sessions').appendChild(sessList);
        Object.keys(all).forEach(key => {
            let sess = all[key];
            let item = document.createElement('li');
            let closeButton = document.createElement('button');
            closeButton.setAttribute('class', 'close-btn');
            item.innerHTML = key;
            item.setAttribute('class', 'saved-session');

            closeButton.innerHTML = 'X';

            sessList.appendChild(item);
            item.appendChild(closeButton);

            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                chrome.storage.sync.remove(key);
                window.location.reload();
            });

            item.addEventListener('click', () => {
                // Open a new chrome window and load all tabs
                // Collect all urls as an array
                let urls = sess.map(tab => {
                    return tab.url;
                });
                let w = chrome.windows.create({url: urls, focused: true});
            });
        });
    });
});

