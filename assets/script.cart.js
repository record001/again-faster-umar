let bag = document.querySelector("#bag")
let bag_counter = document.querySelector("#bag_counter")
let cart = document.querySelector(".cart")
let close_cart = document.querySelector(".close__cart")
let body = document.querySelector("body")
let cart_blur = document.querySelector(".blur")

function toggleCart() {
  cart.classList.toggle("on");
  body.classList.add("body-hover");
  cart_blur.classList.add("db");
}

bag.addEventListener("click", e=> {
    toggleCart()
  })
close_cart.addEventListener("click", e=> {
    cart.classList.remove("on")
    body.classList.remove("body-hover")
    cart_blur.classList.remove("db")

  })

cart_blur.addEventListener("click", e=> {
    cart.classList.remove("on")
    body.classList.remove("body-hover")
    cart_blur.classList.remove("db")
  })


let cart__content = document.querySelector(".cart__content");
async function getDetails() {
 
  let response = await fetch(window.Shopify.routes.root + "cart.js");
  let data = await response.json();


  if (data.item_count) {
    document.querySelector(".cart__full").style.display = "block"
    document.querySelector(".cart__empty").style.display = "none"
  }else{
    document.querySelector(".cart__full").style.display = "none"
    document.querySelector(".cart__empty").style.display = "block"
  }
  let cart__item = ``;
  data.items.forEach((item) => {
    cart__item += `
      <div class="cart__product" id="${item.variant_id}" >
      <div class="product__img">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="product__content">
          <h5 id="product_title">${item.product_title}</h5>
          
           <p id="variant_title">${ item.variant_title != null ? item.variant_title : ""     }</p>
          <div class="qty" >
            <img data-id = ${item.variant_id} id="minus" class="qty__controller" src="https://cdn.shopify.com/s/files/1/0625/1184/1457/files/minus.svg?v=1664125478" alt="minus">
             <span id="qty" class="qty_class"> ${item.quantity} </span>
             <img data-id = ${item.variant_id} id="plus" class="qty__controller" src="https://cdn.shopify.com/s/files/1/0625/1184/1457/files/plus.svg?v=1664125698" alt="plus">
          </div>
      </div>
      <div class="product__prc">
          <p id="product_total_price">$${item.price / 100}.00</p>
          <img data-id = ${item.variant_id} id ="remove_product" class="remove-product" src="https://cdn.shopify.com/s/files/1/0625/1184/1457/files/remove.svg?v=1664125727" alt="remove">
      </div>

      </div> 
      `;
  });
  document.querySelector("#total_price").textContent = `$${ data.total_price / 100}.00`;
  bag_counter.textContent = data.item_count
  cart__content.innerHTML = cart__item;
}


async function changeCart(id, qtty) {
  let form_data = {
    id: id,
    quantity: qtty,
  };
  fetch(window.Shopify.routes.root + "cart/change.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form_data),
  })
    .then((response) => {
      
      return response.json();
    })
    .then((data) => {
      this.getDetails();
      console.log(data);
     

    })
    .catch((error) => {
      console.error("Error:", error);
    });
}


cart__content?.addEventListener("click", (e) => {
  let cartProductId = e.target.parentElement.parentElement;
  let lineItemId = e.target.dataset.id

  if ( lineItemId == cartProductId.parentElement.id && e.target.id == "minus") {
    changeCart( lineItemId,  Number(e.target.nextElementSibling.textContent) - 1   );
    

  } else if (lineItemId == cartProductId.parentElement.id && e.target.id == "plus") {
    changeCart(lineItemId,Number(e.target.previousElementSibling.textContent) + 1 );
   


  } else if (lineItemId == cartProductId.id && e.target.id == "remove_product") {
    changeCart(lineItemId, 0 );
  }
});


function addToCart(id, qtty) {
  let form_data = {
    items: [
      {
        id: id,
        quantity: qtty,
      },
    ],
  };
  fetch(window.Shopify.routes.root + "cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form_data),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      this.getDetails();
      this.toggleCart();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

let inventory_qty = 0

//  freqently bought with section >>> add to cart
let fbw_add_to_cart = document.querySelectorAll(".fbw_add_to_cart");
fbw_add_to_cart.forEach((item) => {
  item.addEventListener("click", (e) => {
    addToCart(e.target.value, 1)
  });
});

//  form add to cart
let form = document.querySelector("#form");

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.dataset.id == "true") {
    let prod_id = form.querySelector(".no-variant").id;
    addToCart(prod_id, 1)
  } else if (e.target.dataset.id == "false") {
    let var_id = form.querySelector(".option:checked").value;
    addToCart(var_id, 1)
  }
});


getDetails()
