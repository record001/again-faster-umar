
const STOREFRONT_ACCESS_TOKEN =  '52be3891a7b97b9b5a84237b0a4080d5'
let CART_ID = "gid://shopify/Cart/c4c0323c2cb137890b78cc1eadfd60e8"
const GRAPHQL_URL = 'https://again-faster-umar.myshopify.com/api/2022-10/graphql.json'
const QUERY =  `
query {
				products(first: 8) {
						edges {
								node {
									title
									
									featuredImage {
											url
									}
									variants(first:1) {
										edges {
											node {
												id
											}
										}
									}
									priceRange {
										maxVariantPrice {
											amount
										}
										minVariantPrice {
											amount
										}
									}
									
							
								}
								
						}
				}
			}
`;




async function renderGraphql() {
let graphqlData = await fetch(GRAPHQL_URL, {
	
	method: 'POST',
	headers: {
	'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
	'Content-Type': 'application/graphql',

	},
	body:  QUERY

}) ;
let data = await graphqlData.json();
let dataGR = data.data.products.edges



// rendering 
let graphql__grid = document.querySelector(".graphql__grid")

dataGR.forEach(product => {
	graphql__grid.innerHTML += `
	<form class="grid__item" id = "graphql_form_id" 
				data-id="${product.node.variants.edges[0].node.id}">
				<img src="${product.node.featuredImage.url}" alt="alt Image">
				<h4>${product.node.title}</h4>
				<p>$${product.node.priceRange.minVariantPrice.amount}</p>
				<button type="submit">Add to Cart</button>
	</form>
		`	
			
});

}
renderGraphql()




async function createCart() {
	let createCartMutation=`
		mutation {
		cartCreate{
			cart{
				id
				checkoutUrl
			}
		}
	}

	`

	let get_cart_id = await fetch(GRAPHQL_URL, {

		method: 'POST',
		headers: {
		'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
		'Content-Type': 'application/graphql',

		},
		body:  createCartMutation

	}) ;
  let cartIdResponse = await get_cart_id.json();
  let CART_ID = cartIdResponse.data.cartCreate.cart.id


	let localCartData =	window.localStorage.getItem('id')
	
	if (!localCartData) {
		window.localStorage.setItem("id", CART_ID)
		
	}else {
		return;
	}
	
	


}

let cart_id = window.localStorage.getItem('id')
// localStorage.removeItem("id");
createCart()
// document.addEventListener("DOMContentLoaded", createCart)

async function add_to_graphql_cart(variantId) {
		let cartLinesAdd =`		 
		mutation  {
			cartLinesAdd(cartId:"${cart_id}", lines: [{ quantity: 1, merchandiseId: "${variantId}"}]) {
				cart {
					lines(first: 100) {
						edges {
							node {
								id
								quantity
								
								merchandise {
									... on ProductVariant {
										product {
											title
											featuredImage {
												url
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	`
	let add_cart = await fetch(GRAPHQL_URL, {

		method: 'POST',
		headers: {
		'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
		'Content-Type': 'application/graphql',

		},
		body:  cartLinesAdd

	}) ;

	let add_cartResponse = await add_cart.json();
  let updated = add_cartResponse
	console.log(updated, "teng1");
	renderProductsToCart()
	
}

let gcart__content = document.querySelector(".gcart__content")

async function renderProductsToCart() {
	
	let renderQuery =`
	query {
		cart(
			id: "${cart_id}"
		) {
			id
			
			lines(first: 10) {
				edges {
					node {
						id
						quantity
						merchandise {
							... on ProductVariant {
								id
								title
								price {
									amount
								}
								image {
									url
								}
							}
						}
						
					}
				}
			}
			
			cost {
				
				subtotalAmount {
					amount
					currencyCode
				}
				
				
			}
		
		}
	}
	
	`

	let render_cart = await fetch(GRAPHQL_URL, {

		method: 'POST',
		headers: {
		'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
		'Content-Type': 'application/graphql',

		},
		body:  renderQuery

	}) ;

	let renderCartResponse = await render_cart.json();
  let renderedData = renderCartResponse.data.cart.lines.edges

	let gcart_item = ``
	renderedData.forEach(items => {
		let item = items.node.merchandise
		gcart_item += `
      <div class="cart__product"  >
      <div class="product__img">
        <img src="${item.image.url}" alt="img">
      </div>
      <div class="product__content">
          <h5 id="product_title">${item.title}</h5>        
           
           
          <div class="qty" >
            <img data-id = ${items.node.id} id="minus" class="qty__controller" src="https://cdn.shopify.com/s/files/1/0625/1184/1457/files/minus.svg?v=1664125478" alt="minus">

			<span id="qty" class="qty_class"> ${items.node.quantity} </span>

			<img data-id = ${items.node.id} id="plus" class="qty__controller" src="https://cdn.shopify.com/s/files/1/0625/1184/1457/files/plus.svg?v=1664125698" alt="plus">
          </div>

		
      </div>
      <div class="product__prc">
          <p id="product_total_price">$${item.price.amount}</p>
          <img data-id = ${items.node.id} id ="remove_product" class="remove-product" src="https://cdn.shopify.com/s/files/1/0625/1184/1457/files/remove.svg?v=1664125727" alt="remove">
      </div>

      </div> 
      `;
	})

  gcart__content.innerHTML = gcart_item;

}
renderProductsToCart()

gcart__content.addEventListener("click", (e)=> {
	if (e.target.id == "remove_product") {
		removeProduct(e.target.dataset.id)
	}else if(e.target.id == "minus") {
		let qty = Number(e.target.nextElementSibling.textContent)-1
		updateCart(e.target.dataset.id, qty)
	}else if(e.target.id == "plus") {
		let qty = Number(e.target.previousElementSibling.textContent)+1
		updateCart(e.target.dataset.id, qty)
	}
})

async function updateCart(id, qty) {
	let updateMutation = `
	mutation  {
		cartLinesUpdate(cartId: "${cart_id}", lines: {
			id:"${id}"
			quantity: ${qty}
		})  {
			cart {
				lines(first: 100) {
					edges {
						node {
							id
							quantity
							
							merchandise {
								... on ProductVariant {
									product {
										title
										featuredImage{
                      url
                    }
									}
								}
							}
						}
					}
				}
			}
		}
	}
	
	`	
	let update_cart = await fetch(GRAPHQL_URL, {

		method: 'POST',
		headers: {
		'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
		'Content-Type': 'application/graphql',

		},
		body:  updateMutation

	}) ;

	let updateItem = await update_cart.json();
  let updatedITEM = updateItem.data.cartLinesUpdate.cart.lines.edges
	renderProductsToCart()
}
async function removeProduct(lineID) {
	let removeItemMutation = `
	mutation  {
		cartLinesRemove(cartId: "${cart_id}", lineIds: "${lineID}") 
		{
			cart {
				lines(first: 100) {
					edges {
						node {
							id
							quantity
							
							merchandise {
								... on ProductVariant {
									product {
										title
										
									}
								}
							}
						}
					}
				}
			}
		}
	  }
	  
	`
	let remove_item = await fetch(GRAPHQL_URL, {

		method: 'POST',
		headers: {
		'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
		'Content-Type': 'application/graphql',

		},
		body:  removeItemMutation

	}) ;

	let removeItem = await remove_item.json();
  let removedITEM = removeItem

	renderProductsToCart()
}


let setInt  = setInterval(graphqlForm,1000)

function graphqlForm() {
	let graphql_form = document.querySelectorAll("#graphql_form_id")
	graphql_form.forEach(btn => {
		btn.addEventListener("submit", (e)=> {
			e.preventDefault()
			openCart()
			add_to_graphql_cart(e.target.dataset.id)
			renderProductsToCart()
			console.log( e.target.dataset.id);
		})
	})
	

if (graphql_form.length > 1) {         
			clearInterval(setInt)
		}
}
graphqlForm()


// toggle cart

let cartOpener = document.querySelector(".open-graphql-cart")
let cartCloser = document.querySelector(".gcart__close")
let cart_drawer = document.querySelector(".gcart")
function openCart() {
	cart_drawer.classList.add("on")
	cart_drawer.classList.add("body-hover")
}
cartOpener.addEventListener("click", e=> {
	cart_drawer.classList.add("on")
	cart_drawer.classList.add("body-hover")
})

cartCloser.addEventListener("click", e=> {
    cart_drawer.classList.remove("on")
    cart_drawer.classList.remove("body-hover")
})