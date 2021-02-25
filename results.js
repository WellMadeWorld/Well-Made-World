getItemFromCatalog = (id) => {
    var docRef = db.collection("test_collection").doc(id);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            setupItemModal(doc.data(), id);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}    

const setupItemModal = (data, id) => {
		checkSavedStatus(id);
    brandHeaders(data.brand_id)
    let imageHtml = ''
    let descriptionHtml = ''
    const imageElement = `
    <div id="product-image">
        <img src="${data.image_link}" style="height: 250px; width: 250px;"/>
        <p> Price: $${data.price} </p>
        <a href="${data.product_link}">Link to buy</a>
         <div id='saveButtonDiv'>
        </div>
    </div>
    `
    const descriptionElement = `
    <div id="product-description">
        <p> ${data.description} </p>
    </div>
    `
    
    imageHtml += imageElement
    descriptionHtml += descriptionElement

    itemImage.innerHTML = imageHtml
    itemDescription.innerHTML = descriptionHtml
}

const brandHeaders = (brand) => {
    var docRef = db.collection('brands').doc(brand)

    docRef.get().then(function(doc) {
        if (doc.exists) {
            brand = doc.data()
            let html = ''
            const element = `
            <div id="brand-description">
                <img src="${brand.image_link}" style="height: 36px; width: 100px;"/>
                <p>${brand.description}</p>
            </div>
            `
            html += element

            brandInfo.innerHTML = html
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

const setupButtons = () => {
    if (lastItems.length > 0) {
        resultBackButton.style.display = "inline-block";
    } else {
        resultBackButton.style.display = "none";
    }

    if (allItems.length == 0) {
        resultNextButton.style.display = "none";
    } else {
        resultNextButton.style.display = "inline-block";
    }

}

let currentFilter = '';
let itemCategories = [];
let allItems = [];
let lastItems = [];
let currentItems = [];

const filterItems = (category) => {
    itemCategories = [];
    allItems = [];
    currentItems = [];
    lastItems = [];
    var productsRef = db.collection('new_test_collection')
    var allItemsQuery = productsRef.where("product_category", "==", category);
    currentFilter = category
    allItemsQuery.get()
    .then((snapshot) => {
        let itemsDoc = snapshot.docs;
        itemsDoc.forEach(doc => {
 						item = doc.data();
            allItems.push(doc);
            if (itemCategories.includes(item.item_category)) {
            } else {
                itemCategories.push(item.item_category)
            };
        })
        for (i = 0; i < allItems.length; i++) {
            if (i == 12) {
                break;
            }
            currentItems.push(allItems[i])
        }
        setupResults(currentItems);
        allItems.splice(0,12)
        setupButtons();
        
        console.log(itemCategories);
        
        html = '';
        itemCategories.forEach(category => {
            const filterButton = `<div class="catalog-filter-button" style="display: inline-block;" id="${category}FilterButton">${category}</div>`
            html += filterButton;
        })
        secondFilterContainer.innerHTML = html;
    })
}

let secondFilter = '';
let itemTags = [];

const compoundQueryOne = (category) => {
    itemTags = [];
    allItems = [];
    currentItems = [];
    lastItems = [];

    var productsRef = db.collection('new_test_collection')
    var subFilterQuery = productsRef.where('item_category', "==", category).where('product_category', '==', currentFilter)

    secondFilter = category;

    subFilterQuery.get()
    .then((snapshot) => {
        let itemsDoc = snapshot.docs;
        itemsDoc.forEach(doc => {
        		item = doc.data();
            allItems.push(doc);
            for(var key in item.filter_tags) {
                if(itemTags.includes(key)) {
                } else {
                    itemTags.push(key);
                };
            }
        })
        for (i = 0; i < allItems.length; i++) {
            if (i == 6) {
                break;
            }
            currentItems.push(allItems[i])
        }
        setupResults(currentItems);
        allItems.splice(0,6)
        setupButtons();
        
        html = '';
	    itemTags.forEach(tag => {
            const filterButton = `<div class="catalog-filter-button" style="display: inline-block;" id="${tag}FilterButton">${tag}</div>`
            html += filterButton;
        })
        thirdFilterContainer.innerHTML = html;
    })
}

const getNextItems = () => {
    if (lastItems.length == 0) {
        currentItems.forEach(doc => {
            lastItems.push(doc);
        })
        currentItems.splice(0,12);

        for (i = 0; i < allItems.length; i++) {
            if (i == 12) {
                break;
            }
            currentItems.push(allItems[i])
        }
        allItems.splice(0,12);

        setupResults(currentItems);
    } else {
        currentItems.forEach(doc => {
            lastItems.push(doc)
        })
        currentItems.splice(0,12);

        for (i = 0; i < allItems.length; i++) {
            if (i == 12) {
                break;
            }
            currentItems.push(allItems[i])
        }
        allItems.splice(0,12);
        setupResults(currentItems);
    }
    setupButtons();
}

const getLastItems = () => {
    for (i=0; i < currentItems.length; i++) {
        allItems.splice(i,0,currentItems[i]);
    };

    currentItems.splice(0,12);

    for (i = (lastItems.length - 12);i < lastItems.length; i++) {
        currentItems.push(lastItems[i]);
    };
    
    lastItems.splice((lastItems.length - 12), 12);

    setupResults(currentItems);
    setupButtons();
}

 	const setupResults = (data) => {
    if (data.length) {
        let html = ''
        data.forEach(doc => {
            const product = doc.data();
            const gridElement = `
            <div class='gridstyleblock'>
                <a href='#'>
                <img src='${product.image_link}' class='catalog-image' id="${doc.id}" style="height: 240px; width: 250px; border-radius: 25px">
                </a>
                </div>
            `
        html += gridElement
        })
        filterGridContainer.innerHTML = html
        
    } else {
        filterGridContainer.innerHTML = 'no items in the catalog :('
    }
}

const saveItem = (e) => {
    var docID = e.target.id.substring(10, e.target.id.length)
    auth.onAuthStateChanged(user =>  {
        if (user) {
        
        //Get a list of the IDs currently inside the user favorites document
        let document_ids = []
    
        db.collection("users").doc(user.uid).collection('users_favorites').get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                document_ids.push(doc.id);
            });
            console.log(document_ids)
        });
        
        var item = db.collection("catalog").doc(docID)
        var currentDoc = db.collection('users').doc(user.uid).collection('users_favorites').doc(docID)
        item.get().then(function(doc) {
            if(document_ids.includes(docID)) {
                currentDoc.delete();
            } else {
                currentDoc.set(doc.data());
            }
            checkSavedStatus(docID);
            getUserFavorites();
        })

        } else {
            console.log('user not logged in.')
        }
    })
}

const checkSavedStatus = (docID) => {
    auth.onAuthStateChanged(user =>  {
        if (user) {
            var userFavs = db.collection('users').doc(user.uid).collection('users_favorites');
            userFavs.get().then(function(snapShot) {
                userFavoriteList = [];
                snapShot.docs.forEach(doc => {
                    userFavoriteList.push(doc.id)
                })
                if (userFavoriteList.includes(docID)) {
                    saveButtonDiv.innerHTML = `<a href="#" id="save-item-${docID}" class="favorite-button">Unsave item</a>`
                } else {
                    saveButtonDiv.innerHTML = `<a href="#" id="save-item-${docID}" class="favorite-button">Save item</a>`
                }
            }) 
        }
    })
}

itemImage.addEventListener('click', (e) => {
  if(e.target.matches(".favorite-button")) {
    saveItem(e)
  }
})

entirePage.addEventListener('click', (e) => {
	if(e.target.matches(".catalog-filter-button")) {
        filterItems(e.target.id);
        secondFilterContainer.style.display = "block";
        thirdFilterContainer.style.display = "none";
    }
})

contentContainer.addEventListener('click', (e) => {
  if (e.target.matches("#resultNextButton")) {
    getNextItems();
  }
  if (e.target.matches("#resultBackButton")) {
    getLastItems();
  }
})

secondFilterContainer.addEventListener('click', (e) => {
  if (e.target.matches(".catalog-filter-button")) {
    compoundQueryOne(e.target.id.substring(0,e.target.id.length - 12))
    thirdFilterContainer.style.display = "block";
  }
})

filterGridContainer.addEventListener('click', (e) => {
    if (e.target.matches('.catalog-image')) {
    		itemModal.style.display = "flex";
        getItemFromCatalog(e.target.id)
        $(function() {
            $('.modal').fadeIn();
            $('.modal-background').fadeIn();
            e.stopPropagation();
        });
        $('.close-modal').click(function() {
            $('.modal').fadeOut();
            $('.modal-background').fadeOut();
  			});
         $('.modal-background').click(function() {
            $('.modal').fadeOut();
            $('.modal-background').fadeOut();
        }); 
     		 $(document).keydown(function (event) {
            if (event.keyCode == 27) {
              $('.modal').fadeOut();
              $('.modal-background').fadeOut();
            }
      	});
    }
})
