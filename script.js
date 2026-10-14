/* =====================================================
   Café Origen Huila · MVP
   ===================================================== */

// ============ PASO 4: Establecer el precio ============
// Tres precios, uno por cada molienda (puedes cambiarlos aquí)
const PRECIOS = {
  "Grano entero": 65000,
  "Molido medio": 67000,
  "Molido fino": 68000,
};

// Perfil en taza de cada molienda (valores de referencia, de 1 a 10)
const PERFILES = {
  "Grano entero": {
    acidez: 7, dulzor: 8, cuerpo: 6,
    ayuda: "Ideal para moler en casa justo antes de preparar.",
    nota: "Es el perfil más fresco y aromático: acidez brillante y un dulzor limpio.",
  },
  "Molido medio": {
    acidez: 6, dulzor: 8, cuerpo: 7,
    ayuda: "Pensado para cafetera de filtro, prensa francesa y greca.",
    nota: "Más equilibrado: acidez suave, dulzor marcado y un cuerpo un poco más lleno.",
  },
  "Molido fino": {
    acidez: 5, dulzor: 7, cuerpo: 9,
    ayuda: "Pensado para espresso y moka.",
    nota: "Más intenso: menos acidez y un cuerpo denso, con final amargo-dulce.",
  },
};

let molienda = "Grano entero";
const precioNuestro = () => PRECIOS[molienda];

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const $ = (id) => document.getElementById(id);

// Guardado seguro en el navegador (puede fallar en modo privado)
function guardar(clave, valor) { try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) {} }
function leer(clave, defecto) {
  try { const v = localStorage.getItem(clave); return v ? JSON.parse(v) : defecto; } catch (e) { return defecto; }
}

// ============ Precios reales de la competencia ============
// Fuente: Farmatodo, consultado el 14 de octubre de 2026
const COMPETIDORES = {
  juanValdez: { clave: "juan", nombre: "Juan Valdez", gramos: 454, precioLista: 53450 },
  selloRojo: { clave: "sello", nombre: "Sello Rojo", gramos: 500, precioLista: 25500 },
};

// Convierte cualquier bolsa a su equivalente por 500 g
function precioPor500(c) {
  return Math.round((c.precioLista * 500) / c.gramos);
}

// ============ PASO 5: Comparar precios ============
// Función que simula una API: responde con un pequeño retraso
function compararPreciosCafe() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        juanValdez: precioPor500(COMPETIDORES.juanValdez),
        selloRojo: precioPor500(COMPETIDORES.selloRojo),
      });
    }, 300);
  });
}

// ============ PASO 7: Calcular el ahorro ============
function calcularAhorro(precioCompetidor) {
  return precioCompetidor - precioNuestro(); // positivo = ahorras con nosotros
}

function pintarAhorro(elemento, diferencia) {
  elemento.classList.remove("ganamos", "perdemos");
  if (diferencia > 0) {
    elemento.textContent = `Ahorras ${formatoCOP.format(diferencia)} con nosotros`;
    elemento.classList.add("ganamos");
  } else if (diferencia < 0) {
    elemento.textContent = `Cuesta ${formatoCOP.format(Math.abs(diferencia))} menos que nosotros`;
    elemento.classList.add("perdemos");
  } else {
    elemento.textContent = "Mismo precio";
  }
}

// ============ PASO 8: Mostrar alerta ============
function actualizarAlerta(precios) {
  const alerta = $("alerta");
  const bajan = [];
  if (precios.juanValdez < precioNuestro()) bajan.push("Juan Valdez");
  if (precios.selloRojo < precioNuestro()) bajan.push("Sello Rojo");

  if (bajan.length > 0) {
    alerta.textContent = `${bajan.join(" y ")} ${bajan.length > 1 ? "cuestan" : "cuesta"} menos que nuestro café ${molienda.toLowerCase()} (${formatoCOP.format(precioNuestro())} por 500 g).`;
    alerta.hidden = false;
  } else {
    alerta.hidden = true;
  }
}

// ============ Pintar la comparación ============
const ultimosPrecios = {};
let datosActuales = null;

function pintarFila(nombre, precio) {
  const c = COMPETIDORES[nombre];
  const k = c.clave;
  const fila = $(`fila-${k}`);

  $(`lista-${k}`).textContent = `${formatoCOP.format(c.precioLista)} (${c.gramos} g)`;
  $(`monto-${k}`).textContent = formatoCOP.format(precio);
  pintarAhorro($(`ahorro-${k}`), calcularAhorro(precio));

  const masBarato = precio < precioNuestro();
  fila.classList.toggle("mas-barato", masBarato);
  fila.classList.toggle("nosotros-ganamos", !masBarato);

  // Aviso si el precio cambió respecto a la consulta anterior
  const tend = $(`tend-${k}`);
  const anterior = ultimosPrecios[k];
  tend.classList.remove("sube", "baja");
  if (anterior !== undefined && precio !== anterior) {
    const sube = precio > anterior;
    tend.textContent = `${sube ? "Subió" : "Bajó"} ${formatoCOP.format(Math.abs(precio - anterior))} desde la última consulta`;
    tend.classList.add(sube ? "sube" : "baja");
  }
  ultimosPrecios[k] = precio;
}

function pintarBarras(precios) {
  const maximo = Math.max(precioNuestro(), precios.juanValdez, precios.selloRojo) * 1.04;
  $("bar-nuestro").style.width = `${(precioNuestro() / maximo) * 100}%`;
  $("bar-juan").style.width = `${(precios.juanValdez / maximo) * 100}%`;
  $("bar-sello").style.width = `${(precios.selloRojo / maximo) * 100}%`;
}

function pintarPrecios(precios) {
  datosActuales = precios;
  $("monto-nuestro").textContent = formatoCOP.format(precioNuestro());
  $("lista-nuestro").textContent = `${formatoCOP.format(precioNuestro())} (500 g)`;
  $("detalle-nuestro").textContent = `${molienda}, bolsa de 500 g`;

  pintarFila("juanValdez", precios.juanValdez);
  pintarFila("selloRojo", precios.selloRojo);
  actualizarAlerta(precios);
  pintarBarras(precios);
}

// ============ PASO 6: Volver a consultar cada 8 segundos ============
const INTERVALO_SEGUNDOS = 8;

async function refrescar() {
  const precios = await compararPreciosCafe();
  pintarPrecios(precios);
  $("ultima-consulta").textContent = new Date().toLocaleTimeString("es-CO");
}

let restante = INTERVALO_SEGUNDOS;
setInterval(() => {
  restante -= 1;
  if (restante <= 0) {
    refrescar();
    restante = INTERVALO_SEGUNDOS;
  }
  $("contador").textContent = restante;
}, 1000);

// ============ Detalle desplegable de cada marca ============
document.querySelectorAll(".detalle-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const panel = $(btn.getAttribute("aria-controls"));
    const abierto = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!abierto));
    btn.textContent = abierto ? "Ver detalle" : "Ocultar detalle";
    panel.classList.toggle("abierto", !abierto);
    panel.inert = abierto;
  });
});

// ============ Aviso emergente ============
let temporizadorAviso;
function mostrarAviso(texto) {
  const aviso = $("aviso");
  aviso.textContent = texto;
  aviso.classList.add("visible");
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 2800);
}

// ============ Producto: molienda, precio y perfil en taza ============
let cantidadSelector = 1;

function pintarProducto() {
  const perfil = PERFILES[molienda];

  // Precio y texto de apoyo
  $("precio-nuestro").textContent = formatoCOP.format(precioNuestro());
  $("precio-detalle").textContent = `por bolsa de 500 g, ${molienda.toLowerCase()}`;
  $("ayuda-molienda").textContent = perfil.ayuda;

  // Perfil en taza: cada molienda tiene sus propios valores
  ["acidez", "dulzor", "cuerpo"].forEach((rasgo) => {
    $(`m-${rasgo}`).style.setProperty("--v", perfil[rasgo]);
    $(`v-${rasgo}`).textContent = `${perfil[rasgo]}/10`;
  });
  $("perfil-nota").textContent = perfil.nota;

  // El comparador usa el precio de la molienda elegida
  if (datosActuales) pintarPrecios(datosActuales);
}

// Precio dentro de cada botón de molienda
document.querySelectorAll("#molienda .segmento").forEach((btn) => {
  btn.querySelector(".seg-precio").textContent = formatoCOP.format(PRECIOS[btn.dataset.valor]);

  btn.addEventListener("click", () => {
    document.querySelectorAll("#molienda .segmento").forEach((b) => {
      b.classList.remove("activa");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("activa");
    btn.setAttribute("aria-pressed", "true");
    molienda = btn.dataset.valor;
    pintarProducto();
  });
});

$("menos").addEventListener("click", () => {
  cantidadSelector = Math.max(1, cantidadSelector - 1);
  $("cantidad-selector").textContent = cantidadSelector;
});
$("mas").addEventListener("click", () => {
  cantidadSelector = Math.min(20, cantidadSelector + 1);
  $("cantidad-selector").textContent = cantidadSelector;
});

// ============ PASO 9: Carrito ============
// Una línea por cada molienda elegida, cada una con su precio
let carrito = leer("cafeHuilaCarrito", { lineas: [], cupon: false });
carrito.lineas = carrito.lineas.filter((l) => PRECIOS[l.molienda] !== undefined);

function guardarCarrito() { guardar("cafeHuilaCarrito", carrito); }
function totalUnidades() { return carrito.lineas.reduce((s, l) => s + l.cantidad, 0); }
function subtotalCarrito() { return carrito.lineas.reduce((s, l) => s + l.cantidad * PRECIOS[l.molienda], 0); }

function añadirAlCarrito() {
  const existente = carrito.lineas.find((l) => l.molienda === molienda);
  if (existente) existente.cantidad = Math.min(99, existente.cantidad + cantidadSelector);
  else carrito.lineas.push({ molienda, cantidad: cantidadSelector });
  guardarCarrito();
  pintarCarrito();

  const contador = $("contador-carrito");
  contador.classList.remove("rebote");
  void contador.offsetWidth; // reinicia la animación
  contador.classList.add("rebote");

  const bolsas = cantidadSelector === 1 ? "1 bolsa" : `${cantidadSelector} bolsas`;
  mostrarAviso(`Añadiste ${bolsas} (${molienda.toLowerCase()}) al carrito`);
}
$("btn-anadir").addEventListener("click", añadirAlCarrito);

function cambiarCantidad(mol, delta) {
  const linea = carrito.lineas.find((l) => l.molienda === mol);
  if (!linea) return;
  linea.cantidad += delta;
  if (linea.cantidad <= 0) carrito.lineas = carrito.lineas.filter((l) => l !== linea);
  guardarCarrito();
  pintarCarrito();
}

const BOLSA_MINI = `
  <svg viewBox="0 0 90 110" aria-hidden="true">
    <path d="M16 10 H74 L80 100 H10 Z" fill="#1b372c"/>
    <path d="M16 10 H74 L74.5 18 H15.5 Z" fill="#11251e"/>
    <rect x="20" y="36" width="50" height="50" fill="#e7ebe2"/>
    <path d="M26 66 Q36 52 44 60 T60 54" fill="none" stroke="#b4233c" stroke-width="2"/>
  </svg>`;

function pintarCarrito() {
  const unidades = totalUnidades();
  $("contador-carrito").textContent = unidades;
  const lista = $("carrito-contenido");
  const resumen = $("resumen");

  if (unidades === 0) {
    resumen.hidden = true;
    lista.innerHTML = `
      <div class="vacio">
        <p>Todavía no tienes café en el carrito.</p>
        <a href="#producto" class="boton">Elegir mi café</a>
      </div>`;
    return;
  }

  lista.innerHTML = carrito.lineas.map((l) => `
    <div class="item">
      <div class="item-bolsa">${BOLSA_MINI}</div>
      <div class="item-info">
        <strong>Café especial Origen Huila, 500 g</strong>
        <span>${l.molienda}</span>
        <span>${formatoCOP.format(PRECIOS[l.molienda])} por bolsa</span>
      </div>
      <div class="cantidad" role="group" aria-label="Cantidad de ${l.molienda}">
        <button type="button" data-mol="${l.molienda}" data-d="-1" aria-label="Quitar una bolsa">−</button>
        <span>${l.cantidad}</span>
        <button type="button" data-mol="${l.molienda}" data-d="1" aria-label="Agregar una bolsa">+</button>
      </div>
      <b class="item-total">${formatoCOP.format(l.cantidad * PRECIOS[l.molienda])}</b>
    </div>`).join("");

  lista.querySelectorAll("button[data-mol]").forEach((b) => {
    b.addEventListener("click", () => cambiarCantidad(b.dataset.mol, Number(b.dataset.d)));
  });

  const subtotal = subtotalCarrito();
  const descuento = carrito.cupon ? Math.round(subtotal * 0.1) : 0;
  $("res-subtotal").textContent = formatoCOP.format(subtotal);
  $("fila-descuento").hidden = !carrito.cupon;
  $("res-descuento").textContent = `− ${formatoCOP.format(descuento)}`;
  $("res-total").textContent = formatoCOP.format(subtotal - descuento);
  resumen.hidden = false;
}

$("form-cupon").addEventListener("submit", (e) => {
  e.preventDefault();
  const codigo = $("cupon").value.trim().toUpperCase();
  const msg = $("cupon-msg");
  if (codigo === "HUILA10") {
    carrito.cupon = true;
    guardarCarrito();
    pintarCarrito();
    msg.textContent = "Cupón aplicado. Tienes 10% de descuento.";
    msg.className = "cupon-msg ok";
  } else {
    msg.textContent = "Ese cupón no existe. Revisa el código e inténtalo de nuevo.";
    msg.className = "cupon-msg mal";
  }
});
$("btn-vaciar").addEventListener("click", () => {
  carrito = { lineas: [], cupon: false };
  guardarCarrito();
  pintarCarrito();
  $("cupon").value = "";
  $("cupon-msg").textContent = "Prueba con HUILA10 para un 10% de descuento.";
  $("cupon-msg").className = "cupon-msg";
});
$("btn-pagar").addEventListener("click", () => {
  mostrarAviso("El pago todavía no está conectado. Esta es una versión de prueba.");
});

// ============ Portada: curvas de nivel de la montaña ============
// Dibujamos líneas de altura (como en un mapa topográfico) con dos picos
function dibujarContornos() {
  const svg = $("contornos");
  const picos = [
    { x: 330, y: 300, escala: 1.0, fase: 0.4 },
    { x: 440, y: 380, escala: 0.62, fase: 2.1 },
  ];
  const anillos = 15;
  let html = "";

  for (let i = 1; i <= anillos; i++) {
    picos.forEach((p, idx) => {
      const radio = (i * 19) * p.escala;
      if (radio < 14) return;
      const puntos = [];
      for (let a = 0; a <= 360; a += 4) {
        const t = (a * Math.PI) / 180;
        const r = radio * (1 + 0.14 * Math.sin(3 * t + p.fase + i * 0.12) + 0.07 * Math.sin(5 * t + p.fase * 2) + 0.04 * Math.sin(8 * t + i * 0.2));
        puntos.push([p.x + r * Math.cos(t) * 1.15, p.y + r * Math.sin(t) * 0.92]);
      }
      const d = puntos.map((pt, n) => `${n === 0 ? "M" : "L"}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" ") + " Z";
      const destacada = i % 5 === 0 && idx === 0;
      html += `<path d="${d}" pathLength="1" class="curva${destacada ? " maestra" : ""}" style="--i:${i}"/>`;
    });
  }
  svg.innerHTML = html + `<text x="${picos[0].x + 8}" y="${picos[0].y - 4}" class="cota">1.700 m</text>`;
}

// ============ Inicio ============
dibujarContornos();
pintarProducto();
pintarCarrito();
refrescar();
