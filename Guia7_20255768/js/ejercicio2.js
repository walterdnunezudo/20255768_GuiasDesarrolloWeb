const URL_BASE = "https://football-highlights-api.p.rapidapi.com";
const HOST_API = "football-highlights-api.p.rapidapi.com";
const LIMITE = 20;

const inputApiKey = document.getElementById("idApiKey");
const buttonCargar = document.getElementById("idBtnCargar");
const buttonAnterior = document.getElementById("idBtnAnterior");
const buttonSiguiente = document.getElementById("idBtnSiguiente");
const infoPaginacion = document.getElementById("idInfoPaginacion");

const mensaje = document.getElementById("idMensaje");
const listado = document.getElementById("idListado");

const modal = new bootstrap.Modal(document.getElementById("idModal"), {});
const bodyModal = document.getElementById("idBodyModal");

let offsetActual = 0;
let totalLigas = 0;

const limpiarContenedor = function (contenedor) {
  while (contenedor.firstChild) {
    contenedor.removeChild(contenedor.firstChild);
  }
};

const mostrarCargando = function (contenedor, texto) {
  limpiarContenedor(contenedor);

  const caja = document.createElement("div");
  caja.setAttribute("class", "d-flex justify-content-center align-items-center gap-2 py-4");

  const spinner = document.createElement("div");
  spinner.setAttribute("class", "spinner-border text-primary");
  spinner.setAttribute("role", "status");

  const textoCarga = document.createElement("span");
  textoCarga.textContent = texto;

  caja.appendChild(spinner);
  caja.appendChild(textoCarga);
  contenedor.appendChild(caja);
};

const mostrarError = function (contenedor, texto) {
  limpiarContenedor(contenedor);

  const alerta = document.createElement("div");
  alerta.setAttribute("class", "alert alert-danger");
  alerta.setAttribute("role", "alert");
  alerta.textContent = texto;

  contenedor.appendChild(alerta);
};

const obtenerMensajeError = function (error) {
  if (error.status == 401 || error.status == 403) {
    return "La API Key es incorrecta o no tiene una suscripción activa a la API";
  }
  if (error.status == 429) {
    return "Se superó el límite de solicitudes del plan, intente más tarde";
  }
  if (error.status == 400) {
    return "La solicitud no es válida (error 400)";
  }
  if (error.status >= 500) {
    return `El servidor de la API respondió con un error (${error.status})`;
  }
  if (error.status) {
    return `La API respondió con el estado ${error.status}`;
  }
  return "No se pudo conectar con la API, verifique su conexión a internet";
};

const solicitarApi = async function (ruta) {
  const apiKey = inputApiKey.value.trim();

  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": HOST_API,
    },
  });

  if (!respuesta.ok) {
    const error = new Error(`Estado ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }

  return await respuesta.json();
};

const crearTarjetaLiga = function (liga) {
  const columna = document.createElement("div");
  columna.setAttribute("class", "col-sm-6 col-md-4 col-lg-3");

  const tarjeta = document.createElement("div");
  tarjeta.setAttribute("class", "card h-100 text-center");

  const cuerpo = document.createElement("div");
  cuerpo.setAttribute("class", "card-body d-flex flex-column align-items-center");

  if (liga.logo) {
    const logo = document.createElement("img");
    logo.setAttribute("src", liga.logo);
    logo.setAttribute("alt", liga.name);
    logo.setAttribute("height", "64");
    logo.setAttribute("class", "mb-3");
    cuerpo.appendChild(logo);
  }

  const titulo = document.createElement("h5");
  titulo.setAttribute("class", "card-title");
  titulo.textContent = liga.name;

  const pais = document.createElement("p");
  pais.setAttribute("class", "card-text text-muted");
  pais.textContent = liga.country ? liga.country.name : "";

  const boton = document.createElement("button");
  boton.setAttribute("type", "button");
  boton.setAttribute("class", "btn btn-outline-primary mt-auto");
  boton.textContent = "Ver detalle";
  boton.onclick = () => {
    cargarDetalle(liga.id);
  };

  cuerpo.appendChild(titulo);
  cuerpo.appendChild(pais);
  cuerpo.appendChild(boton);
  tarjeta.appendChild(cuerpo);
  columna.appendChild(tarjeta);

  return columna;
};

const actualizarPaginacion = function (cantidad) {
  const desde = cantidad > 0 ? offsetActual + 1 : 0;
  const hasta = offsetActual + cantidad;
  infoPaginacion.textContent = `Mostrando ${desde} - ${hasta} de ${totalLigas}`;
  buttonAnterior.disabled = offsetActual == 0;
  buttonSiguiente.disabled = offsetActual + LIMITE >= totalLigas;
};

const cargarLigas = async function () {
  if (inputApiKey.value.trim() == "") {
    mostrarError(mensaje, "Debe ingresar su API Key de RapidAPI");
    inputApiKey.focus();
    return;
  }

  limpiarContenedor(listado);
  limpiarContenedor(mensaje);
  mostrarCargando(mensaje, "Cargando ligas...");
  buttonCargar.disabled = true;
  buttonAnterior.disabled = true;
  buttonSiguiente.disabled = true;

  try {
    const datos = await solicitarApi(`/leagues?limit=${LIMITE}&offset=${offsetActual}`);
    const ligas = datos.data || [];
    totalLigas = datos.pagination ? datos.pagination.totalCount : ligas.length;

    limpiarContenedor(mensaje);

    if (ligas.length == 0) {
      mostrarError(mensaje, "No se encontraron ligas para mostrar");
    }

    for (const liga of ligas) {
      listado.appendChild(crearTarjetaLiga(liga));
    }

    actualizarPaginacion(ligas.length);
  } catch (error) {
    mostrarError(mensaje, obtenerMensajeError(error));
    infoPaginacion.textContent = "";
  } finally {
    buttonCargar.disabled = false;
  }
};

const crearDetalleLiga = function (liga) {
  const contenedor = document.createElement("div");
  contenedor.setAttribute("class", "text-center");

  if (liga.logo) {
    const logo = document.createElement("img");
    logo.setAttribute("src", liga.logo);
    logo.setAttribute("alt", liga.name);
    logo.setAttribute("height", "96");
    logo.setAttribute("class", "mb-3");
    contenedor.appendChild(logo);
  }

  const nombre = document.createElement("h4");
  nombre.textContent = liga.name;
  contenedor.appendChild(nombre);

  const id = document.createElement("p");
  id.setAttribute("class", "text-muted");
  id.textContent = `ID de la liga: ${liga.id}`;
  contenedor.appendChild(id);

  if (liga.country) {
    const pais = document.createElement("p");
    pais.setAttribute("class", "fw-bold");
    pais.textContent = `${liga.country.name} (${liga.country.code})`;
    contenedor.appendChild(pais);
  }

  const temporadas = liga.seasons || [];
  const tituloTemporadas = document.createElement("p");
  tituloTemporadas.setAttribute("class", "mb-2");
  tituloTemporadas.textContent = `Temporadas disponibles: ${temporadas.length}`;
  contenedor.appendChild(tituloTemporadas);

  const listaTemporadas = document.createElement("div");
  listaTemporadas.setAttribute("class", "d-flex flex-wrap justify-content-center gap-1");
  for (const temporada of temporadas) {
    const etiqueta = document.createElement("span");
    etiqueta.setAttribute("class", "badge text-bg-secondary");
    etiqueta.textContent = temporada.season;
    listaTemporadas.appendChild(etiqueta);
  }
  contenedor.appendChild(listaTemporadas);

  return contenedor;
};

const cargarDetalle = async function (idLiga) {
  mostrarCargando(bodyModal, "Cargando detalle...");
  modal.show();

  try {
    const datos = await solicitarApi(`/leagues/${idLiga}`);
    const liga = Array.isArray(datos) ? datos[0] : datos;

    limpiarContenedor(bodyModal);

    if (!liga) {
      mostrarError(bodyModal, "No se encontró información de la liga");
      return;
    }

    bodyModal.appendChild(crearDetalleLiga(liga));
  } catch (error) {
    mostrarError(bodyModal, obtenerMensajeError(error));
  }
};

buttonCargar.onclick = () => {
  offsetActual = 0;
  cargarLigas();
};

buttonAnterior.onclick = () => {
  offsetActual = Math.max(0, offsetActual - LIMITE);
  cargarLigas();
};

buttonSiguiente.onclick = () => {
  offsetActual = offsetActual + LIMITE;
  cargarLigas();
};
