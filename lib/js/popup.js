const viewIds = ['viewTitles', 'addView', 'optionsView', 'updateView'];

// Page Script Begin
$('.backToMain').click(function() {
    $('#main').show();
    viewIds.forEach(id => $('#'+id).hide());
});

let showView = function(viewId, removeFlag) {
    $('#main').hide();
    $('#'+viewId).show();

    // may need to call method to get list here if view or remove
}

$('#viewAction').click(function() {
    showView(viewIds[0]);
});

$('#updateAction').click(function() {
    showView(viewIds[0], true);
});

$('#addAction').click(async function() {
    let tab = await getCurrentTab();

    // populate name and URL
    $('#titleName').val(tab.title.split(' - ')[0]);
    $('#titleURL').val(tab.url);
    showView(viewIds[1]);
});

$('#closeAdsAction').click(function () {
   for (let o in $('#close_ad')) {
       $('#'+o.id).click();
   }
});

$('#optionAction').click(async function() {
    await chrome.storage.sync.get(['location'], function(result) {
        let location = result.location;
        if (!location) {
            location = '/MyReading';
        }
        $('#choseLocation').val(location);
    });
    await chrome.storage.sync.get(['autoUpdate'], function(result) {
        $('#autoUpdate').prop('checked', result.autoUpdate);
    })
    showView(viewIds[2]);
});

$('#add').click(function() {
    addTitle();
});

$('#updateLocation').click(async function () {
    // get value
    let location = $('#choseLocation').val();
    if (!location || location.trim().length === 0) {
        $('#messaging').html('Location was empty.<br/> Enter location as such: <br/> /some/location');
    }
    // check existing bookmarks and path
    let locationArray = location.split('/');

    let existing = true;
    let idx = 1;
    let parentId = '1';
    // skipping 0 as root is always going to be an empty string
    // update
    do {
        existing = await chrome.bookmarks.search(locationArray[idx]);
        if (existing.length === 0) {
            // create
            let createDetails = {
                parentId: parentId,
                title: locationArray[idx]
            };
            let created = await chrome.bookmarks.create(createDetails);
            parentId = created.id;
        }
        idx++;
    } while(idx < locationArray.length);

    // update in storage as well
    await chrome.storage.sync.set({'location': location, 'locationId': parentId});

});

$('#autoUpdate').click(async function() {
    let c = this.checked;
    await chrome.storage.sync.set({'autoUpdate': c}, function () {
        console.log('Auto Update set to '+ c);
    });
});
// Page Script End

// Plugin Script Begin
let addTitle = async function() {
    await chrome.storage.sync.get(['locationId'], function(result) {
        let createDetails = {
            title: $('#titleName').val(),
            url: $('#titleURL').val()
        };
        if (result.locationId) {
            createDetails.parentId = result.locationId;
        }
        let created = chrome.bookmarks.create(createDetails);
        console.log(created);
    });

}

let getCurrentTab = async function() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

// Plugin Script End
