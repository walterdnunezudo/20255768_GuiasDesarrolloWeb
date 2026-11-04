const expresiones = {
  carnet: /^[A-Za-z]{2}[0-9]{3}$/,
  nombre: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/,
  dui: /^[0-9]{8}-[0-9]$/,
  nit: /^[0-9]{4}-[0-9]{6}-[0-9]{3}-[0-9]$/,
  fecha: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/[0-9]{4}$/,
  correo: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  edad: /^[0-9]{1,3}$/,
};

const campos = {
  carnet: document.getElementById("idTxtCarnet"),
  nombre: document.getElementById("idTxtNombre"),
  dui: document.getElementById("idTxtDui"),
  nit: document.getElementById("idTxtNit"),
  fecha: document.getElementById("idTxtFecha"),
  correo: document.getElementById("idTxtCorreo"),
  edad: document.getElementById("idTxtEdad"),
};

const botonValidar = document.getElementById("idBtnValidar");
const botonLimpiar = document.getElementById("idBtnLimpiar");
const resultado = document.getElementById("idDivResultado");

const validarCampo = (nombreCampo) => {
  const input = campos[nombreCampo];
  const valido = expresiones[nombreCampo].test(input.value.trim());

  input.classList.toggle("is-valid", valido);
  input.classList.toggle("is-invalid", !valido);

  return valido;
};

const validarFormulario = function () {
  let todosValidos = true;

  for (let nombreCampo in campos) {
    if (!validarCampo(nombreCampo)) {
      todosValidos = false;
    }
  }

  if (todosValidos) {
    resultado.innerHTML = `<div class="alert alert-success" role="alert">Todos los datos ingresados son válidos</div>`;
  } else {
    resultado.innerHTML = `<div class="alert alert-danger" role="alert">Existen datos con un formato incorrecto</div>`;
  }
};

const limpiarFormulario = () => {
  for (let nombreCampo in campos) {
    campos[nombreCampo].value = "";
    campos[nombreCampo].classList.remove("is-valid", "is-invalid");
  }

  resultado.innerHTML = "";
  campos.carnet.focus();
};

for (let nombreCampo in campos) {
  campos[nombreCampo].addEventListener("input", () => {
    validarCampo(nombreCampo);
  });
}

botonValidar.addEventListener("click", validarFormulario);
botonLimpiar.addEventListener("click", limpiarFormulario);
