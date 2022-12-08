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
  console.log("data", data);

  if (data.item_count) {
    document.querySelector(".cart__full").style.display = "block"
    document.querySelector(".cart__empty").style.display = "none"
  }else{
    document.querySelector(".cart__full").style.display = "none"
    document.querySelector(".cart__empty").style.display = "block"
  }
  let cart__item = ``;
 
  data.items.forEach((item) => {
   let deliver_frequency = item?.selling_plan_allocation?.selling_plan.name

   
    cart__item += `
      <div class="cart__product" id="${item.key}" >
      <div class="product__img">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="product__content">
          <h5 id="product_title">${item.product_title}</h5>
          
           <p id="variant_title">${ deliver_frequency != null ? deliver_frequency : ""     }</p>
           
           <p id="variant_title">${ item.variant_title != null ? item.variant_title : ""     }</p>
          <div class="qty" >
            <img data-id = ${item.key} id="minus" class="qty__controller" src="https://cdn.shopify.com/s/files/1/0625/1184/1457/files/minus.svg?v=1664125478" alt="minus">
             <span id="qty" class="qty_class"> ${item.quantity} </span>
             <img data-id = ${item.key} id="plus" class="qty__controller" src="https://cdn.shopify.com/s/files/1/0625/1184/1457/files/plus.svg?v=1664125698" alt="plus">
          </div>
      </div>
      <div class="product__prc">
          <p id="product_total_price">$${item?.properties?._bundle_price ?(item.properties._bundle_price*item.quantity) / 100: item.line_price / 100}</p>
          <img data-id = ${item.key} id ="remove_product" class="remove-product" src="https://cdn.shopify.com/s/files/1/0625/1184/1457/files/remove.svg?v=1664125727" alt="remove">
      </div>

      </div> 
      `;

     
  });
  // document.querySelector("#total_price").textContent = `$${ data.total_price / 100}.00`;
  
  bag_counter.textContent = data.item_count
  cart__content.innerHTML = cart__item;

  setTimeout(()=> {
    let x =document.querySelectorAll("#product_total_price")
    let qwe = 0
    x.forEach(item => {
      qwe =qwe +Number(item.textContent.slice(1))
    })
    document.querySelector("#total_price").textContent = `$${qwe}`;
  
  },500)
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
function addToCartWithSellingPlans(id, qtty, sellingPlanId) {
  let form_data = {
    items: [
      {
        id: id,
        quantity: qtty,
        selling_plan: sellingPlanId
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
  
  if (e.target.dataset.selling_plan_id >= 1) {
    let recharge_id = form.querySelector(".recharge-option:checked").value
    if (recharge_id == "subscribe") {
        let recharge_freq_id = form.querySelector(".recharge-frequency-option:checked").value
        let recharge_prod_id = form.querySelector(".recharge-frequency-option:checked").id

        addToCartWithSellingPlans(recharge_prod_id, 1, recharge_freq_id)
    } else {
      addToCart(recharge_id, 1)
    }
    console.log(recharge_id);

  } else {
    if (e.target.dataset.id == "true") {
      let prod_id = form.querySelector(".no-variant").id;
      addToCart(prod_id, 1)
    } else if (e.target.dataset.id == "false") {
      let var_id = form.querySelector(".option:checked").value;
      addToCart(var_id, 1)
    }
  }
});


getDetails()



let modal = document.querySelector(".modal");
let modal_link = document.querySelectorAll(".modal__link")
let burger = document.querySelector(".burger")

// burger
function myFunction(x) {
  x.classList.toggle("change");
  modal.classList.toggle("active");
}

modal_link.forEach(link => {
  link.addEventListener("click", ()=>{
    myFunction(burger)
    modal.classList.remove("active")
  })
})
