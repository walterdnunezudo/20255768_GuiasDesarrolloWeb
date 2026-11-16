const formulario = document.forms["frmRegistro"];
const button = formulario.elements["btnRegistro"];

const modal = new bootstrap.Modal(document.getElementById("idModal"), {});
const tituloModal = document.getElementById("modalLabel");
const bodyModal = document.getElementById("idBodyModal");

const inputNombre = document.getElementById("idNombre");
const inputApellidos = document.getElementById("idApellidos");
const inputFechaNac = document.getElementById("idFechaNac");
const inputCorreo = document.getElementById("idCorreo");
const inputPassword = document.getElementById("idPassword");
const inputPasswordRepetir = document.getElementById("idPasswordRepetir");
const cmbPais = document.getElementById("idCmPais");
const inputArchivo = document.getElementById("idArchivo");

const expresionCorreo = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const limpiarErrores = function () {
  const invalidos = formulario.querySelectorAll(".is-invalid");
  for (const elemento of invalidos) {
    elemento.classList.remove("is-invalid");
  }
};

const limpiarModal = function () {
  while (bodyModal.firstChild) {
    bodyModal.removeChild(bodyModal.firstChild);
  }
};

const fechaActual = function () {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
};

const registrarError = function (errores, mensaje, elementos) {
  errores.push(mensaje);
  for (const elemento of elementos) {
    elemento.classList.add("is-invalid");
  }
};

const validarFormulario = function () {
  const errores = [];

  if (inputNombre.value.trim() == "") {
    registrarError(errores, "El campo nombres no puede estar vacío", [
      inputNombre,
    ]);
  }

  if (inputApellidos.value.trim() == "") {
    registrarError(errores, "El campo apellidos no puede estar vacío", [
      inputApellidos,
    ]);
  }

  if (inputFechaNac.value == "") {
    registrarError(errores, "El campo fecha de nacimiento no puede estar vacío", [
      inputFechaNac,
    ]);
  } else if (inputFechaNac.value > fechaActual()) {
    registrarError(
      errores,
      "La fecha de nacimiento no puede ser mayor a la fecha actual",
      [inputFechaNac]
    );
  }

  if (inputCorreo.value.trim() == "") {
    registrarError(errores, "El campo correo electrónico no puede estar vacío", [
      inputCorreo,
    ]);
  } else if (!expresionCorreo.test(inputCorreo.value.trim())) {
    registrarError(errores, "El correo electrónico no tiene un formato válido", [
      inputCorreo,
    ]);
  }

  if (inputPassword.value == "") {
    registrarError(errores, "El campo contraseña no puede estar vacío", [
      inputPassword,
    ]);
  }

  if (inputPasswordRepetir.value == "") {
    registrarError(errores, "El campo repetir contraseña no puede estar vacío", [
      inputPasswordRepetir,
    ]);
  }

  if (
    inputPassword.value != "" &&
    inputPasswordRepetir.value != "" &&
    inputPassword.value != inputPasswordRepetir.value
  ) {
    registrarError(errores, "Las contraseñas no coinciden", [
      inputPassword,
      inputPasswordRepetir,
    ]);
  }

  const intereses = formulario.querySelectorAll('input[type="checkbox"]');
  const interesesMarcados = formulario.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  if (interesesMarcados.length == 0) {
    registrarError(errores, "Debe seleccionar al menos un interes", intereses);
  }

  const carreras = formulario.querySelectorAll('input[type="radio"]');
  const carreraMarcada = formulario.querySelector('input[type="radio"]:checked');
  if (carreraMarcada == null) {
    registrarError(errores, "Debe seleccionar una carrera", carreras);
  }

  if (cmbPais.selectedIndex == 0) {
    registrarError(errores, "Debe seleccionar un país de origen", [cmbPais]);
  }

  return errores;
};

const mostrarErrores = function (errores) {
  tituloModal.textContent = "Datos incorrectos";
  limpiarModal();

  const lista = document.createElement("ul");
  lista.setAttribute("class", "mb-0");

  for (const error of errores) {
    const item = document.createElement("li");
    item.appendChild(document.createTextNode(error));
    lista.appendChild(item);
  }

  bodyModal.appendChild(lista);
  modal.show();
};

const crearFila = function (campo, valor) {
  const fila = document.createElement("tr");

  const celdaCampo = document.createElement("th");
  celdaCampo.setAttribute("scope", "row");
  celdaCampo.appendChild(document.createTextNode(campo));

  const celdaValor = document.createElement("td");
  celdaValor.appendChild(document.createTextNode(valor));

  fila.appendChild(celdaCampo);
  fila.appendChild(celdaValor);

  return fila;
};

const mostrarDatos = function () {
  tituloModal.textContent = "Datos registrados";
  limpiarModal();

  const intereses = [];
  const interesesMarcados = formulario.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  for (const interes of interesesMarcados) {
    intereses.push(interes.labels[0].textContent);
  }

  const carrera = formulario.querySelector('input[type="radio"]:checked')
    .labels[0].textContent;
  const pais = cmbPais.options[cmbPais.selectedIndex].text;
  const avatar =
    inputArchivo.files.length > 0 ? inputArchivo.files[0].name : "Sin imagen";
  const fechaNacimiento = inputFechaNac.value.split("-").reverse().join("/");

  const contenedor = document.createElement("div");
  contenedor.setAttribute("class", "table-responsive");

  const tabla = document.createElement("table");
  tabla.setAttribute("class", "table table-striped table-bordered mb-0");

  const encabezado = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  const tituloCampo = document.createElement("th");
  tituloCampo.setAttribute("scope", "col");
  tituloCampo.appendChild(document.createTextNode("Campo"));
  const tituloValor = document.createElement("th");
  tituloValor.setAttribute("scope", "col");
  tituloValor.appendChild(document.createTextNode("Valor"));
  filaEncabezado.appendChild(tituloCampo);
  filaEncabezado.appendChild(tituloValor);
  encabezado.appendChild(filaEncabezado);

  const cuerpo = document.createElement("tbody");
  cuerpo.appendChild(crearFila("Nombres", inputNombre.value.trim()));
  cuerpo.appendChild(crearFila("Apellidos", inputApellidos.value.trim()));
  cuerpo.appendChild(crearFila("Fecha nacimiento", fechaNacimiento));
  cuerpo.appendChild(crearFila("Correo electrónico", inputCorreo.value.trim()));
  cuerpo.appendChild(
    crearFila("Contraseña", "*".repeat(inputPassword.value.length))
  );
  cuerpo.appendChild(crearFila("Intereses", intereses.join(", ")));
  cuerpo.appendChild(crearFila("Carrera", carrera));
  cuerpo.appendChild(crearFila("País de origen", pais));
  cuerpo.appendChild(crearFila("Avatar", avatar));

  tabla.appendChild(encabezado);
  tabla.appendChild(cuerpo);
  contenedor.appendChild(tabla);
  bodyModal.appendChild(contenedor);

  modal.show();
};

button.onclick = () => {
  limpiarErrores();
  const errores = validarFormulario();

  if (errores.length > 0) {
    mostrarErrores(errores);
  } else {
    mostrarDatos();
  }
};
