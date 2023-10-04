// Contenedor principal
const contenedorPrendas = document.querySelector(`#contenedor-prendas`);
const carrito = [];
let prendas;

const getProductos = async () => {
 try {
  const respuesta = await fetch("data.json");
  const data = await respuesta.json();
  return data.prendas;
 } catch (error) {
  console.error("Error al obtener los productos:", error);
  throw error;
 }
};


// Mostramos productos en el DOM
const mostrarProductos = (lenceria) => {
  prendas = lenceria;
  lenceria.forEach(prenda => {
    const cardPrenda = document.createElement(`article`);
    cardPrenda.setAttribute(`id`, `tarjeta-${prenda.id}`);
    const { id, img, nombre, color, talle, precio } = prenda;
    cardPrenda.innerHTML = `
      <img class="prenda-img" src="${img}" alt="${prenda.nombre}">
      <div class="prenda-descripcion">
          <h4 class="prenda-nombre">${nombre}</h4>
          <h4 class="prenda-color">${color}</h4>
          <h4 class="prenda-talle">${talle.join(`,`)}</h4>
          <h3 class="prenda-precio">$${precio}</h3>
          <button id="${id}" class="btn-compra"> COMPRAR</button>
      </div>`;
    contenedorPrendas.appendChild(cardPrenda);
  });

  const btnComprar = document.querySelectorAll(`.btn-compra`);
  btnComprar.forEach(el => {
    el.addEventListener(`click`, (e) => {
     agregarAlCarrito(e.target.id);
    });
  });
};

(async () => {
  try {
    const prendas = await getProductos();
    mostrarProductos(prendas);
  } catch (error) {
    console.error("Hubo un error al obtener los productos:", error);
    Toastify({
      text: "Error al cargar los productos",
      className: "error",
      style: {
        background: "linear-gradient(to right, red, orange)",
      },
    }).showToast();
  }
})();

// Suma del total de las prendas
const calcularTotal = () => {
  return carrito.reduce((total, prenda) => total + prenda.cantidad * prenda.precio, 0);
};

// Mostrar el total
const mostrarTotalEnPantalla = () => {
  const totalContainer = document.querySelector("#total-container");
  totalContainer.innerHTML = `<h5 class="total-pagar"> Total: $${calcularTotal()}</h5>`;
};

// Agregamos productos al carrito
const agregarAlCarrito = async (id) => {
  try {
    const prendaEnCarrito = carrito.find((prendaCarrito) => prendaCarrito.id === parseInt(id));

    if (prendaEnCarrito) {
      prendaEnCarrito.cantidad++; // Aumenta la cantidad si el producto ya está en el carrito
    } else {
      const prendaEncontrada = prendas.find((prenda) => prenda.id === parseInt(id));
      if (prendaEncontrada) {
        carrito.push({
          ...prendaEncontrada,
          cantidad: 1,
        });
      }
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    verCarritoEnPantalla();
    mostrarTotalEnPantalla();
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
  }
};

// Renderizamos el carrito en el DOM
const verCarritoEnPantalla = () => {
  const carritoContainer = document.querySelector(`#carrito-container`);
  carritoContainer.innerHTML = "";

  const tituloCarrito = document.createElement("h2");
  tituloCarrito.textContent = "CARRITO";
  carritoContainer.append(tituloCarrito);

  carrito.forEach((prenda) => {
    const prendaElemento = document.createElement("div");
    prendaElemento.classList.add("producto-en-carrito");
    const { nombre, cantidad, precio, id } = prenda;
    prendaElemento.innerHTML = `
      <h3 class="nombre-carr">${nombre}</h3>
      <p class="cantidad-precio-carr">Cantidad: ${cantidad}</p>
      <p class="cantidad-precio-carr">Precio: $${precio}</p>
      <p> <button id="${id}" class="btn-borrar"> Eliminar</button></p>`;
    const botonEliminar = prendaElemento.querySelector(`.btn-borrar`);
    botonEliminar.addEventListener("click", async () => {
      await eliminarDelCarrito(id);
      verCarritoEnPantalla();
    });

    carritoContainer.append(prendaElemento);
  });
};

// Eliminar productos del carrito
const eliminarDelCarrito = async (id) => {
  try {
    const indice = carrito.findIndex((prenda) => prenda.id === id);
    if (indice !== -1) {
      const prenda = carrito[indice];
      if (prenda && prenda.cantidad > 1) {
        prenda.cantidad--;
      } else {
        carrito.splice(indice, 1);
      }
      localStorage.setItem("carrito", JSON.stringify(carrito));
    }
  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
  }
  mostrarTotalEnPantalla()
};

document.addEventListener("DOMContentLoaded", async () => {
  const carritoSinCargar = localStorage.getItem("carrito");

  if (carritoSinCargar) {
    const carritoCargado = JSON.parse(carritoSinCargar);

    if (Array.isArray(carritoCargado) && carritoCargado.length > 0) {
      carrito.push(...carritoCargado);
    } else {
      Toastify({
        text: "NO HAY PRODUCTOS EN EL CARRITO",
        className: "info",
        style: {
          background: "linear-gradient(to right, purple, purple)",
        },
      }).showToast();
    }
  } else {
    Toastify({
      text: "NO HAY PRODUCTOS EN EL CARRITO",
      className: "info",
      style: {
        background: "linear-gradient(to right, purple, purple)",
      },
    }).showToast();
  }
  verCarritoEnPantalla();
  mostrarTotalEnPantalla();
});

// Se agrega formulario de pago
const btnPagar = document.querySelector("#btn-pagar");
const contenedorFormularioPago = document.querySelector("#formulario-pago-container");

btnPagar.addEventListener("click", () => {
  mostrarFormularioDePago();
  btnPagar.disabled = true;
});

// Mostramos el formulario de pago
function mostrarFormularioDePago() {
  const formularioPago = document.createElement("div");
  formularioPago.innerHTML = `
    <h2>Pagar con tarjeta</h2>
    <form id="formulario" action="">
      <input type="number" id= "numeroTarj" placeholder="Ingrese los números de la tarjeta"/>
      <input type="text" id= "nombreTarj"placeholder="Nombre de la tarjeta"/>
      <input type="date" id= "fecha" name="fecha"/>
      <input type="number" id= "codigo" placeholder="Código de seguridad"/>
      <input type="submit" id= "btn-comprar" value="COMPRAR">
    </form>`;
  contenedorFormularioPago.append(formularioPago);

  const formulario = document.querySelector("#formulario")
  const btnComprar = document.querySelector("btn-comprar")
  const numeroTarj = document.querySelector("#numeroTarj");
  const nombreTarj = document.querySelector("#nombreTarj");
  const fecha = document.querySelector("#fecha");
  const codigo = document.querySelector("#codigo");

  formulario.addEventListener(`submit`, (event) => {
    event.preventDefault();
    enviarFormulario(numeroTarj, nombreTarj, fecha, codigo);
  });
}

function enviarFormulario(numeroTarj,nombreTarj,fecha,codigo){
  const numTarjeta = numeroTarj.value.trim();
  const nombre = nombreTarj.value.trim();
  const fechaExp = fecha.value.trim();
  const codSeguridad = codigo.value.trim();

  //Validamos formulario
  if(numTarjeta === "" || nombre === "" || fechaExp === "" || codSeguridad === ""){
    Swal.fire({
      icon: 'error',
      title: 'Todos los campos son obligatorios',
      text: 'Por favor, complete todos los campos',
      footer: '<a href=""></a>'
    })
    return;
    }

  if(numTarjeta.length < 16){
    Swal.fire({
      icon: 'error',
      title: 'Ingrese los números de la tarjeta correctamente',
      text: '',
      footer: '<a href=""></a>'
    })
    return;
  }

  if(codSeguridad < 3){
    Swal.fire({
      icon: 'error',
      title: 'Ingrese el codigo deseguridad correctamente',
      text: '',
      footer: '<a href="">El número se encuentra en la parte posterior de la tarjeta</a>'
    })
    return;
  }

  vaciarCarrito();    //Vaciamos el carrito una vez hecha la compra correctamente
  mostrarTotalEnPantalla();
  formulario.reset();
  Swal.fire(
    'El pago fue enviado',
    'Recibirás un e-mail con la confirmación del pago',
    'success'
  );
}

function vaciarCarrito() {
  carrito.length = 0;
  localStorage.removeItem("carrito");
  verCarritoEnPantalla();
  mostrarTotalEnPantalla();
}


