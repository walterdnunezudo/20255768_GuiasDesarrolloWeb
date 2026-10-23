// ===== Datos =====
const pedidos = [];
let precioFiltro = null; // null = sin filtro activo

// ===== Procesamiento de datos (sin tocar el HTML) =====
function validarPedido(producto, precio, cantidad) {
  const reglas = [
    { valido: producto.trim() !== "", mensaje: "El nombre del producto no puede estar vacío." },
    { valido: Number.isFinite(precio) && precio > 0, mensaje: "El precio debe ser mayor que cero." },
    { valido: Number.isInteger(cantidad) && cantidad > 0, mensaje: "La cantidad debe ser un número entero positivo." }
  ];
  return reglas.filter(regla => !regla.valido).map(regla => regla.mensaje);
}

function crearPedido(producto, precio, cantidad) {
  return { producto: producto.trim(), precio, cantidad };
}

const calcularSubtotal = pedido => pedido.precio * pedido.cantidad;

const filtrarPorPrecioMaximo = (lista, maximo) =>
  lista.filter(pedido => pedido.precio <= maximo);

const calcularTotalUnidades = lista =>
  lista.reduce((total, pedido) => total + pedido.cantidad, 0);

const calcularMontoTotal = lista =>
  lista.reduce((total, pedido) => total + calcularSubtotal(pedido), 0);

const formatearMoneda = valor => `$${valor.toFixed(2)}`;

// ===== Actualización de elementos HTML =====
const inputProducto = document.querySelector("#producto");
const inputPrecio = document.querySelector("#precio");
const inputCantidad = document.querySelector("#cantidad");
const inputPrecioMaximo = document.querySelector("#precioMaximo");
const cuerpoTabla = document.querySelector("#cuerpoTabla");
const totalUnidades = document.querySelector("#totalUnidades");
const montoTotal = document.querySelector("#montoTotal");
const mensajeError = document.querySelector("#mensajeError");

function crearFila(pedido) {
  const fila = document.createElement("tr");
  const celdas = [
    pedido.producto,
    formatearMoneda(pedido.precio),
    pedido.cantidad,
    formatearMoneda(calcularSubtotal(pedido))
  ].map(valor => {
    const celda = document.createElement("td");
    celda.textContent = valor;
    return celda;
  });
  fila.append(...celdas);
  return fila;
}

function mostrarErrores(errores) {
  mensajeError.innerHTML = errores.join("<br>");
  mensajeError.classList.toggle("d-none", errores.length === 0);
}

function limpiarFormulario() {
  inputProducto.value = "";
  inputPrecio.value = "";
  inputCantidad.value = "";
}

function actualizarVista() {
  // El filtro solo afecta lo que se muestra; el arreglo original no se modifica
  const visibles = precioFiltro === null
    ? pedidos
    : filtrarPorPrecioMaximo(pedidos, precioFiltro);

  cuerpoTabla.replaceChildren(...visibles.map(crearFila));
  totalUnidades.textContent = calcularTotalUnidades(pedidos);
  montoTotal.textContent = formatearMoneda(calcularMontoTotal(pedidos));
}

// ===== Manejadores de eventos =====
function agregarPedido() {
  const producto = inputProducto.value;
  const precio = Number(inputPrecio.value);
  const cantidad = Number(inputCantidad.value);

  const errores = validarPedido(producto, precio, cantidad);
  mostrarErrores(errores);
  if (errores.length > 0) return;

  pedidos.push(crearPedido(producto, precio, cantidad));
  limpiarFormulario();
  actualizarVista();
}

function filtrarProductos() {
  const valor = inputPrecioMaximo.value;
  const maximo = Number(valor);

  if (valor === "" || !Number.isFinite(maximo) || maximo < 0) {
    mostrarErrores(["Ingrese un precio máximo válido (número mayor o igual a cero)."]);
    return;
  }

  mostrarErrores([]);
  precioFiltro = maximo;
  actualizarVista();
}

function mostrarTodos() {
  mostrarErrores([]);
  precioFiltro = null;
  inputPrecioMaximo.value = "";
  actualizarVista();
}

function limpiarPedidos() {
  pedidos.length = 0;
  mostrarTodos();
}

document.querySelector("#btnAgregar").addEventListener("click", agregarPedido);
document.querySelector("#btnFiltrar").addEventListener("click", filtrarProductos);
document.querySelector("#btnMostrarTodos").addEventListener("click", mostrarTodos);
document.querySelector("#btnLimpiar").addEventListener("click", limpiarPedidos);
