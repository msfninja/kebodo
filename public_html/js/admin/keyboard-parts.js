var $ = (id) => { return document.getElementById(id); };
var _ = (qs) => { return document.querySelector(qs); };
var cl = (cl) => { return document.getElementsByClassName(cl); };

var partCount = 0,categoryCount = 0,itemCount = 0;

var urlTxt = `If you leave the URL field empty, the server will use the item's name to search DuckDuckGo, retrieve the first result, and pass it to the web scraper that will try to find imagery, price and other essential information. This method may not always work, either because the first result is not a vendor/the first result is a dynamic webite/there are no results at all, so do it on your own risk. It's always better to manually paste a verified URL.`;

$('addPart').addEventListener('click',() => {
	$('newPartArea').outerHTML = `
	<div class="partSection" id="part` + partCount + `">
	<div class="row1">
		<div>
			<div class="h1 input">Part&nbsp;<input id="part` + partCount + `Name" style="font-size: 32px; font-weight: bold; font-family: 'Space Mono', monospace;" type="text" name="part` + partCount + `Name" placeholder="part` + partCount + `" required></div>
		</div>
		<div id="removePart` + partCount + `" title="Delete part" class="btn">Delete</div>
	</div>
	<div class="ws"></div><div id="part` + partCount + `NewCategoryArea"></div>
	<div class="row"><hr><div id="part` + partCount + `addCategory" onclick="addCategory('part` + partCount + `NewCategoryArea')" class="addCategoryBtn" title="Add new category"><div class="h1"><i class="fas fa-folder-plus"></i></div></div><hr></div>
	</div>
	</div><br><div id="newPartArea"></div>
	`;
	partCount++;
});

function addCategory(categoryArea) {
	$(categoryArea).outerHTML = `
	<div class="category" id="part` + (partCount - 1) + `Category` + categoryCount + `">
		<div class="row1">
			<div>
				<div class="h2 input">Category&nbsp;<input id="part` + (partCount - 1) + `Category` + categoryCount + `" style="font-size: 28px; font-weight: bold; font-family: 'Space Mono', monospace;" type="text" name="part` + (partCount - 1) + `Category` + categoryCount + `" placeholder="category` + categoryCount + `" required></div>
			</div>
			<div title="Remove category" id="removePart` + (partCount - 1) + `Category` + categoryCount + `" class="removeCategoryBtn">
				<div class="h1"><i class="fas fa-folder-minus"></i></div>
			</div>
		</div>
		<div id="part` + (partCount - 1) + `Category` + categoryCount + `NewItemArea"></div>
		<div class="row"><hr><div id="part` + (partCount - 1) + `Category` + categoryCount + `addItem` + itemCount + `" onclick="addItem('part` + (partCount - 1) + `Category` + categoryCount + `NewItemArea')" class="addItemBtn" title="Add new item"><div class="h1"><i class="fas fa-plus-circle"></i></div></div><hr></div>
	</div><br><div id="part` + (partCount - 1) + `NewCategoryArea"></div>
	`;
	categoryCount++;
}

function addItem(itemArea) {
	$(itemArea).outerHTML = `
	<div class="items">
		<div class="row1 item" id="part` + (partCount - 1) + `Category` + (categoryCount - 1) + `item` + itemCount + `">
			<div>Item:&nbsp;<input type="text" name="part` + (partCount - 1) + `Category` + (categoryCount - 1) + `item` + itemCount + `Name" placeholder="item` + itemCount + `" required></div>
			<div class="vws"></div>
			<div>Tags:&nbsp;<input type="text" name="part` + (partCount - 1) + `Category` + (categoryCount - 1) + `item` + itemCount + `Tags" placeholder="color,material,accessory"></div>
			<div class="vws"></div>
			<div><span style="cursor: help;" title="` + urlTxt + `">URL</span>:&nbsp;<input type="text" name="part` + (partCount - 1) + `Category` + (categoryCount - 1) + `item` + itemCount + `URL" placeholder="Leave blank for automatic link" required></div>
			<div class="vws"></div>
			<div title="Remove item" id="removePart` + (partCount - 1) + `Category` + (categoryCount - 1) + `Item` + itemCount + `" class="removeItemBtn"><div class="h1"><i class="fas fa-times-circle"></i></div></div>
		</div>
	</div>
	<div id="part` + (partCount - 1) + `Category` + (categoryCount - 1) + `NewItemArea"></div>
	`;
	itemCount++;
}