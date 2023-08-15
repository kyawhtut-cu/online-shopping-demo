(function (jQuery) {

	let App = null
	let Page = null
	let NetworkCallback = null

	let itemList = []

	function calculateTotalCount() {
		let totalCount = 0
		itemList.forEach(item => {
			let count = item.count
			if (count != null) {
				totalCount += count
			}
		})

		App.MainButton.text = "စျေးဝယ်ခြင်း ကြည့်ရန်"
		if (totalCount > 0) {
			App.enableClosingConfirmation()
			App.showMainButton()
		} else {
			App.disableClosingConfirmation()
			App.hideMainButton()
		}
	}

	function addToCart(count, item_id) {

		let item = itemList[itemList.findIndex(item => item.item_id == item_id)]

		if (item == null) return

		let newCount = 0

		if (item.count != null) {
			newCount = item.count
		}

		newCount += count
		if (newCount < 0) {
			newCount = 0
		}

		item["count"] = newCount

		itemList[itemList.indexOf(item => item.item_id == item_id)] = item

		calculateTotalCount()

		$(`#span-${item_id}`).text(newCount)
		
		if (newCount === 0) {
			$(`#span-${item_id}`).hide()
			$(`#div-${item_id}`).hide()
			$(`#btn-${item_id}`).show()
		} else {
			$(`#span-${item_id}`).show()
			$(`#div-${item_id}`).show()
			$(`#btn-${item_id}`).hide()
		}
	}


	function renderPage() {

		Page.empty()

		if (itemList.length == 0) return

		let row = $(`<table>`, {
			'class': `row`
		})
		itemList.forEach(item => {
			let parent = $(`<div>`, {
				'class': `col-4 mt-2 mb-3 text-center product-container`,
			})

			let div = $(`<div>`)
			let img = $(`<img>`, {
				'src': item.item_logo
			})
			div.append(img)
			let cartCount = $(`<span>`, {
				'id': `span-${item.item_id}`,
				'class': `cartCount`
			})
			cartCount.hide()
			div.append(cartCount)

			parent.append(div)

			parent.append($(`<p>`, {
				'class': `product-name mt-2`
			}).text(item.item_name))
			parent.append($(`<p>`, {
				'id': `price`
			}).text(`SGD ${item.item_price}`))

			let btnAddToCart = $(`<span>`, {
				'id': `btn-${item.item_id}`,
				'class': `product-add`
			}).text(`Add`)
			btnAddToCart.click(function() {
				addToCart(1, item.item_id)
			})
			parent.append(btnAddToCart)

			let btnAdd = $(`<span>`, {
				'id': `btnAdd-${item.item_id}`,
				'class': `product-sub-add`
			}).append(`<i class="fa fa-plus" aria-hidden="true"></i>`)
			btnAdd.click(function() {
				addToCart(1, item.item_id)
			})
			let btnRemove = $(`<span>`, {
				'id': `btnRemove-${item.item_id}`,
				'class': `product-sub-remove`,
			}).append(`<i class="fa fa-minus" aria-hidden="true"></i>`)
			btnRemove.click(function() {
				addToCart(-1, item.item_id)
			})
			let divAction = $(`<div>`, {
				'id': `div-${item.item_id}`
			}).append(btnRemove).append(btnAdd)
			divAction.hide()
			parent.append(divAction)

			row.append(parent)
		})

		Page.append(row)
		Page.show()
	}

	function fetchItemList() {
		let category_id = $.Utils().getParameter(`category_id`)
		App.Api.sheet({
			route: `get_all_item_by_category_id`,
			query: {
				category_id
			},
			callback: function(response) {
				if (NetworkCallback != null) NetworkCallback(response)

				if (response.status === `success`) {
					if (response.data != null) itemList = response.data
					renderPage()
				}
			}
		})
	}

	jQuery.ItemPage = function(app, div) {
		App = app
		Page = $(div)
		Page.empty()

		return {
			init() {
				fetchItemList()
			},

			isHasSelectedItem() {
				return getCartItemList().length > 0
			},

			getCartItemList() {
				return itemList.filter(item => {
					item.count != null && item.count > 0
				})
			},

			setNetworkCallback(callback) {
				NetworkCallback = callback
			},

			show() {
				App.MainButton.text = `စျေးဝယ်ခြင်း ကြည့်ရန်`
				Page.show()
			},

			hide() {
				Page.hide()
			}
		}
	}
}(jQuery))