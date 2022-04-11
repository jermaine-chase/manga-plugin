chrome.tabs.onUpdated.addListener( async function (tabId, changeInfo, tab) {
    if (tab.active && tab.url.startsWith('http')) {
        // get bookmarks from location
        await chrome.storage.sync.get(['locationId', 'autoUpdate'], async function (result) {
            if (result.autoUpdate && result.autoUpdate === true) {
                let bookmarkNodes = await chrome.bookmarks.getChildren(result.locationId);
                let foundNode;
                let eUrlArr = tab.url.split('/');
                for (let node of bookmarkNodes) {
                    let cUrlArr = node.url.split('/');
                    if (cUrlArr[3] !== 'manga' && eUrlArr[3] === cUrlArr[3] || eUrlArr[4] === cUrlArr[4]) {
                        foundNode = node;
                        break;
                    }
                }

                if (foundNode) {
                    await chrome.bookmarks.update(foundNode.id, {title: tab.title.split(' - ')[0], url: tab.url})
                }
            }
        });
        // check
    }
});

let arraysEqual = function(a1, a2, index) {
    let resp = true;
    if (!a1 || !a2 || a1.length < index || a2.length < index) {
        return false;
    }
    for (let idx = 0; idx <= index; idx++) {
        if (a1[idx] !== a2[idx]) {
            resp = false;
        }
    }
    return resp;
}
