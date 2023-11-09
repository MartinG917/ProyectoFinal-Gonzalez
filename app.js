let carritoVisible = false;
const serverUrl = 'http://127.0.0.1:5500';

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

async function cargarInformacionDelServidor() {
    try {
        const response = await fetch(serverUrl);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Error al cargar datos del servidor: ${error.message}`);
    }
}

function ready() {
    cargarInformacionDelServidor()
        .then((data) => {
            // Manejar la data recibida, por ejemplo,actualizar el DOM
            console.log('Datos del servidor cargados:', data);
        })
        .catch((error) => {
            // Manejar errores en la carga de datos
            console.error('Error al cargar datos del servidor:', error);
        });

    let botonesEliminarItem = document.getElementsByClassName('btn-eliminar');
    for (let i = 0; i < botonesEliminarItem.length; i++) {
        let button = botonesEliminarItem[i];
        button.addEventListener('click', eliminarItemCarrito);
    }

    let botonesSumarCantidad = document.getElementsByClassName('sumar-cantidad');
    for (let i = 0; i < botonesSumarCantidad.length; i++) {
        let button = botonesSumarCantidad[i];
        button.addEventListener('click', sumarCantidad);
    }

    let botonesRestarCantidad = document.getElementsByClassName('restar-cantidad');
    for (let i = 0; i < botonesRestarCantidad.length; i++) {
        let button = botonesRestarCantidad[i];
        button.addEventListener('click', restarCantidad);
    }

    let botonesAgregarAlCarrito = document.getElementsByClassName('boton-item');
    for (let i = 0; i < botonesAgregarAlCarrito.length; i++) {
        let button = botonesAgregarAlCarrito[i];
        button.addEventListener('click', agregarAlCarritoClicked);
    }

    document.getElementsByClassName('btn-pagar')[0].addEventListener('click', pagarClicked);
}

function pagarClicked() {
    Swal.fire(
        'Gracias por tu compra!',
        'Recibirás un correo con toda la información del envío',
        'success'
    );
    let carritoItems = document.getElementsByClassName('carrito-items')[0];
    while (carritoItems.hasChildNodes()) {
        carritoItems.removeChild(carritoItems.firstChild);
    }
    actualizarTotalCarrito();
    ocultarCarrito();
}

function agregarAlCarritoClicked(event) {
    let button = event.target;
    let item = button.parentElement;
    let titulo = item.getElementsByClassName('titulo-item')[0].innerText;
    let precio = item.getElementsByClassName('precio-item')[0].innerText;
    let imagenSrc = item.getElementsByClassName('img-item')[0].src;

    agregarItemAlCarrito(titulo, precio, imagenSrc);

    hacerVisibleCarrito();
}



function hacerVisibleCarrito() {
    carritoVisible = true;
    let carrito = document.getElementsByClassName('carrito')[0];
    carrito.style.marginRight = '0';
    carrito.style.opacity = '1';

    let items = document.getElementsByClassName('contenedor-items')[0];
    items.style.width = '60%';
}

function agregarItemAlCarrito(titulo, precio, imagenSrc) {
    let item = document.createElement('div');
    item.classList.add('item');
    let itemsCarrito = document.getElementsByClassName('carrito-items')[0];

    let nombresItemsCarrito = itemsCarrito.getElementsByClassName('carrito-item-titulo');
    for (let i = 0; i < nombresItemsCarrito.length; i++) {
        if (nombresItemsCarrito[i].innerText == titulo) {
            alert("El item ya se encuentra en el carrito");
            return;
        }
    }

    item.innerHTML = `
        <div class="carrito-item">
            <img src="${imagenSrc}" width="80px" alt="">
            <div class="carrito-item-detalles">
                <span class="carrito-item-titulo">${titulo}</span>
                <div class="selector-cantidad">
                    <i class="fa-solid fa-minus restar-cantidad"></i>
                    <input type="text" value="1" class="carrito-item-cantidad" disabled>
                    <i class="fa-solid fa-plus sumar-cantidad"></i>
                </div>
                <span class="carrito-item-precio">${precio}</span>
            </div>
            <button class="btn-eliminar">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    itemsCarrito.appendChild(item);

    item.getElementsByClassName('btn-eliminar')[0].addEventListener('click', eliminarItemCarrito);

    let botonRestarCantidad = item.getElementsByClassName('restar-cantidad')[0];
    botonRestarCantidad.addEventListener('click', restarCantidad);

    let botonSumarCantidad = item.getElementsByClassName('sumar-cantidad')[0];
    botonSumarCantidad.addEventListener('click', sumarCantidad);

    aumentarCantidadEnLocalStorage();

    actualizarTotalCarrito();
}

function sumarCantidad(event) {
    let buttonClicked = event.target;
    let selector = buttonClicked.parentElement;
    let cantidadActual = selector.getElementsByClassName('carrito-item-cantidad')[0];
    cantidadActual.value = parseInt(cantidadActual.value) + 1;
    actualizarTotalCarrito();
}

function restarCantidad(event) {
    let buttonClicked = event.target;
    let selector = buttonClicked.parentElement;
    let cantidadActual = selector.getElementsByClassName('carrito-item-cantidad')[0];
    let cantidad = parseInt(cantidadActual.value);
    if (cantidad > 1) {
        cantidadActual.value = cantidad - 1;
        actualizarTotalCarrito();
    }
}

function eliminarItemCarrito(event) {
    let buttonClicked = event.target;
    buttonClicked.parentElement.parentElement.remove();

    disminuirCantidadEnLocalStorage();

    actualizarTotalCarrito();

    ocultarCarrito();
}

function ocultarCarrito() {
    let carritoItems = document.getElementsByClassName('carrito-items')[0];
    if (carritoItems.childElementCount === 0) {
        let carrito = document.getElementsByClassName('carrito')[0];
        carrito.style.marginRight = '-100%';
        carrito.style.opacity = '0';
        carritoVisible = false;

        let items = document.getElementsByClassName('contenedor-items')[0];
        items.style.width = '100%';
    }
}

function actualizarTotalCarrito() {
    let carritoContenedor = document.getElementsByClassName('carrito')[0];
    let carritoItems = carritoContenedor.getElementsByClassName('carrito-item');
    let total = 0;
    for (let i = 0; i < carritoItems.length; i++) {
        let item = carritoItems[i];
        let precioElemento = item.getElementsByClassName('carrito-item-precio')[0];
        let precio = parseFloat(precioElemento.innerText.replace('$', '').replace(',', ''));
        let cantidadItem = item.getElementsByClassName('carrito-item-cantidad')[0];
        let cantidad = parseInt(cantidadItem.value);
        total += precio * cantidad;
    }

    total = total * (1 - descuentoAplicado);

    total = Math.round(total * 100) / 100;

    document.getElementsByClassName('carrito-precio-total')[0].innerText = '$' + total.toLocaleString("es") + ",00";
}

let numeroObjetivo;
let intentosRestantes = 3;
let descuento = 0;

function sorteo() {
    numeroObjetivo = Math.floor(Math.random() * 10) + 1;

    intentosRestantes = 3;
    descuento = 0;

    alert("¡Bienvenido al sorteo! Tienes 3 intentos para adivinar un número del 1 al 10 y ganar un 20% de descuento.");

    realizarIntento();
}

function realizarIntento() {
    if (intentosRestantes > 0) {
        let intento = parseInt(prompt("Intento " + (4 - intentosRestantes) + ": Ingresa un número del 1 al 10:"));

        if (!isNaN(intento) && intento >= 1 && intento <= 10) {
            if (intento === numeroObjetivo) {
                descuento = 20;
                alert("¡Felicidades! Adivinaste el número " + numeroObjetivo + " y ganaste un 20% de descuento. El código es: SNEAKER20");
            } else {
                alert("Intento incorrecto. ¡Sigue intentando!");
                intentosRestantes--;
                realizarIntento();
            }
        } else {
            alert("Por favor, ingresa un número válido del 1 al 10.");
            realizarIntento();
        }
    } else {
        alert("¡Se han agotado tus intentos! El número objetivo era " + numeroObjetivo + ". Tu descuento es del " + descuento + "%.");
    }
}

document.getElementById("sorteo-button").addEventListener("click", sorteo);

const codigoDescuentoValido = "SNEAKER20";

let descuentoAplicado = 0;

document.getElementById("aplicarDescuento").addEventListener("click", aplicarDescuento);

function aplicarDescuento() {
    const codigoIngresado = document.getElementById("codigoDescuento").value;
    if (codigoIngresado === codigoDescuentoValido) {
        descuentoAplicado = 0.20;
        actualizarTotalCarrito();
        Swal.fire(
            'Código de descuento aplicado con éxito!',
            '20% de descuento',
            'success'
        );
    } else {
        Swal.fire(
            'Código de descuento no valido. Inténtalo de nuevo!',
            '',
            'error'
        );
    }
}

function aumentarCantidadEnLocalStorage() {
    let cantidad = obtenerCantidadDelLocalStorage();
    
    cantidad++;
    
    guardarCantidadEnLocalStorage(cantidad);
}

function disminuirCantidadEnLocalStorage() {
    let cantidad = obtenerCantidadDelLocalStorage();
    
    if (cantidad > 0) {
        cantidad--;
    }
    
    guardarCantidadEnLocalStorage(cantidad);
}

function obtenerCantidadDelLocalStorage() {
    let cantidad = localStorage.getItem('carritoCantidad');
 
    if (!cantidad) {
        cantidad = 0;
    }
    return parseInt(cantidad);
}

function guardarCantidadEnLocalStorage(cantidad) {
    localStorage.setItem('carritoCantidad', cantidad);
}

window.addEventListener('load', function () {
    let cantidad = obtenerCantidadDelLocalStorage();
    if (cantidad > 0) {
        document.getElementById('contador-carrito').textContent = cantidad;
    }
});